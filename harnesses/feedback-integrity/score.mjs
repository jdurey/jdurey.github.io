#!/usr/bin/env node
// score.mjs — the metrics layer. Turns the three rungs into a per-class graduation verdict.
//
// Reads the golden findings + every rung's output and reports, PER DEFECT CLASS, the four things a
// human-on-the-loop needs to decide whether to stop checking that class by hand:
//   recall        — did the pipeline catch the findings the golden set says are there?
//   noise tripwire — did it flag far more than the golden count (i.e., is it crying wolf)?
//   canary catch  — did it catch the planted, known-broken items?
//   verdict       — READY (graduate to unsupervised) or HOLD (keep a human on this class).
// Graduation is PER CLASS, not an average: an easy class catching everything must not be allowed to
// hide a class that collapsed. So answer-reveal can graduate while option-mismatch is still HOLD.
//
// It also calibrates the cheap semantic rung against the golden adjudication — the agreement rate
// and, specifically, how often it waves a genuinely-broken item through as CLEAN — to back the
// load-bearing rule: trust the cheap model's negatives never, its positives only as candidates.
//
// Pure function of the saved rung outputs + golden. Nothing here is hand-entered.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentTokens } from "./models.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");
const NOISE_K = 2;            // noise tripwire fires if flagged > NOISE_K * golden count
const DEFECT_CLASSES = ["ARF", "GDF", "FOM", "LCU"];

function distinctiveKeyTokens(item) {
  const key = item.options.find((o) => o.correct);
  const keyTok = new Set(contentTokens(key.text));
  const elsewhere = new Set(contentTokens(item.stem));
  for (const o of item.options) if (o !== key) for (const t of contentTokens(o.text)) elsewhere.add(t);
  return [...keyTok].filter((t) => !elsewhere.has(t));
}

const J = async (p) => JSON.parse(await readFile(p, "utf8"));

