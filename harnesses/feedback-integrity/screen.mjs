#!/usr/bin/env node
// screen.mjs — RUNG 1: the deterministic screen.
//
// A plain, exact, zero-cost pass that flags the OBVIOUS tells in wrong-answer feedback. It is the
// cheapest rung and it is honest about its reach: it catches only what is mechanically detectable,
// and every flag it produces is a CANDIDATE, not a verdict. It deliberately does NOT try to catch
// ghost-distractors or subtle option-mismatches — those have no exact tell and are left to the
// semantic pass + adjudication. That restraint is the point: a screen that overreaches produces a
// confident-but-wrong signal, which is exactly the failure this whole instrument exists to defeat.
//
// The screen has the key (it is the bank author / QC, not the student). It flags three tells, the
// three named in the case study:
//   ARF-lexical  — a wrong option's feedback reuses >=2 of the key's DISTINCTIVE content words.
//   FOM-identical — a wrong option's feedback is byte-identical (normalized) to some option's text.
//   LCU-length    — the correct option is conspicuously the longest (a test-wise structural cue).
//
// Writes results/screen.json. Pure function of domain/ledger.json — no model, no network.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentTokens, norm, arg } from "./models.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");

const ARF_MIN_SHARED = 2;   // wrong feedback must reuse >=2 distinctive key tokens to flag
const LCU_RATIO = 1.5;      // key must be >= this multiple of the mean distractor length

function distinctiveKeyTokens(item) {
  const key = item.options.find((o) => o.correct);
  const keyTok = new Set(contentTokens(key.text));
  // remove anything that also appears in the stem or in any OTHER option's text
  const elsewhere = new Set(contentTokens(item.stem));
  for (const o of item.options) if (o !== key) for (const t of contentTokens(o.text)) elsewhere.add(t);
  return { key, distinctive: [...keyTok].filter((t) => !elsewhere.has(t)) };
}

function screenItem(item) {
  const { key, distinctive } = distinctiveKeyTokens(item);
  const distinctiveSet = new Set(distinctive);
  const optionTexts = item.options.map((o) => norm(o.text));
  const flags = [];

  for (const o of item.options) {
    if (o.correct || !o.feedback) continue;

    // ARF-lexical: feedback reuses the key's distinctive words
    const fbTok = contentTokens(o.feedback);
    const shared = [...new Set(fbTok)].filter((t) => distinctiveSet.has(t));
    if (shared.length >= ARF_MIN_SHARED) {
      flags.push({ class: "ARF", rung: "screen", option: o.id, tell: "lexical-key-reuse", evidence: shared, quote: o.feedback });
    }

    // FOM-identical: feedback normalized-equals some option's text
    const fbNorm = norm(o.feedback);
    const idx = optionTexts.indexOf(fbNorm);
    if (idx !== -1) {
      flags.push({ class: "FOM", rung: "screen", option: o.id, tell: "feedback-identical-to-option", matchesOption: item.options[idx].id, quote: o.feedback });
    }
  }

  // LCU-length: correct option conspicuously longest
  const lens = item.options.map((o) => ({ id: o.id, correct: !!o.correct, len: o.text.length }));
  const keyLen = lens.find((l) => l.correct).len;
  const others = lens.filter((l) => !l.correct).map((l) => l.len);
  const meanOther = others.reduce((a, b) => a + b, 0) / others.length;
  const isStrictMax = keyLen > Math.max(...others);
  if (isStrictMax && keyLen >= LCU_RATIO * meanOther) {
    flags.push({ class: "LCU", rung: "screen", option: key.id, tell: "key-is-longest", keyLen, meanOtherLen: Math.round(meanOther), ratio: +(keyLen / meanOther).toFixed(2) });
  }

  return flags;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const { items } = JSON.parse(await readFile(path.join(HERE, "domain/ledger.json"), "utf8"));
  const onlyArg = arg("--only", "");
  const picked = onlyArg ? items.filter((i) => onlyArg.split(",").includes(i.id)) : items;

  const perItem = {};
  for (const item of picked) perItem[item.id] = screenItem(item);

  const flat = [];
  for (const [id, flags] of Object.entries(perItem)) for (const f of flags) flat.push({ item: id, ...f });

  const out = {
    generatedNote: "Deterministic screen over domain/ledger.json. Flags are CANDIDATES, not verdicts. No GDF/subtle-FOM rule by design — those have no exact tell and are left to the semantic pass.",
    params: { ARF_MIN_SHARED, LCU_RATIO },
    nItems: picked.length,
    flags: flat,
    byItem: perItem,
  };
  await writeFile(path.join(OUT, "screen.json"), JSON.stringify(out, null, 2));

  console.log(`\n=== RUNG 1: DETERMINISTIC SCREEN (${picked.length} items) ===`);
  if (!flat.length) console.log("  (no flags)");
  for (const f of flat) console.log(`  ${f.item}  ${f.class.padEnd(4)} ${f.tell.padEnd(28)} opt ${f.option}${f.evidence ? "  [" + f.evidence.join(", ") + "]" : ""}`);
  console.log(`\nWrote results/screen.json (${flat.length} candidate flags)`);
}

main().catch((e) => { console.error("screen failed:", e); process.exit(1); });
