// score.mjs — self-test: the gate must find every planted defect and nothing else.
//
// Reads golden/expected.json (what generate.mjs planted, ground truth by construction)
// and results/findings.json (what the gate flagged). Exact set match per gate class:
// a miss is a recall failure, an extra flag is a precision failure. Either fails the run.

import { readFileSync, writeFileSync } from "node:fs";

const expected = JSON.parse(readFileSync("golden/expected.json", "utf8"));
const found = JSON.parse(readFileSync("results/findings.json", "utf8"));

const scores = {};
let pass = true;
for (const k of ["cutoff", "reasoning_tax", "latency_tail"]) {
  const want = [...expected[k]].sort(), got = [...found[k]].sort();
  const missed = want.filter((x) => !got.includes(x));
  const extra = got.filter((x) => !want.includes(x));
  scores[k] = { expected: want, flagged: got, missed, extra, ok: !missed.length && !extra.length };
  pass &&= scores[k].ok;
}
scores.verdict = pass ? "PASS" : "FAIL";
writeFileSync("results/scores.json", JSON.stringify(scores, null, 2) + "\n");
for (const k of ["cutoff", "reasoning_tax", "latency_tail"])
  console.log(`${scores[k].ok ? "✓" : "✗"} ${k}: flagged [${scores[k].flagged}]${scores[k].missed.length ? ` MISSED [${scores[k].missed}]` : ""}${scores[k].extra.length ? ` EXTRA [${scores[k].extra}]` : ""}`);
console.log(scores.verdict);
process.exitCode = pass ? 0 : 1;