async function main() {
  const { items } = await J(path.join(HERE, "domain/ledger.json"));
  const golden = await J(path.join(HERE, "golden/findings.json"));
  const itemById = Object.fromEntries(items.map((i) => [i.id, i]));
  const goldFlaw = (id) => golden.items[id]?.flaw;
  const isCanary = (id) => !!golden.items[id]?.canary;

  // ---- gather each rung's detections, keyed by class ----
  const screen = existsSync(path.join(OUT, "screen.json")) ? await J(path.join(OUT, "screen.json")) : { flags: [] };
  const solver = existsSync(path.join(OUT, "solver.json")) ? await J(path.join(OUT, "solver.json")) : { records: [] };
  const semantic = existsSync(path.join(OUT, "semantic.json")) ? await J(path.join(OUT, "semantic.json")) : null;

  const screenByClass = { ARF: new Set(), FOM: new Set(), LCU: new Set() };
  for (const f of screen.flags) screenByClass[f.class]?.add(f.item);

  // solver: a reconstruction "solves" the item iff it names a DISTINCTIVE key token (objective).
  const solverSolved = new Set();
  const solverDetail = {};
  for (const r of solver.records) {
    const item = itemById[r.item];
    if (!item || r.unknown) { solverDetail[r.item] = { solved: false, answer: r.unknown ? "UNKNOWN" : r.answer, matched: [] }; continue; }
    const distinct = new Set(distinctiveKeyTokens(item));
    const matched = [...new Set(contentTokens(r.answer))].filter((t) => distinct.has(t));
    const solved = matched.length >= 1;
    if (solved) solverSolved.add(r.item);
    solverDetail[r.item] = { solved, answer: r.answer, matched };
  }

  const semByClass = { ARF: new Set(), GDF: new Set(), FOM: new Set(), CLEAN: new Set() };
  const semCall = {};
  if (semantic) for (const r of semantic.records) { semCall[r.item] = r.class; if (semByClass[r.class]) semByClass[r.class].add(r.item); }

  // TRUSTED detection per class = OBJECTIVE rungs only (screen + blind-solver). The cheap semantic
  // pass is a PROPOSER: its positives are candidates routed to a human, never auto-counted toward
  // graduation (case study rule: "cheap models propose, they never adjudicate"). So a class with no
  // trusted objective rung (GDF here) cannot graduate on its own — that is the honest outcome.
  const detectedByClass = {
    ARF: union(screenByClass.ARF, solverSolved),
    GDF: union(),
    FOM: union(screenByClass.FOM),
    LCU: union(screenByClass.LCU),
  };
  const rungsByClass = {
    ARF: ["deterministic screen (lexical)", "blind-solver"],
    GDF: ["(no objective rung — cheap semantic pass only proposes candidates for human review)"],
    FOM: ["deterministic screen (identical)"],
    LCU: ["deterministic screen (length)"],
  };

  // ---- per-class scorecard ----
  const perClass = {};
  for (const cls of DEFECT_CLASSES) {
    const goldenItems = items.map((i) => i.id).filter((id) => goldFlaw(id) === cls);
    const detected = [...detectedByClass[cls]];
    const truePos = detected.filter((id) => goldFlaw(id) === cls);
    const falsePos = detected.filter((id) => goldFlaw(id) !== cls);
    const missed = goldenItems.filter((id) => !detectedByClass[cls].has(id));
    const recall = goldenItems.length ? +(truePos.length / goldenItems.length).toFixed(3) : null;
    const noiseTripwire = detected.length > NOISE_K * Math.max(1, goldenItems.length);
    const canaries = goldenItems.filter(isCanary);
    const canariesCaught = canaries.filter((id) => detectedByClass[cls].has(id));
    const canaryOK = canaries.length === canariesCaught.length;
    const ready = recall === 1 && !noiseTripwire && canaryOK;

    // attribution: which TRUSTED rung(s) caught each golden item (semantic shown separately as proposer)
    const caughtBy = {};
    for (const id of goldenItems) {
      const by = [];
      if (screenByClass[cls]?.has(id)) by.push("screen");
      if (cls === "ARF" && solverSolved.has(id)) by.push("solver");
      caughtBy[id] = by;
    }
    const semanticProposed = goldenItems.filter((id) => semByClass[cls]?.has(id)); // candidate-only

    perClass[cls] = {
      rungs: rungsByClass[cls], golden: goldenItems, goldenCount: goldenItems.length,
      detected, truePos, falsePos, missed,
      recall, noiseTripwire, flaggedCount: detected.length, noiseLimit: NOISE_K * Math.max(1, goldenItems.length),
      canaries, canariesCaught, canaryOK,
      verdict: ready ? "READY — graduate to unsupervised" : "HOLD — keep a human on this class",
      caughtBy, semanticProposed,
    };
  }

  // ---- cheap-semantic calibration vs golden adjudication ----
  // map golden flaw to the class the semantic rung is asked for (LCU has no feedback-content defect -> CLEAN).
  let semanticCal = null;
  if (semantic) {
    const expected = (id) => { const f = goldFlaw(id); return f === "clean" || f === "LCU" ? "CLEAN" : f; };
    let agree = 0; const rows = [];
    let defective = 0, waved = 0, posTotal = 0, posCorrect = 0;
    let cleanItems = 0, falseFlagged = 0;
    const labelCounts = { ARF: 0, GDF: 0, FOM: 0, CLEAN: 0 };
    for (const r of semantic.records) {
      const exp = expected(r.item), got = r.class;
      labelCounts[got] = (labelCounts[got] || 0) + 1;
      if (exp === got) agree++;
      if (["ARF", "GDF", "FOM"].includes(exp)) { defective++; if (got === "CLEAN") waved++; }
      if (exp === "CLEAN") { cleanItems++; if (got !== "CLEAN") falseFlagged++; }
      if (got !== "CLEAN") { posTotal++; if (got === exp) posCorrect++; }
      rows.push({ item: r.item, expected: exp, semantic: got, match: exp === got });
    }
    const topLabel = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0];
    const collapsed = topLabel[1] >= Math.ceil(0.9 * semantic.records.length);
    semanticCal = {
      note: "Cheap-model agreement with the golden adjudication. Its positives are candidates, never verdicts; its negatives are never a clean bill of health. The point of these numbers is to justify why.",
      model: semantic.model?.label, n: semantic.records.length, labelCounts,
      agreement: +(agree / semantic.records.length).toFixed(3),
      collapsed, collapsedOnto: collapsed ? topLabel[0] : null,
      wavedThroughRate: defective ? +(waved / defective).toFixed(3) : null, wavedThrough: waved, defectiveItems: defective,
      falseFlagOnCleanRate: cleanItems ? +(falseFlagged / cleanItems).toFixed(3) : null, falseFlagged, cleanItems,
      positivePrecision: posTotal ? +(posCorrect / posTotal).toFixed(3) : null, positives: posTotal,
      rows,
    };
  }

  const out = {
    generatedNote: "Per-class graduation scorecard. Pure function of golden/findings.json + results/{screen,solver,semantic}.json. Graduation is per class; a class is READY only if recall==1, the noise tripwire did not fire, and every canary was caught.",
    params: { NOISE_K }, nItems: items.length,
    classes: perClass, solverDetail, semanticCalibration: semanticCal,
  };
  await writeFile(path.join(OUT, "scores.json"), JSON.stringify(out, null, 2));

  // ---- print ----
  console.log(`\n=== FEEDBACK-INTEGRITY SCORECARD (${items.length} synthetic items) ===\n`);
  console.log("class  golden  recall   flagged(limit)  canary   verdict");
  for (const cls of DEFECT_CLASSES) {
    const p = perClass[cls];
    const noise = p.noiseTripwire ? `${p.flaggedCount}(>${p.noiseLimit}) TRIP` : `${p.flaggedCount}(<=${p.noiseLimit})`;
    console.log(`  ${cls}   ${String(p.goldenCount).padStart(4)}    ${String(p.recall).padStart(5)}   ${noise.padEnd(15)} ${(p.canaryOK ? "ok" : "MISS").padEnd(6)}  ${p.verdict}`);
  }
  console.log(`\n  rung attribution (which rung caught each golden finding):`);
  for (const cls of DEFECT_CLASSES) {
    for (const [id, by] of Object.entries(perClass[cls].caughtBy)) {
      const tag = by.length ? by.join("+") : "MISSED by all rungs";
      const star = (cls === "ARF" && by.length === 1 && by[0] === "solver") ? "   <- screen missed it; blind-solver caught it" : "";
      console.log(`    ${cls} ${id}: ${tag}${star}`);
    }
  }
  if (semanticCal) {
    console.log(`\n  cheap semantic pass vs golden: agreement ${(100 * semanticCal.agreement).toFixed(0)}% · positive precision ${semanticCal.positivePrecision == null ? "—" : (100 * semanticCal.positivePrecision).toFixed(0) + "%"} · false-flagged ${semanticCal.falseFlagged}/${semanticCal.cleanItems} genuinely-clean items`);
    if (semanticCal.collapsed) console.log(`  -> COLLAPSED onto "${semanticCal.collapsedOnto}" (${semanticCal.labelCounts[semanticCal.collapsedOnto]}/${semanticCal.n} items) — the 3B model did not discriminate. Pure candidate noise; never auto-counted.`);
    console.log(`  -> trust its negatives NEVER, its positives only as candidates for human review.`);
  }
  const ready = DEFECT_CLASSES.filter((c) => !perClass[c].verdict.startsWith("HOLD"));
  const hold = DEFECT_CLASSES.filter((c) => perClass[c].verdict.startsWith("HOLD"));
  console.log(`\n  graduated (unsupervised): ${ready.join(", ") || "none"}   ·   still HOLD (human-on-loop): ${hold.join(", ") || "none"}`);
  console.log(`\nWrote results/scores.json`);
}

function union(...sets) { const s = new Set(); for (const x of sets) if (x) for (const v of x) s.add(v); return s; }

main().catch((e) => { console.error("score failed:", e); process.exit(1); });
