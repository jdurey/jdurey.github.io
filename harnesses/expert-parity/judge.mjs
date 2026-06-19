#!/usr/bin/env node
// judge.mjs — BLIND A/B parity protocol.
//
// For each claim, a judge model sees the policy, the claim, and TWO adjudications presented as
// "A" and "B" with identity masked and order randomized (seeded): one is the reference examiner
// (engine), the other is the candidate model. The judge picks the better claims decision (or a
// tie), rates confidence, and tags errors from a fixed taxonomy. Identity masking + matched
// formatting + order randomization are the leakage controls; a second judge gives inter-rater
// reliability; a repeat pass with order flipped on judge[0] measures position bias.
//
// Usage:
//   node judge.mjs                                   # candidate=claude, judges=grok,codex, all cases
//   node judge.mjs --candidate codex --judges grok,claude --sample 16 --repeat grok
//
// Leakage controls: identical formatting for both options, no "engine"/"model"/"AI" tells in the
// reference rationale, randomized A/B order per case (seed 707), masked labels.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODELS, extractJSON, arg } from "./models.mjs";
import { adjudicate, referenceRationale, POLICY } from "./engine.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");
const RAW = path.join(OUT, "raw_judge");

const ERROR_TAXONOMY = ["misread-peril", "missed-exclusion", "ignored-precedence", "math-error", "hallucinated-coverage", "overconfident", "should-have-referred", "none"];

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const fmtUSD = (n) => (n > 0 ? "$" + Number(n).toLocaleString("en-US") : "$0");
function adjText(rationale, verdict, payable) {
  const r = rationale && rationale.trim() ? rationale.trim() : "(no reasoning given.)";
  return `${r} Disposition: ${verdict}. Payable: ${fmtUSD(payable || 0)}.`;
}

function buildJudgePrompt(policy, claim, A, B) {
  return `You are a senior claims adjudication reviewer. Two examiners independently adjudicated the SAME claim under the SAME policy. Decide which adjudication is the better claims decision — correct coverage outcome, correct handling of exclusions/precedence/sub-limits/deductible, and sound reasoning. A genuine tie is allowed.

Reply with ONLY this JSON:
{
  "better": "A" | "B" | "tie",
  "confidence": 1-5,
  "errors_A": [<zero or more of: ${ERROR_TAXONOMY.join(", ")}>],
  "errors_B": [<same taxonomy>],
  "reason": "<one sentence>"
}

===== POLICY =====
${policy}

===== CLAIM =====
${claim}

===== ADJUDICATION A =====
${A}

===== ADJUDICATION B =====
${B}
`;
}

function parseJudge(raw) {
  const j = extractJSON(raw);
  if (!j) return null;
  let b = String(j.better || "").toUpperCase().trim();
  if (b !== "A" && b !== "B") b = "TIE";
  return { better: b, confidence: Number(j.confidence) || null, errors_A: j.errors_A || [], errors_B: j.errors_B || [], reason: String(j.reason || "") };
}

async function main() {
  await mkdir(RAW, { recursive: true });
  const policy = await readFile(path.join(HERE, "domain/policy.raw.md"), "utf8");
  const { cases } = JSON.parse(await readFile(path.join(HERE, "domain/cases.json"), "utf8"));
  const cand = JSON.parse(await readFile(path.join(OUT, "candidates.json"), "utf8"));
  const candidate = arg("--candidate", "claude");
  const judges = arg("--judges", "grok,codex").split(",").filter((k) => MODELS[k]);
  const repeatJudge = arg("--repeat", judges[0]);
  const sample = parseInt(arg("--sample", "0"), 10); // 0 = all

  const caseById = Object.fromEntries(cases.map((c) => [c.id, c]));
  const candRows = Object.fromEntries(cand.matrix.filter((r) => r.model === candidate).map((r) => [r.case, r]));

  // only cases where the candidate produced a usable adjudication with a rationale
  let pool = cases.filter((c) => candRows[c.id] && candRows[c.id].rationale && candRows[c.id].rationale.trim().length > 0);
  if (sample > 0) pool = pool.slice(0, sample);

  const r = rng(707);
  const records = [];
  console.log(`Blind A/B: candidate=${candidate} vs reference examiner · judges=[${judges.join(", ")}] · ${pool.length} claims · repeat=${repeatJudge}`);

  for (const c of pool) {
    const gt = adjudicate(c.facts);
    const refTxt = adjText(referenceRationale(c.facts, gt).replace(/ Disposition:.*$/, ""), gt.verdict, gt.payable);
    const cr = candRows[c.id];
    const candTxt = adjText(cr.rationale, cr.verdict, cr.payable);
    const candFirst = r() < 0.5; // randomize which slot the candidate takes

    for (const jk of judges) {
      const passes = jk === repeatJudge ? [1, 2] : [1];
      for (const pass of passes) {
        // pass 2 flips the order to measure position bias
        const flip = pass === 2;
        const candIsA = flip ? !candFirst : candFirst;
        const A = candIsA ? candTxt : refTxt;
        const B = candIsA ? refTxt : candTxt;
        let out = "", err = "";
        try { out = await MODELS[jk].run(buildJudgePrompt(policy, c.claim_text, A, B)); } catch (e) { err = e.message; }
        const v = parseJudge(out);
        let better_is_candidate = null;
        if (v) {
          if (v.better === "TIE") better_is_candidate = null;
          else better_is_candidate = (v.better === "A") === candIsA;
        }
        await writeFile(path.join(RAW, `${c.id}__${jk}__p${pass}.txt`),
          `# ${c.id} / judge=${jk} / pass=${pass} / candIsA=${candIsA}\n# better=${v?.better} -> candidate ${better_is_candidate === null ? "TIE" : better_is_candidate ? "WIN" : "LOSS"}\n${err ? "# error: " + err + "\n" : ""}---\n${out}\n`);
        records.push({ case: c.id, class: caseById[c.id].class, candidate, judge: jk, pass, candIsA,
          better: v?.better ?? null, confidence: v?.confidence ?? null, better_is_candidate,
          errors_ref: candIsA ? (v?.errors_B || []) : (v?.errors_A || []),
          errors_cand: candIsA ? (v?.errors_A || []) : (v?.errors_B || []) });
        process.stdout.write(`  ${c.id} / ${jk} p${pass}: ${v?.better ?? "?"} (cand ${better_is_candidate === null ? "tie" : better_is_candidate ? "win" : "loss"})\n`);
      }
    }
  }

  await writeFile(path.join(OUT, "judges.json"), JSON.stringify({
    generatedNote: "Blind A/B. records[].better_is_candidate maps the masked A/B pick back to candidate-vs-reference. pass 2 = order-flipped repeat for position bias.",
    candidate, judges, repeatJudge, n_claims: pool.length, records,
  }, null, 2));
  console.log(`\nWrote results/judges.json + ${records.length} judge responses.`);
}

main().catch((e) => { console.error("judge failed:", e); process.exit(1); });
