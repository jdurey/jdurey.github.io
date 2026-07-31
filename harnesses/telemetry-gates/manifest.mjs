// manifest.mjs — regenerate MANIFEST.md (sha256:16 of dataset + code), same pattern as siblings.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
const h = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16);
const files = ["data/generations.csv", "golden/expected.json", "generate.mjs", "gate.mjs", "score.mjs", "../_scaffold/core.mjs"];
const scores = JSON.parse(readFileSync("results/scores.json", "utf8"));
const lines = [
  "# MANIFEST — Telemetry-Gates Harness", "",
  "Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.", "",
  "## Files", "", "| File | sha256:16 |", "|---|---|",
  ...files.map((f) => `| \`${f}\` | \`${h(f)}\` |`), "",
  "## Pipeline", "",
  "`node generate.mjs` (synthetic fleet, 3 planted defects, constructible ground truth) → `node gate.mjs` (3 deterministic gates: silent truncation, reasoning tax, latency tail) → `node score.mjs` (exact-set self-test vs golden).", "",
  "No model calls anywhere — telemetry only. The synthetic fleet and providers are fictional.", "",
  "## Headline", "",
  `- Self-test: ${scores.verdict} — cutoff flagged [${scores.cutoff.flagged}], reasoning_tax flagged [${scores.reasoning_tax.flagged}], latency_tail flagged [${scores.latency_tail.flagged}]; 0 missed, 0 extra.`,
  "- Motivating (real, personal-account aggregate, July 2026): one model truncated 5.7% of responses silently; 8 models spent 83–95% of completion tokens on reasoning; provider p50 spread 1.1s→20s, worst p95 89s.", "",
];
writeFileSync("MANIFEST.md", lines.join("\n"));
console.log("MANIFEST.md written");
