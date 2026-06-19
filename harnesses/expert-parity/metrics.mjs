#!/usr/bin/env node
// metrics.mjs — the metrics layer.
//
// Reads results/candidates.json (real model runs) + the reference engine's ground truth and
// computes, per candidate model: exact-verdict accuracy, Cohen's kappa vs the examiner,
// false-pay / false-deny rates, dollar error, per-class (subgroup) accuracy, and seeded
// bootstrap confidence intervals. If results/judges.json exists it folds in the blind A/B
// win/tie/loss + non-inferiority + inter-rater reliability. Writes results/metrics.json and
// prints the tables. Pure function of the saved raw runs — nothing here is hand-entered.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adjudicate } from "./engine.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");
const CLASSES = ["APPROVE", "PARTIAL", "DENY", "REFER"];
const PAYS = new Set(["APPROVE", "PARTIAL"]);

// seeded RNG (mulberry32) so the bootstrap CIs are reproducible.
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function cohenKappa(pred, truth) {
  // pred/truth: parallel arrays of class labels over the SAME items (4 classes).
  const n = pred.length;
  if (!n) return null;
  let agree = 0;
  const mp = {}, mt = {};
  for (const c of CLASSES) { mp[c] = 0; mt[c] = 0; }
  for (let i = 0; i < n; i++) {
    if (pred[i] === truth[i]) agree++;
    mp[pred[i]] = (mp[pred[i]] || 0) + 1;
    mt[truth[i]] = (mt[truth[i]] || 0) + 1;
  }
  const po = agree / n;
  let pe = 0;
  for (const c of CLASSES) pe += (mp[c] / n) * (mt[c] / n);
  return pe === 1 ? 1 : +((po - pe) / (1 - pe)).toFixed(4);
}

function bootstrapCI(items, stat, { B = 2000, seed = 12345 } = {}) {
  const r = rng(seed);
  const n = items.length;
  if (!n) return null;
  const vals = [];
  for (let b = 0; b < B; b++) {
    const sample = [];
    for (let i = 0; i < n; i++) sample.push(items[Math.floor(r() * n)]);
    const s = stat(sample);
    if (s != null && Number.isFinite(s)) vals.push(s);
  }
  vals.sort((a, b) => a - b);
  const q = (p) => vals[Math.min(vals.length - 1, Math.max(0, Math.floor(p * vals.length)))];
  return { lo: +q(0.025).toFixed(4), hi: +q(0.975).toFixed(4) };
}

async function main() {
  const cand = JSON.parse(await readFile(path.join(OUT, "candidates.json"), "utf8"));
  const { cases } = JSON.parse(await readFile(path.join(HERE, "domain/cases.json"), "utf8"));
  const caseById = Object.fromEntries(cases.map((c) => [c.id, c]));
  const truth = Object.fromEntries(cases.map((c) => [c.id, adjudicate(c.facts)]));

  const modelKeys = cand.models.map((m) => m.key);
  const perModel = {};

  for (const mk of modelKeys) {
    const rows = cand.matrix.filter((r) => r.model === mk);
    const scored = rows.filter((r) => CLASSES.includes(r.verdict)); // exclude OTHER
    const other = rows.length - scored.length;

    // per-item record for bootstrap
    const items = scored.map((r) => {
      const gt = truth[r.case];
      return {
        case: r.case, class: caseById[r.case]?.class, red_team: caseById[r.case]?.red_team || null,
        pred: r.verdict, gold: gt.verdict, correct: r.verdict === gt.verdict ? 1 : 0,
        predPays: PAYS.has(r.verdict), goldPays: PAYS.has(gt.verdict),
        predPay: r.payable, goldPay: gt.payable,
      };
    });

    const acc = (arr) => arr.length ? arr.reduce((a, x) => a + x.correct, 0) / arr.length : null;
    const kap = (arr) => cohenKappa(arr.map((x) => x.pred), arr.map((x) => x.gold));

    // false-pay: model would pay when examiner denies/refers. false-deny: model denies a valid claim.
    const falsePay = items.filter((x) => x.predPays && !x.goldPays).length;
    const falseDeny = items.filter((x) => !x.predPays && x.goldPays).length;

    // dollar error on cases where both produced a number
    const dollarRows = items.filter((x) => Number.isFinite(x.predPay));
    const mae = dollarRows.length ? Math.round(dollarRows.reduce((a, x) => a + Math.abs(x.predPay - x.goldPay), 0) / dollarRows.length) : null;
    const exactDollar = dollarRows.filter((x) => x.predPay === x.goldPay).length;

    // subgroup slices by class
    const byClass = {};
    for (const x of items) (byClass[x.class] ||= []).push(x);
    const slices = Object.fromEntries(Object.entries(byClass).map(([k, v]) => [k, { n: v.length, acc: +acc(v).toFixed(3) }]));

    // red-team battery accuracy
    const rt = items.filter((x) => x.red_team);
    perModel[mk] = {
      label: cand.models.find((m) => m.key === mk).label,
      version: cand.models.find((m) => m.key === mk).version,
      n_total: rows.length, n_scored: scored.length, n_other: other,
      accuracy: scored.length ? +acc(items).toFixed(4) : null,
      accuracyCI: bootstrapCI(items, acc),
      kappa: kap(items),
      kappaCI: bootstrapCI(items, kap),
      falsePay, falseDeny,
      dollarMAE: mae, dollarExact: exactDollar, dollarN: dollarRows.length,
      redTeamAcc: rt.length ? +acc(rt).toFixed(3) : null, redTeamN: rt.length,
      slices,
    };
  }

  // rank by kappa (parity with the examiner)
  const ranking = Object.entries(perModel)
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => (b.kappa ?? -2) - (a.kappa ?? -2));

  const out = { generatedNote: "Pure function of results/candidates.json + engine ground truth. Bootstrap seed 12345, B=2000.", n_cases: cases.length, ranking, perModel };

  // fold in blind A/B if present
  if (existsSync(path.join(OUT, "judges.json"))) {
    out.blindAB = summarizeJudges(JSON.parse(await readFile(path.join(OUT, "judges.json"), "utf8")));
  }

  await writeFile(path.join(OUT, "metrics.json"), JSON.stringify(out, null, 2));

  // print
  console.log(`\n=== EXPERT-PARITY: candidate vs reference examiner (${cases.length} claims) ===`);
  console.log("rank  model     κ      acc     falsePay falseDeny  $MAE   other");
  for (const r of ranking) {
    const ci = r.kappaCI ? ` [${r.kappaCI.lo}, ${r.kappaCI.hi}]` : "";
    console.log(`  ${r.key.padEnd(8)} ${String(r.kappa ?? "—").padStart(5)}  ${String(r.accuracy ?? "—").padStart(5)}   ${String(r.falsePay).padStart(6)}   ${String(r.falseDeny).padStart(6)}   ${String(r.dollarMAE ?? "—").padStart(5)}  ${r.n_other}` + ci);
  }
  if (out.blindAB) {
    console.log(`\n=== BLIND A/B vs examiner (candidate: ${out.blindAB.candidate}) ===`);
    console.log(`win/tie/loss = ${out.blindAB.win}/${out.blindAB.tie}/${out.blindAB.loss}  non-inferior(win+tie)=${(100 * out.blindAB.nonInferiorRate).toFixed(0)}%  judge-IRR κ=${out.blindAB.irrKappa ?? "—"}  position-consistency=${out.blindAB.positionConsistency ?? "—"}`);
  }
  console.log(`\nWrote results/metrics.json`);
}

