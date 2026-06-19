#!/usr/bin/env node
// manifest.mjs — audit trail. Pins what produced the numbers: dataset + code hashes, model
// versions, prompt-template hashes, run timestamps, and a reproducibility checklist. Writes
// MANIFEST.md. Run after run.mjs / judge.mjs / metrics.mjs so the manifest reflects the latest run.

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);

async function hashFile(rel) {
  try { return sha(await readFile(path.join(HERE, rel))); } catch { return "(missing)"; }
}

async function main() {
  const codeFiles = ["engine.mjs", "run.mjs", "judge.mjs", "metrics.mjs", "harden.mjs", "models.mjs"];
  const dataFiles = ["domain/policy.raw.md", "domain/policy.core.json", "domain/cases.json", "golden/regression.json"];
  const codeHashes = Object.fromEntries(await Promise.all(codeFiles.map(async (f) => [f, await hashFile(f)])));
  const dataHashes = Object.fromEntries(await Promise.all(dataFiles.map(async (f) => [f, await hashFile(f)])));

  let candMeta = null, judgeMeta = null, metrics = null;
  if (existsSync(path.join(HERE, "results/candidates.json"))) {
    const c = JSON.parse(await readFile(path.join(HERE, "results/candidates.json"), "utf8"));
    candMeta = { cases: c.cases.length, models: c.models, runs: c.matrix.length };
  }
  if (existsSync(path.join(HERE, "results/judges.json"))) {
    const j = JSON.parse(await readFile(path.join(HERE, "results/judges.json"), "utf8"));
    judgeMeta = { candidate: j.candidate, judges: j.judges, repeatJudge: j.repeatJudge, claims: j.n_claims, responses: j.records.length };
  }
  if (existsSync(path.join(HERE, "results/metrics.json"))) metrics = JSON.parse(await readFile(path.join(HERE, "results/metrics.json"), "utf8"));

  // raw-response counts (recomputability evidence)
  const rawCount = existsSync(path.join(HERE, "results/raw")) ? (await readdir(path.join(HERE, "results/raw"))).filter((f) => f.endsWith(".txt")).length : 0;
  const rawJudgeCount = existsSync(path.join(HERE, "results/raw_judge")) ? (await readdir(path.join(HERE, "results/raw_judge"))).filter((f) => f.endsWith(".txt")).length : 0;

  const lines = [];
  lines.push("# MANIFEST — Blind Expert-Parity Harness");
  lines.push("");
  lines.push("Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.");
  lines.push("");
  lines.push("## Dataset (the holdout + policy)");
  lines.push("");
  lines.push("| File | sha256:16 |");
  lines.push("|---|---|");
  for (const [f, h] of Object.entries(dataHashes)) lines.push(`| \`${f}\` | \`${h}\` |`);
  lines.push("");
  lines.push("## Code (instrument version pins)");
  lines.push("");
  lines.push("| File | sha256:16 |");
  lines.push("|---|---|");
  for (const [f, h] of Object.entries(codeHashes)) lines.push(`| \`${f}\` | \`${h}\` |`);
  lines.push("");
  lines.push("## Models (as run)");
  lines.push("");
  if (candMeta) {
    lines.push("**Candidates:**");
    for (const m of candMeta.models) lines.push(`- \`${m.key}\` — ${m.label} · pinned: \`${m.version}\``);
    lines.push(`\n${candMeta.cases} claims × ${candMeta.models.length} candidates = ${candMeta.runs} adjudications, ${rawCount} raw responses saved.`);
  } else lines.push("_No candidate run on record. Run `node run.mjs`._");
  lines.push("");
  if (judgeMeta) {
    lines.push(`**Blind A/B:** candidate \`${judgeMeta.candidate}\`, judges [${judgeMeta.judges.join(", ")}], repeat-judge \`${judgeMeta.repeatJudge}\`, ${judgeMeta.claims} claims, ${judgeMeta.responses} judge responses (${rawJudgeCount} raw saved).`);
    lines.push("");
  }
  lines.push("## Prompt templates");
  lines.push("");
  lines.push("Prompt templates are inlined in `run.mjs` (`buildPrompt`) and `judge.mjs` (`buildJudgePrompt`); their hashes are pinned via the code hashes above. The candidate prompt fixes a closed verdict set and a JSON schema; the judge prompt masks identity and fixes an error taxonomy.");
  lines.push("");
  if (metrics?.ranking?.length) {
    lines.push("## Headline (from results/metrics.json)");
    lines.push("");
    lines.push("| Model | κ vs examiner | accuracy | false-pay | false-deny |");
    lines.push("|---|---|---|---|---|");
    for (const r of metrics.ranking) lines.push(`| ${r.label} | ${r.kappa ?? "—"} | ${r.accuracy ?? "—"} | ${r.falsePay} | ${r.falseDeny} |`);
    lines.push("");
  }
  lines.push("## Reproducibility checklist");
  lines.push("");
  lines.push("- [x] Deterministic ground truth (`engine.mjs`), locked by `golden/regression.json` (`node harden.mjs --check`).");
  lines.push("- [x] Seeded bootstrap (seed 12345, B=2000) and seeded A/B order (seed 707) — CIs and order reproduce exactly.");
  lines.push("- [x] Local model pinned (`llama3.2:3b`, temperature 0); CLI candidates recorded by version string above.");
  lines.push("- [x] Every raw model response saved (`results/raw/`, `results/raw_judge/`) — all tables recompute via `node metrics.mjs`.");
  lines.push("- [x] Candidates never see the structured core or the engine; only `policy.raw.md` + the raw claim.");
  lines.push("- [ ] CLI candidate runs are not bit-reproducible (hosted models drift); the saved raw responses are the system of record, not a promise of identical re-runs.");
  lines.push("");

  await writeFile(path.join(HERE, "MANIFEST.md"), lines.join("\n") + "\n");
  console.log(`Wrote MANIFEST.md (${rawCount} raw candidate + ${rawJudgeCount} raw judge responses on record)`);
}

main().catch((e) => { console.error("manifest failed:", e); process.exit(1); });
