#!/usr/bin/env node
// solve.mjs — RUNG 2: the blind-solver. The centerpiece.
//
// The hard question "is this feedback bad?" is a judgment call that does not run at volume. So we
// convert it into one with an objective answer: "can a student exploit it?" For each item the
// solver is handed NOTHING but the three wrong-answer feedback blurbs — no stem, no answer choices,
// no key — and is asked to RECONSTRUCT the correct answer. If the wrong-answer feedback leaked the
// key, it can. If the feedback is clean, it says UNKNOWN. That is not an opinion that the feedback
// is bad; it is a measurement that a student with the same feedback could name the answer without
// knowing the material.
//
// Two design choices make this a VALID measurement rather than a knowledge test:
//   1. Free-text reconstruction, not multiple-choice. Showing the options lets the model pick the
//      key by ELIMINATION ("three are explained as wrong, so it's the fourth") even when no feedback
//      leaks. Hiding the options removes elimination: the model can only produce the key if a
//      feedback blurb positively contains it.
//   2. The ledger is fictional. On real-world content a model names the key from prior knowledge,
//      not from the feedback. With invented peoples and places the only source for an item's
//      arbitrary answer is a leak in the feedback.
// Scoring lives in score.mjs: a reconstruction "solves" the item iff it contains a DISTINCTIVE key
// token (a content word unique to the key option). That is objective token-matching — no model
// grading another model.
//
// Runs on a cheap LOCAL model (Llama 3.2 3B, temp 0). Every raw response saved to results/raw/.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLocal, extractJSON, seededShuffle, arg, LOCAL } from "./models.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");
const RAW = path.join(OUT, "raw");

function buildPrompt(feedback) {
  const fb = feedback.map((f) => `- ${f}`).join("\n");
  return `A multiple-choice question has been hidden from you. You are shown ONLY the explanations a student saw for why THREE different wrong answers were wrong — nothing else. There is no question and there are no answer choices in front of you.

${fb}

From these explanations alone, what is the correct answer to the hidden question? Answer in a few words. If the explanations do not actually reveal the correct answer, reply with exactly UNKNOWN. Do not guess.

Reply with ONLY a JSON object:
{"answer": "<the correct answer in a few words, or UNKNOWN>"}`;
}

function parseAnswer(raw) {
  const j = extractJSON(raw);
  let ans = j && typeof j.answer === "string" ? j.answer.trim() : "";
  if (!ans) { const m = String(raw).match(/answer"?\s*[:=]\s*"([^"]*)"/i); ans = m ? m[1].trim() : ""; }
  const unknown = !ans || /^unknown\b/i.test(ans);
  return { answer: ans, unknown };
}

async function main() {
  await mkdir(RAW, { recursive: true });
  const { items } = JSON.parse(await readFile(path.join(HERE, "domain/ledger.json"), "utf8"));
  const onlyArg = arg("--only", "");
  const picked = onlyArg ? items.filter((i) => onlyArg.split(",").includes(i.id)) : items;

  const records = [];
  console.log(`\n=== RUNG 2: BLIND-SOLVER — answer-reveal reconstruction (${picked.length} items, ${LOCAL.label}) ===`);
  console.log("item   reconstructed answer (from wrong-answer feedback only)");

  for (let idx = 0; idx < picked.length; idx++) {
    const item = picked[idx];
    const feedback = seededShuffle(item.options.filter((o) => !o.correct && o.feedback).map((o) => o.feedback), 1000 + idx);
    const prompt = buildPrompt(feedback);
    const raw = await runLocal(prompt, { num_predict: 100 });
    const a = parseAnswer(raw);
    await writeFile(path.join(RAW, `${item.id}__reconstruct.txt`),
      `# ${item.id} blind-solver / ${LOCAL.version}\n# reconstructed: ${a.unknown ? "UNKNOWN" : JSON.stringify(a.answer)}\n=== PROMPT ===\n${prompt}\n=== RESPONSE ===\n${raw}\n`);
    records.push({ item: item.id, answer: a.answer, unknown: a.unknown });
    console.log(`  ${item.id}   ${a.unknown ? "(UNKNOWN)" : a.answer.slice(0, 70)}`);
  }

  const out = {
    generatedNote: "Blind-solver over wrong-answer feedback ONLY (no stem, no options, no key). Free-text reconstruction; whether a reconstruction names the key is decided in score.mjs by distinctive-key-token overlap. Recomputable from results/raw/. Local model, temp 0.",
    model: LOCAL, nItems: picked.length, records,
  };
  await writeFile(path.join(OUT, "solver.json"), JSON.stringify(out, null, 2));
  const named = records.filter((r) => !r.unknown).length;
  console.log(`\nNamed an answer on ${named}/${records.length} items (UNKNOWN on ${records.length - named}). Scoring vs the key -> score.mjs. Wrote results/solver.json + ${records.length} raw responses.`);
}

main().catch((e) => { console.error("solve failed:", e); process.exit(1); });
