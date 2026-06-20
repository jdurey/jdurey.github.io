#!/usr/bin/env node
// semantic.mjs — RUNG 3: the cheap semantic pass.
//
// A cheap model reads the WHOLE item (stem, all options with the key marked, and each wrong
// option's feedback) and proposes the single most severe feedback defect class + a verbatim quote
// as evidence. This is the rung that reaches the defects with no exact tell — ghost-distractors and
// subtle option-mismatches — that the deterministic screen deliberately skips.
//
// It is also where the load-bearing discipline lives: CHEAP MODELS PROPOSE, THEY NEVER ADJUDICATE.
// score.mjs measures how often this rung agrees with the golden adjudication, and specifically how
// often it waves a genuinely-broken item through as CLEAN. The instrument trusts this rung's
// positives only as candidates and never trusts its "this one's fine" as a clean bill of health.
// A generator and a grader that share a blind spot is the classic way a model-graded pipeline fails
// quietly — so we measure the blind spot instead of pretending it isn't there.
//
// Runs on the same cheap LOCAL model. Every raw response saved to results/raw_semantic/.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLocal, extractJSON, arg, LOCAL } from "./models.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");
const RAW = path.join(OUT, "raw_semantic");
const CLASSES = ["ARF", "GDF", "FOM", "CLEAN"];

function prompt(item) {
  const correct = item.options.find((o) => o.correct);
  const wrongs = item.options.filter((o) => !o.correct);
  const opts = item.options.map((o) => (o.correct ? `  (${o.id}) ${o.text}   <-- THIS IS THE CORRECT ANSWER` : `  (${o.id}) ${o.text}`)).join("\n");
  const fbs = wrongs.map((o) => `  When a student picks (${o.id}) "${o.text}", they are told:\n     "${o.feedback}"`).join("\n");
  return `You are checking the wrong-answer feedback on ONE K-8 quiz item. Most items are FINE — answer CLEAN unless you can point to a clear, specific problem.

QUESTION: ${item.stem}

THE FOUR CHOICES (correct answer marked):
${opts}

THE FEEDBACK EACH WRONG CHOICE SHOWS:
${fbs}

A good piece of wrong-answer feedback corrects the mistake in ITS OWN choice without giving away the right answer. Find the single WORST problem, if any:
- CLEAN: every feedback above sensibly corrects its own wrong choice. (This is the usual case.)
- ARF: one feedback gives away or states the correct answer "${correct.text}". Example: feedback on a wrong choice that says "actually the right answer is X".
- GDF: one feedback brings up a person/thing/idea that is NOT the question and NOT any of the four choices. Example: feedback that suddenly mentions astronauts on a history question.
- FOM: one feedback explains a DIFFERENT choice than the one it is attached to. Example: the feedback under choice (b) actually argues against choice (c).

Reply with ONLY a JSON object:
{"class": "CLEAN" | "ARF" | "GDF" | "FOM", "option": "<offending option id, empty if CLEAN>", "quote": "<verbatim phrase that proves it, empty if CLEAN>"}`;
}

function parse(raw) {
  const j = extractJSON(raw);
  let c = j && String(j.class || "").toUpperCase().trim();
  if (!CLASSES.includes(c)) {
    const m = String(raw).toUpperCase().match(/\b(ARF|GDF|FOM|CLEAN)\b/);
    c = m ? m[1] : "CLEAN";
  }
  return { class: c, option: j && typeof j.option === "string" ? j.option : "", quote: j && typeof j.quote === "string" ? j.quote : "" };
}

async function main() {
  await mkdir(RAW, { recursive: true });
  const { items } = JSON.parse(await readFile(path.join(HERE, "domain/ledger.json"), "utf8"));
  const onlyArg = arg("--only", "");
  const picked = onlyArg ? items.filter((i) => onlyArg.split(",").includes(i.id)) : items;

  const records = [];
  console.log(`\n=== RUNG 3: CHEAP SEMANTIC PASS (${picked.length} items, ${LOCAL.label}) ===`);
  for (const item of picked) {
    const p = prompt(item);
    const raw = await runLocal(p, { num_predict: 160 });
    const r = parse(raw);
    await writeFile(path.join(RAW, `${item.id}.txt`), `# ${item.id} semantic / ${LOCAL.version}\n# class=${r.class} option=${r.option}\n=== PROMPT ===\n${p}\n=== RESPONSE ===\n${raw}\n`);
    records.push({ item: item.id, ...r });
    console.log(`  ${item.id}  ->  ${r.class}${r.option ? " (opt " + r.option + ")" : ""}`);
  }

  const out = { generatedNote: "Cheap-model proposals over domain/ledger.json. PROPOSALS, not verdicts. Recomputable from results/raw_semantic/. Local model, temp 0.", model: LOCAL, nItems: picked.length, records };
  await writeFile(path.join(OUT, "semantic.json"), JSON.stringify(out, null, 2));
  console.log(`\nWrote results/semantic.json + ${records.length} raw responses.`);
}

main().catch((e) => { console.error("semantic failed:", e); process.exit(1); });
