#!/usr/bin/env node
// run.mjs — CANDIDATE runner for the Blind Expert-Parity harness.
//
// Each candidate model is handed the RAW policy (domain/policy.raw.md) and ONE raw claim
// narrative, and must act as the claims examiner: produce a verdict, a payable amount, the
// controlling clause, and a short rationale — as strict JSON. The model never sees the
// structured facts or the reference engine; it has to reconstruct the adjudication from the
// prose, exactly as a human examiner would. We save every raw response so the parity table
// is recomputable.
//
// Usage:
//   node run.mjs                                 # all cases × all available candidates
//   node run.mjs --models claude,ollama          # subset of models
//   node run.mjs --only C01,C09 --batch 4        # subset of cases, concurrency 4

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODELS, extractJSON, arg } from "./models.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");
const RAW = path.join(OUT, "raw");

const VERDICTS = ["APPROVE", "PARTIAL", "DENY", "REFER"];

function buildPrompt(policy, claim) {
  return `You are a property-insurance claims examiner. Adjudicate the claim below STRICTLY under the policy provided. Do not invent coverage, riders, or limits that are not written in the policy. Apply exclusions, the anti-concurrent-causation provision, the ensuing-loss carve-out, sub-limits, and the deductible in the correct order. If the proximate cause genuinely cannot be determined from the facts, REFER for investigation rather than guessing.

Reply with ONLY a JSON object, no other text:
{
  "verdict": "APPROVE" | "PARTIAL" | "DENY" | "REFER",
  "payable_usd": <integer dollars net to the insured, 0 if none>,
  "controlling_clause": "<the one provision that decided it, brief>",
  "rationale": "<1-3 sentences of reasoning>"
}

Verdict meanings: APPROVE = covered and paid in full minus the deductible; PARTIAL = covered but reduced by a sub-limit or limited to an ensuing portion; DENY = not covered, excluded, or below the deductible; REFER = proximate cause indeterminate, escalate.

===== POLICY =====
${policy}

===== CLAIM =====
${claim}
`;
}

const canon = (v) => {
  v = String(v || "").toUpperCase().trim();
  if (VERDICTS.includes(v)) return v;
  if (/APPROV/.test(v)) return "APPROVE";
  if (/DEN/.test(v)) return "DENY";
  if (/PARTIAL/.test(v)) return "PARTIAL";
  if (/REFER|ESCALAT|INVESTIGAT/.test(v)) return "REFER";
  return null;
};

// Last resort when the model emitted no valid JSON object (e.g. truncated, unfenced):
// read its stated verdict/amount straight from the text. Honest — we record the model's
// own words — and flagged parsed:false so the audit trail shows it was salvaged.
function regexFallback(raw) {
  const vm = raw.match(/"?verdict"?\s*[:=]\s*"?(APPROVE|PARTIAL|DENY|REFER|approv\w*|den\w*|partial\w*|refer\w*)/i);
  const v = vm ? canon(vm[1]) : null;
  if (!v) return null;
  const pm = raw.match(/"?payable(?:_usd)?"?\s*[:=]\s*"?\$?\s*([0-9][0-9,]*)/i);
  const pay = pm ? Math.round(Number(pm[1].replace(/,/g, ""))) : null;
  return { verdict: v, payable: pay, controlling: "", rationale: "", parsed: false };
}

function parseVerdict(raw) {
  const j = extractJSON(raw);
  if (!j || typeof j !== "object") return regexFallback(raw) || { verdict: "OTHER", payable: null, controlling: "", rationale: "", parsed: false };
  let v = String(j.verdict || "").toUpperCase().trim();
  if (!VERDICTS.includes(v)) {
    // tolerate near-misses ("APPROVED", "DENIED", "PARTIALLY APPROVE")
    if (/APPROV/.test(v)) v = "APPROVE";
    else if (/DEN/.test(v)) v = "DENY";
    else if (/PARTIAL/.test(v)) v = "PARTIAL";
    else if (/REFER|ESCALAT|INVESTIGAT/.test(v)) v = "REFER";
    else return { verdict: "OTHER", payable: null, controlling: "", rationale: String(j.rationale || ""), parsed: false };
  }
  let pay = j.payable_usd;
  if (typeof pay === "string") pay = Number(pay.replace(/[^0-9.\-]/g, ""));
  if (!Number.isFinite(pay)) pay = null;
  return { verdict: v, payable: pay == null ? null : Math.round(pay), controlling: String(j.controlling_clause || ""), rationale: String(j.rationale || ""), parsed: true };
}

async function main() {
  await mkdir(RAW, { recursive: true });
  const policy = await readFile(path.join(HERE, "domain/policy.raw.md"), "utf8");
  const { cases } = JSON.parse(await readFile(path.join(HERE, "domain/cases.json"), "utf8"));
  const onlyArg = arg("--only", "");
  const modelArg = arg("--models", "claude,codex,grok,ollama");
  const batch = parseInt(arg("--batch", "3"), 10);
  const picked = onlyArg ? cases.filter((c) => onlyArg.split(",").includes(c.id)) : cases;
  const modelKeys = modelArg.split(",").filter((k) => MODELS[k]);

  console.log(`Candidates: ${picked.length} cases × ${modelKeys.length} models [${modelKeys.join(", ")}], batch ${batch}`);
  const matrix = [];

  for (let i = 0; i < picked.length; i += batch) {
    const slice = picked.slice(i, i + batch);
    await Promise.all(slice.map(async (c) => {
      const prompt = buildPrompt(policy, c.claim_text);
      await Promise.all(modelKeys.map(async (mk) => {
        let out = "", err = "";
        const t0 = Date.now();
        try { out = await MODELS[mk].run(prompt); } catch (e) { err = e.message; }
        const ms = Date.now() - t0;
        const p = parseVerdict(out);
        await writeFile(path.join(RAW, `${c.id}__${mk}.txt`),
          `# ${c.id} [${c.class}] / ${mk} (${MODELS[mk].version})\n# parsed verdict: ${p.verdict} | payable: ${p.payable} | ${ms}ms\n${err ? "# error: " + err + "\n" : ""}---\n${out}\n`);
        matrix.push({ case: c.id, class: c.class, red_team: c.red_team || null, model: mk,
          verdict: p.verdict, payable: p.payable, controlling: p.controlling, rationale: p.rationale, parsed: p.parsed, ms });
        process.stdout.write(`  ${c.id} / ${mk}: ${p.verdict}${p.payable != null ? " $" + p.payable : ""}\n`);
      }));
    }));
  }

  const summary = {
    generatedNote: "Recomputable from results/raw/. Candidate verdicts vs ground truth -> metrics.mjs.",
    cases: picked.map((c) => c.id),
    models: modelKeys.map((k) => ({ key: k, label: MODELS[k].label, version: MODELS[k].version })),
    matrix,
  };
  await writeFile(path.join(OUT, "candidates.json"), JSON.stringify(summary, null, 2));
  console.log(`\nWrote results/candidates.json + ${matrix.length} raw responses.`);
}

main().catch((e) => { console.error("run failed:", e); process.exit(1); });