// --- blind A/B summary (from judges.json) ---
function summarizeJudges(j) {
  // j.records: [{case, candidate, judge, pass, better_is_candidate: bool|null(tie)}]
  const primary = j.records.filter((r) => r.pass === 1);
  const tally = { win: 0, tie: 0, loss: 0 };
  for (const r of primary) {
    if (r.better_is_candidate === null) tally.tie++;
    else if (r.better_is_candidate) tally.win++;
    else tally.loss++;
  }
  const n = tally.win + tally.tie + tally.loss;
  const nonInferiorRate = n ? (tally.win + tally.tie) / n : null;

  // inter-rater reliability: two judges on the same (case) pass-1, agreement on win/tie/loss
  const byCase = {};
  for (const r of primary) (byCase[r.case] ||= []).push(r);
  const pairs = Object.values(byCase).filter((a) => a.length >= 2);
  const lab = (r) => (r.better_is_candidate === null ? "tie" : r.better_is_candidate ? "win" : "loss");
  let agree = 0;
  const m1 = {}, m2 = {}; const L = ["win", "tie", "loss"];
  for (const c of L) { m1[c] = 0; m2[c] = 0; }
  for (const p of pairs) { const a = lab(p[0]), b = lab(p[1]); if (a === b) agree++; m1[a]++; m2[b]++; }
  let irrKappa = null;
  if (pairs.length) { const po = agree / pairs.length; let pe = 0; for (const c of L) pe += (m1[c] / pairs.length) * (m2[c] / pairs.length); irrKappa = pe === 1 ? 1 : +((po - pe) / (1 - pe)).toFixed(3); }

  // position-bias / intra-rater consistency: judge0 pass1 vs pass2 (order flipped)
  const p1 = j.records.filter((r) => r.pass === 1 && r.judge === j.repeatJudge);
  const p2 = j.records.filter((r) => r.pass === 2 && r.judge === j.repeatJudge);
  const p2by = Object.fromEntries(p2.map((r) => [r.case, r]));
  let same = 0, tot = 0;
  for (const r of p1) { const o = p2by[r.case]; if (o) { tot++; if (lab(r) === lab(o)) same++; } }
  const positionConsistency = tot ? +(same / tot).toFixed(3) : null;

  return { candidate: j.candidate, judges: j.judges, ...tally, n, nonInferiorRate: nonInferiorRate == null ? null : +nonInferiorRate.toFixed(3), nonInferiorMargin: 0.15, irrKappa, irrPairs: pairs.length, positionConsistency };
}

main().catch((e) => { console.error("metrics failed:", e); process.exit(1); });
