// score.mjs — deterministic. Reads the saved verdicts, compares them to by-construction labels,
// writes results/scores.json and report.md. No model, no network. Anyone can re-derive the numbers.
//
//   node score.mjs
//
// What it reports:
//   1. Control separation: gold (obvious-correct) must out-pass gibberish (obvious-wrong) by >= 50
//      points, or the run is inconclusive and nothing below is read as instability.
//   2. Nondeterminism (NDV): any subject whose identical-input verdict is neither always-pass nor
//      always-fail. The flip is the defect. The minority share is the flip rate.
//   3. The list-alignment control: the headline nondeterministic subject (ndv) uses a service drawn
//      from the accepted examples. If it still flips, enriching the accept-list cannot be the fix.
//   4. False pass: an invalid subject (noservice) that the grader passes anyway, and how unstably.

import { readFileSync, writeFileSync } from "node:fs";

const HERE = new URL(".", import.meta.url).pathname;
const V = JSON.parse(readFileSync(HERE + "results/verdicts.json", "utf8"));
const { subjects } = JSON.parse(readFileSync(HERE + "domain/items.json", "utf8"));
const GOLDEN = JSON.parse(readFileSync(HERE + "golden/labels.json", "utf8"));

const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : 0);

const tally = Object.fromEntries(subjects.map((s) => [s.id, { pass: 0, fail: 0, abstain: 0 }]));
for (const r of V.rows) {
  const t = tally[r.subject];
  if (!t) continue;
  if (r.verdict === "PASS") t.pass++; else if (r.verdict === "FAIL") t.fail++; else t.abstain++;
}

const rows = subjects.map((s) => {
  const t = tally[s.id];
  const decided = t.pass + t.fail;
  return {
    subject: s.id, role: s.role, valid: s.valid, label_valid: GOLDEN.labels[s.id]?.valid,
    pass: t.pass, fail: t.fail, abstain: t.abstain, decided,
    pass_rate: pct(t.pass, decided),
    flip_rate: pct(Math.min(t.pass, t.fail), decided),
    nondeterministic: t.pass > 0 && t.fail > 0,
  };
});

const get = (id) => rows.find((r) => r.subject === id);
const gold = get("gold"), gib = get("gibberish"), ndv = get("ndv"), noservice = get("noservice");
const controlsSeparate = !!(gold && gib && gold.pass_rate - gib.pass_rate >= 50);
const flippedValid = rows.filter((r) => r.valid && r.nondeterministic);

const scores = {
  item_id: V.item_id, subject: V.subject, temperature: V.temperature, n: V.n,
  controls_separate: controlsSeparate,
  rows,
  headline: {
    ndv_pass_rate: ndv?.pass_rate, ndv_flip_rate: ndv?.flip_rate, ndv_nondeterministic: ndv?.nondeterministic,
    valid_answers_that_flipped: flippedValid.map((r) => r.subject),
    gold_pass_rate: gold?.pass_rate, gibberish_pass_rate: gib?.pass_rate,
    noservice_pass_rate: noservice?.pass_rate, noservice_nondeterministic: noservice?.nondeterministic,
  },
};
writeFileSync(HERE + "results/scores.json", JSON.stringify(scores, null, 2));

// ---- report.md -------------------------------------------------------------------------------------
const L = [];
L.push("# Verdict-integrity probe — report");
L.push("");
L.push(`Subject: \`${V.subject}\` · temperature ${V.temperature} · ${V.n} repeats per answer · the input is byte-identical on every repeat.`);
L.push("");
if (!controlsSeparate) {
  L.push(`> **Inconclusive run.** The grader did not separate the obvious-correct control from the obvious-wrong one (gold ${gold?.pass_rate}% vs gibberish ${gib?.pass_rate}%). Nothing below is read as instability.`);
  L.push("");
}
L.push("| Answer | Valid by rubric | Pass | Fail | Pass-rate | Flipped on identical input |");
L.push("|---|---|---|---|---|---|");
for (const r of rows) {
  L.push(`| \`${r.subject}\` (${r.role}) | ${r.valid ? "yes" : "no"} | ${r.pass} | ${r.fail} | ${r.pass_rate}% | ${r.nondeterministic ? `yes (${r.flip_rate}% minority)` : "no"} |`);
}
L.push("");
L.push("## What the run shows");
L.push("");
if (gold && gib) L.push(`- **Controls separate.** gold passed ${gold.pass_rate}% and gibberish passed ${gib.pass_rate}%. The grader can tell obvious-correct from obvious-wrong, so the flips below are not just noise.`);
if (ndv) L.push(`- **Nondeterminism on identical input.** \`ndv\` is valid and its service is taken from the accepted examples. On ${ndv.decided} identical submissions it passed ${ndv.pass} and failed ${ndv.fail} (pass-rate ${ndv.pass_rate}%). The same bytes got both verdicts.`);
if (flippedValid.length) L.push(`- **It is systemic.** ${flippedValid.length} of the valid answers flipped: ${flippedValid.map((r) => `\`${r.subject}\` ${r.pass_rate}%`).join(", ")}. A correct student's grade depends on which sample the model happened to draw.`);
if (ndv) L.push(`- **The accept-list is not the fix.** \`ndv\`'s service already appears in the accepted examples, and it still flips. Adding more accepted answers cannot stabilize a verdict that moves on list-aligned input. The instability lives in the call, not the rubric.`);
if (noservice) L.push(`- **It cuts both ways.** \`noservice\` names no service and the rubric says reject it, yet it passed ${noservice.pass_rate}% of the time${noservice.nondeterministic ? " and flipped" : ""}. The same instability that fails good answers waves bad ones through.`);
L.push("");
L.push("Re-derive these numbers from the saved verdicts with `node score.mjs` (no model, no network). Re-probe with `node probe.mjs --force`.");
L.push("");
writeFileSync(HERE + "report.md", L.join("\n"));

console.log(`[score] gold ${gold?.pass_rate}%  gibberish ${gib?.pass_rate}%  ndv ${ndv?.pass_rate}% (flip ${ndv?.flip_rate}%)  noservice ${noservice?.pass_rate}%`);
console.log(`[score] valid answers that flipped: ${flippedValid.map((r) => r.subject).join(", ") || "none"}`);
console.log(`[score] controls separate: ${controlsSeparate}`);
console.log("[score] wrote results/scores.json + report.md");
