// probe.mjs — fire the SAME grading call N times per subject and record each verdict.
//
//   node probe.mjs                 # 30 reps/subject, temp 0.7 (config.json defaults)
//   node probe.mjs --n 50 --temp 1.0
//   node probe.mjs --force         # ignore the cached run and re-probe
//
// The whole method is here: identical input, repeated. A sound grader returns the same verdict every
// time. We save every raw response (the system of record) and a structured verdicts file that the
// deterministic scorer reads. The model is only ever called here; scoring needs no model.
//
// Subject is the local reproducible baseline (Llama 3.2 3B via ollama). The same probe runs against any
// hosted grading endpoint by swapping runLocal for that call; hosted endpoints also show drift over time,
// which a single-machine local run cannot, so we claim drift only where we measured it (see README).

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { runLocal, extractJSON, arg } from "../_scaffold/core.mjs";

const HERE = new URL(".", import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(HERE + "config.json", "utf8"));
const N = parseInt(arg("--n", String(cfg.n)), 10);
const TEMP = parseFloat(arg("--temp", String(cfg.temperature)));
const FORCE = process.argv.includes("--force");

const { item, subjects } = JSON.parse(readFileSync(HERE + "domain/items.json", "utf8"));
const RAW = HERE + "results/raw_probe/";
const OUT = HERE + "results/verdicts.json";
mkdirSync(RAW, { recursive: true });

if (existsSync(OUT) && !FORCE) {
  console.log(`[probe] ${OUT} exists — reusing (use --force to re-probe)`);
  process.exit(0);
}

// The grading prompt mirrors the ordinary shape of an FRQ AI-grader: question, accepted examples,
// rubric, student answer, return a JSON verdict. Nothing here is model-specific.
function gradePrompt(answer) {
  return [
    "You are grading a student's short free-response answer. Decide if it earns a pass.",
    "",
    "Question:",
    item.prompt,
    "",
    "Accepted example answers (examples of strong answers, NOT an exhaustive list):",
    ...item.accepted_examples.map((a) => "- " + a),
    "",
    "Grading criteria:",
    item.rubric,
    "",
    "Student answer:",
    answer,
    "",
    'Return ONLY a JSON object on one line: {"correct": true or false, "feedback": "one short sentence"}.',
  ].join("\n");
}

function verdictOf(text) {
  const j = extractJSON(text);
  if (!j || typeof j.correct !== "boolean") return { verdict: "ABSTAIN", feedback: "" };
  return { verdict: j.correct ? "PASS" : "FAIL", feedback: String(j.feedback || "").slice(0, 240) };
}

const rows = [];
const startedAt = new Date().toISOString();
for (const s of subjects) {
  const prompt = gradePrompt(s.answer);
  let pass = 0, fail = 0, abstain = 0;
  for (let i = 0; i < N; i++) {
    let raw = "";
    try {
      raw = await runLocal(prompt, { temperature: TEMP, num_predict: 160 });
    } catch (e) {
      raw = `__ERROR__ ${String(e).slice(0, 200)}`;
    }
    writeFileSync(`${RAW}${s.id}__${String(i).padStart(3, "0")}.txt`, raw);
    const { verdict, feedback } = verdictOf(raw);
    if (verdict === "PASS") pass++; else if (verdict === "FAIL") fail++; else abstain++;
    rows.push({ subject: s.id, rep: i, verdict, feedback });
  }
  console.log(`[probe] ${s.id.padEnd(10)} valid=${s.valid}  PASS=${pass} FAIL=${fail} ABSTAIN=${abstain}  (n=${N})`);
}

writeFileSync(
  OUT,
  JSON.stringify(
    { item_id: item.id, subject: "ollama:llama3.2:3b", temperature: TEMP, n: N, started_at: startedAt, finished_at: new Date().toISOString(), rows },
    null,
    2
  )
);
console.log(`[probe] wrote ${OUT}  (${rows.length} verdicts, ${subjects.length} subjects x ${N} reps)`);
