// gate.mjs — three deterministic gates over LLM generation telemetry.
//
// Input: any CSV with columns model, provider, tokens_completion, tokens_reasoning,
// finish_reason, generation_time_ms (router activity exports have all of these).
// No model calls, no content — telemetry only.
//
//   Gate 1  silent truncation   flag models whose finish_reason=length rate > 1%
//   Gate 2  reasoning tax       flag models spending > 90% of completion tokens on reasoning
//   Gate 3  latency tail        flag providers with p95 > 30s or p95/p50 > 8
//
// Usage: node gate.mjs [--csv data/generations.csv] [--out results/findings.json]

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { arg } from "../_scaffold/core.mjs";

const CUTOFF_RATE = 0.01, MIN_N = 200, REASONING_SHARE = 0.90, TAIL_MS = 30000, TAIL_RATIO = 8;

const csvPath = arg("--csv", "data/generations.csv");
const outPath = arg("--out", "results/findings.json");

const [header, ...lines] = readFileSync(csvPath, "utf8").trim().split("\n");
const col = Object.fromEntries(header.split(",").map((c, i) => [c.trim(), i]));
for (const need of ["model", "provider", "tokens_completion", "tokens_reasoning", "finish_reason", "generation_time_ms"])
  if (!(need in col)) throw new Error(`missing column: ${need}`);

const byModel = new Map(), byProvider = new Map();
for (const line of lines) {
  const f = line.split(",");
  const m = byModel.get(f[col.model]) ?? { n: 0, cut: 0, comp: 0, reas: 0 };
  m.n++; m.cut += f[col.finish_reason].trim() === "length";
  m.comp += +f[col.tokens_completion] || 0; m.reas += +f[col.tokens_reasoning] || 0;
  byModel.set(f[col.model], m);
  const lat = +f[col.generation_time_ms];
  if (lat > 0) {
    let arr = byProvider.get(f[col.provider]);
    if (!arr) { arr = []; byProvider.set(f[col.provider], arr); }
    arr.push(lat);
  }
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
const findings = { cutoff: [], reasoning_tax: [], latency_tail: [], profile: { models: {}, providers: {} } };

for (const [model, m] of byModel) {
  const cutRate = m.cut / m.n, share = m.comp ? m.reas / m.comp : 0;
  findings.profile.models[model] = { n: m.n, cutoff_rate: +cutRate.toFixed(4), reasoning_share: +share.toFixed(3) };
  if (m.n >= MIN_N && cutRate > CUTOFF_RATE) findings.cutoff.push(model);
  if (m.n >= MIN_N && share > REASONING_SHARE) findings.reasoning_tax.push(model);
}
for (const [prov, lats] of byProvider) {
  lats.sort((a, b) => a - b);
  const p50 = pct(lats, 0.5), p95 = pct(lats, 0.95);
  findings.profile.providers[prov] = { n: lats.length, p50, p95 };
  if (lats.length >= MIN_N && (p95 > TAIL_MS || p95 / p50 > TAIL_RATIO)) findings.latency_tail.push(prov);
}
for (const k of ["cutoff", "reasoning_tax", "latency_tail"]) findings[k].sort();

mkdirSync("results", { recursive: true });
writeFileSync(outPath, JSON.stringify(findings, null, 2) + "\n");
const flags = findings.cutoff.length + findings.reasoning_tax.length + findings.latency_tail.length;
console.log(`gate: ${lines.length} rows · flags — cutoff: [${findings.cutoff}] reasoning_tax: [${findings.reasoning_tax}] latency_tail: [${findings.latency_tail}]`);
process.exitCode = flags ? 2 : 0;
