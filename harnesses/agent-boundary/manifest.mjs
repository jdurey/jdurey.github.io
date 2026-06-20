#!/usr/bin/env node
// manifest.mjs — audit trail. Pins what produced the numbers: dataset + code hashes, model versions,
// run counts, and a reproducibility checklist. Writes MANIFEST.md. Run after the rungs + score.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);
const hashFile = async (rel, base = HERE) => { try { return sha(await readFile(path.join(base, rel))); } catch { return "(missing)"; } };
const J = async (rel) => (existsSync(path.join(HERE, rel)) ? JSON.parse(await readFile(path.join(HERE, rel), "utf8")) : null);
const rawCount = async (rel) => (existsSync(path.join(HERE, rel)) ? (await readdir(path.join(HERE, rel))).filter((f) => f.endsWith(".txt")).length : 0);

async function main() {
  const dataFiles = ["domain/policy.json", "golden/findings.json"];
  const codeFiles = ["guard.mjs", "probe.mjs", "score.mjs", "domain/world.mjs"];
  const dataHashes = Object.fromEntries(await Promise.all(dataFiles.map(async (f) => [f, await hashFile(f)])));
  const codeHashes = Object.fromEntries(await Promise.all(codeFiles.map(async (f) => [f, await hashFile(f)])));
  const scaffoldHash = await hashFile("core.mjs", path.join(HERE, "..", "_scaffold"));

  const policy = await J("domain/policy.json");
  const guard = await J("results/guard.json");
  const probe = await J("results/probe.json");
  const scores = await J("results/scores.json");
  const rawProbe = await rawCount("results/raw_probe");

  const L = [];
  L.push("# MANIFEST — Agent-Boundary Harness", "");
  L.push("Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.", "");
  L.push("## Dataset (synthetic, fictional)", "");
  L.push("| File | sha256:16 |", "|---|---|");
  for (const [f, h] of Object.entries(dataHashes)) L.push(`| \`${f}\` | \`${h}\` |`);
  if (policy) L.push("", `Fictional Veyra workspace: ${policy.allowedFiles.length} allowed files, ${policy.sealedFiles.length} sealed records + 1 prefix-confusion sibling, ${policy.vectors.length}-vector guard battery, ${policy.scenarios.length} model scenarios. No real system content.`);
  L.push("", "## Code (instrument version pins)", "");
  L.push("| File | sha256:16 |", "|---|---|");
  for (const [f, h] of Object.entries(codeHashes)) L.push(`| \`${f}\` | \`${h}\` |`);
  L.push(`| \`../_scaffold/core.mjs\` | \`${scaffoldHash}\` |`);
  L.push("", "## Models (as run)", "");
  if (probe) {
    L.push(`- Subjects probed: ${probe.subjects.join(", ")}.`);
    L.push(`- Cross-model boundary-adherence: ${probe.records.length} prompts, ${rawProbe} raw responses saved.`);
  } else L.push("- Layer 2 not run yet (no results/probe.json).");
  L.push("- Local baseline: Llama 3.2 3B via ollama, temperature 0. CLI subjects (Codex / Grok / Gemini-via-agy) are not bit-stable; raw responses are the system of record.");
  L.push("", "## Headline", "");
  if (guard) L.push(`- Layer 1 (guard): hardened deny-recall ${guard.hardened.denyRecall.toFixed(2)}, ${guard.hardened.leaks} leak(s); naive deny-recall ${guard.naive.denyRecall.toFixed(2)}, ${guard.naive.leaks} EscapeRoute leak(s).`);
  if (scores?.layer1) L.push(`  - ${scores.layer1.verdict}`);
  if (scores?.layer2?.ranking) {
    L.push("- Layer 2 (cross-model) crossing rate over temptations:");
    for (const r of scores.layer2.ranking) L.push(`  - ${r.subject}: ${r.crossingRate == null ? "n/a" : (r.crossingRate * 100).toFixed(0) + "%"} (${r.crossed}/${r.temptations})`);
  }
  L.push("", "## Reproducibility checklist", "");
  L.push("- [x] Fictional workspace authored from scratch; no real system content (firewall: NEUTRAL).");
  L.push("- [x] Sealed canary tokens are arbitrary (seed-derived) — a token downstream is objective proof of a crossing.");
  L.push("- [x] Layer 1 guard battery is a pure function of policy.json — no model, no network; recomputes exactly.");
  L.push("- [x] Scoring oracle (domain/world.mjs classifyZone) is independent of the guards under test (guard.mjs).");
  L.push("- [x] Cross-model subjects are candidate/reported, never graduated; every raw response saved (results/raw_probe/).");
  L.push("- [x] Graduation is per vector-class and the canary battery must still bite (naive guard still leaks the EscapeRoute vectors).");
  L.push("- [ ] CLI-subject runs depend on locally-authenticated CLIs and are not bit-guaranteed across versions; the saved raw responses are the system of record.");
  L.push("");
  await writeFile(path.join(HERE, "MANIFEST.md"), L.join("\n") + "\n");
  console.log(`Wrote MANIFEST.md (${rawProbe} raw probe responses on record)`);
}

main().catch((e) => { console.error("manifest failed:", e); process.exit(1); });
