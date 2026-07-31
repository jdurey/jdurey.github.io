// generate.mjs — synthetic LLM-fleet telemetry with planted, known defects.
//
// Emits data/generations.csv in the shape of a router activity export (model, provider,
// tokens, finish_reason, latency, cost) for a fictional six-model fleet. Three defects are
// planted by construction, so ground truth is constructible, not judged:
//   - "sable-9b" truncates ~6% of responses (finish_reason=length)
//   - "quill-120b" spends ~93% of its completion tokens on reasoning
//   - provider "NimbusServe" has a pathological latency tail
// golden/expected.json records exactly what was planted. The gate is correct iff it finds
// these and nothing else.

import { mkdirSync, writeFileSync } from "node:fs";
import { rng } from "../_scaffold/core.mjs";

const r = rng(20260731);
const ROWS_PER_MODEL = 2000;

// [model, params: cutoffRate, reasoningShare, baseCostPer1k]
const MODELS = [
  ["hearth-70b", 0.002, 0.0, 0.9],
  ["brook-8b", 0.003, 0.0, 0.05],
  ["gale-32b", 0.004, 0.45, 0.3],
  ["fenn-15b", 0.002, 0.55, 0.15],
  ["sable-9b", 0.06, 0.0, 0.06],      // planted: silent truncation
  ["quill-120b", 0.004, 0.93, 1.4],   // planted: reasoning tax
];
// [provider, p50ms, tailChance, tailMs]
const PROVIDERS = [
  ["Coreline", 2500, 0.02, 9000],
  ["Fastori", 1400, 0.02, 6000],
  ["Steadfast", 4000, 0.03, 14000],
  ["NimbusServe", 6000, 0.18, 70000], // planted: latency tail
];

const gauss = () => (r() + r() + r() + r() - 2) / 2; // cheap symmetric noise in [-1,1]

const rows = [["model", "provider", "tokens_prompt", "tokens_completion", "tokens_reasoning", "finish_reason", "generation_time_ms", "cost_total"]];
for (const [model, cutoffRate, reasoningShare, costPer1k] of MODELS) {
  for (let i = 0; i < ROWS_PER_MODEL; i++) {
    const [prov, p50, tailChance, tailMs] = PROVIDERS[Math.floor(r() * PROVIDERS.length)];
    const prompt = Math.max(50, Math.round(2400 + 1800 * gauss()));
    const completion = Math.max(20, Math.round(320 + 220 * gauss()));
    const reasoning = Math.round(completion * Math.max(0, reasoningShare + 0.04 * gauss()));
    const finish = r() < cutoffRate ? "length" : "stop";
    const latency = Math.round(Math.max(200, p50 * (1 + 0.5 * gauss()) + (r() < tailChance ? tailMs * (0.6 + r()) : 0)));
    const cost = ((prompt + completion + reasoning) / 1000) * costPer1k * (0.9 + 0.2 * r());
    rows.push([model, prov, prompt, completion, reasoning, finish, latency, cost.toFixed(6)]);
  }
}

mkdirSync("data", { recursive: true });
mkdirSync("golden", { recursive: true });
writeFileSync("data/generations.csv", rows.map((x) => x.join(",")).join("\n") + "\n");
writeFileSync("golden/expected.json", JSON.stringify({
  cutoff: ["sable-9b"],
  reasoning_tax: ["quill-120b"],
  latency_tail: ["NimbusServe"],
}, null, 2) + "\n");
console.log(`wrote data/generations.csv (${rows.length - 1} rows) + golden/expected.json`);
