#!/usr/bin/env node
// manifest.mjs — audit trail. Pins what produced the numbers: dataset + code hashes, the model
// version, run counts, and a reproducibility checklist. Writes MANIFEST.md. Run after the rungs +
// score so the manifest reflects the latest run.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);
const hashFile = async (rel) => { try { return sha(await readFile(path.join(HERE, rel))); } catch { return "(missing)"; } };
const J = async (rel) => (existsSync(path.join(HERE, rel)) ? JSON.parse(await readFile(path.join(HERE, rel), "utf8")) : null);
const rawCount = async (rel) => (existsSync(path.join(HERE, rel)) ? (await readdir(path.join(HERE, rel))).filter((f) => f.endsWith(".txt")).length : 0);

async function main() {
  const dataFiles = ["domain/ledger.json", "golden/findings.json"];
  const codeFiles = ["screen.mjs", "solve.mjs", "semantic.mjs", "score.mjs", "models.mjs"];
  const dataHashes = Object.fromEntries(await Promise.all(dataFiles.map(async (f) => [f, await hashFile(f)])));
  const codeHashes = Object.fromEntries(await Promise.all(codeFiles.map(async (f) => [f, await hashFile(f)])));

  const ledger = await J("domain/ledger.json");
  const golden = await J("golden/findings.json");
  const solver = await J("results/solver.json");
  const scores = await J("results/scores.json");
  const rawSolve = await rawCount("results/raw");
  const rawSem = await rawCount("results/raw_semantic");

  const flawCounts = {};
  if (golden) for (const v of Object.values(golden.items)) flawCounts[v.flaw] = (flawCounts[v.flaw] || 0) + 1;

  const L = [];
  L.push("# MANIFEST — Feedback-Integrity Harness", "");
  L.push("Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.", "");
  L.push("## Dataset (synthetic, fictional)", "");
  L.push("| File | sha256:16 |", "|---|---|");
  for (const [f, h] of Object.entries(dataHashes)) L.push(`| \`${f}\` | \`${h}\` |`);
  if (ledger) {
    const flaws = Object.entries(flawCounts).map(([k, v]) => `${v} ${k}`).join(", ");
    L.push("", `${ledger.items.length} synthetic items (${flaws}). Fictional world; no real client content.`);
  }
  L.push("", "## Code (instrument version pins)", "");
  L.push("| File | sha256:16 |", "|---|---|");
  for (const [f, h] of Object.entries(codeHashes)) L.push(`| \`${f}\` | \`${h}\` |`);
  L.push("", "## Model (as run)", "");
  if (solver) L.push(`- \`${solver.model.key}\` — ${solver.model.label} · pinned: \`${solver.model.version}\` · temperature 0`);
  L.push(`- Blind-solver: ${ledger ? ledger.items.length : "?"} reconstruction calls, ${rawSolve} raw responses saved.`);
  L.push(`- Cheap semantic pass: ${ledger ? ledger.items.length : "?"} classification calls, ${rawSem} raw responses saved.`);
  L.push("", "## Headline (from results/scores.json)", "");
  if (scores) {
    L.push("| Class | recall | flagged | canary | verdict |", "|---|---|---|---|---|");
    for (const cls of ["ARF", "GDF", "FOM", "LCU"]) {
      const p = scores.classes[cls];
      L.push(`| ${cls} | ${p.recall} | ${p.flaggedCount} | ${p.canaryOK ? "ok" : "MISS"} | ${p.verdict.split(" — ")[0]} |`);
    }
    const c = scores.semanticCalibration;
    if (c) L.push("", `Cheap semantic pass vs golden: agreement ${(100 * c.agreement).toFixed(0)}%, precision ${c.positivePrecision == null ? "—" : (100 * c.positivePrecision).toFixed(0) + "%"}, false-flagged ${c.falseFlagged}/${c.cleanItems} clean items${c.collapsed ? `, COLLAPSED onto "${c.collapsedOnto}"` : ""}. Candidate-only; never auto-counted.`);
  } else L.push("_No score on record. Run the rungs + `node score.mjs`._");
  L.push("", "## Reproducibility checklist", "");
  L.push("- [x] Fictional dataset authored from scratch; no real client content (firewall: NEUTRAL).");
  L.push("- [x] Golden findings + canary battery lock the adjudication ground truth; graduation is per class.");
  L.push("- [x] Deterministic screen is a pure function of the ledger (no model, no network).");
  L.push("- [x] Blind-solver gets only wrong-answer feedback (no stem, no options, no key); fictional content blocks knowledge-solving; free-text blocks elimination.");
  L.push("- [x] Cheap semantic proposals are never auto-counted toward graduation — trusted objective rungs only.");
  L.push("- [x] Every raw model response saved (`results/raw/`, `results/raw_semantic/`) — all tables recompute via `node score.mjs`.");
  L.push("- [ ] Local-model runs are temperature 0 but not bit-guaranteed across ollama versions; the saved raw responses are the system of record.");
  L.push("");
  await writeFile(path.join(HERE, "MANIFEST.md"), L.join("\n") + "\n");
  console.log(`Wrote MANIFEST.md (${rawSolve} raw solver + ${rawSem} raw semantic responses on record)`);
}

main().catch((e) => { console.error("manifest failed:", e); process.exit(1); });
