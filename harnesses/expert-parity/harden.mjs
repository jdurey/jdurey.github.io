#!/usr/bin/env node
// harden.mjs — adversarial hardening: naive examiner vs hardened examiner.
//
// The reference examiner started naive: identify the covered peril, apply sub-limit + deductible,
// done. That first draft silently mis-adjudicates the cases that need the four subtle rules —
// anti-concurrent causation (R2), the ensuing-loss carve-out (R3), the vacancy override (R6), and
// refer-don't-guess (R7). Those are exactly the cases an adversary (or a careless model) exploits:
// a flood loss wrapped in a wind claim gets paid; a vacant-house claim gets paid; an unknowable
// cause gets guessed. This script runs the precedence battery through both engines, scores each
// against the hand-verified golden file, and writes the before/after exploitability table. The
// golden file (golden/regression.json) locks the correct verdicts so a future engine edit that
// regresses any of them fails the test.
//
// Usage: node harden.mjs   (writes results/hardening.json + golden/regression.json)

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adjudicate } from "./engine.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const { cases } = JSON.parse(await readFile(path.join(HERE, "domain/cases.json"), "utf8"));
  // the adversarial / judgment battery = every red-team-flagged case (precedence + boundary + ambiguous + hallucination)
  const battery = cases.filter((c) => c.red_team);

  const rows = battery.map((c) => {
    const naive = adjudicate(c.facts, { hardened: false });
    const hard = adjudicate(c.facts, { hardened: true });
    return {
      case: c.id, class: c.class, red_team: c.red_team,
      gold: c.intended_verdict, goldPay: c.intended_payable,
      naive: naive.verdict, naivePay: naive.payable, naiveOK: naive.verdict === c.intended_verdict,
      hardened: hard.verdict, hardenedPay: hard.payable, hardenedOK: hard.verdict === c.intended_verdict,
    };
  });

  const naiveWrong = rows.filter((r) => !r.naiveOK);
  const hardenedWrong = rows.filter((r) => !r.hardenedOK);
  // exploitability = a wrong verdict that LEAKS MONEY (pays when it should not) or denies a valid claim
  const PAYS = new Set(["APPROVE", "PARTIAL"]);
  const exploit = (r, who) => (PAYS.has(r[who]) && !PAYS.has(r.gold)); // money out the door wrongly
  const naiveExploits = rows.filter((r) => exploit(r, "naive"));
  const hardenedExploits = rows.filter((r) => exploit(r, "hardened"));

  const out = {
    generatedNote: "Naive vs hardened reference examiner on the adversarial battery. 'exploit' = pays a claim it should deny (money leak).",
    battery: rows.length,
    naive: { wrong: naiveWrong.length, exploitableMoneyLeaks: naiveExploits.length, leakCases: naiveExploits.map((r) => r.case) },
    hardened: { wrong: hardenedWrong.length, exploitableMoneyLeaks: hardenedExploits.length },
    rows,
  };
  await writeFile(path.join(HERE, "results", "hardening.json"), JSON.stringify(out, null, 2));

  // golden-regression file: lock every battery case's correct verdict + payable
  await mkdir(path.join(HERE, "golden"), { recursive: true });
  const golden = {
    _doc: "Golden-regression lock for the reference examiner. node harden.mjs --check asserts the HARDENED engine reproduces every entry; any regression fails. Covers the adversarial precedence/boundary/ambiguous/hallucination battery.",
    cases: rows.map((r) => ({ case: r.case, verdict: r.gold, payable: r.goldPay })),
  };
  await writeFile(path.join(HERE, "golden", "regression.json"), JSON.stringify(golden, null, 2));

  console.log(`\n=== ADVERSARIAL HARDENING (battery of ${rows.length}) ===`);
  console.log("case  class                 red-team            gold       naive       hardened");
  for (const r of rows) {
    const flag = (ok, leak) => (ok ? "  ok" : leak ? " LEAK" : " miss");
    console.log(`${r.case}  ${(r.class || "").padEnd(20)} ${(r.red_team || "").padEnd(18)} ${r.gold.padEnd(8)} ${r.naive.padEnd(8)}${flag(r.naiveOK, exploit(r, "naive"))}  ${r.hardened.padEnd(8)}${flag(r.hardenedOK, exploit(r, "hardened"))}`);
  }
  console.log(`\nnaive:    ${naiveWrong.length}/${rows.length} wrong, ${naiveExploits.length} money-leak exploits (${naiveExploits.map((r) => r.case).join(", ")})`);
  console.log(`hardened: ${hardenedWrong.length}/${rows.length} wrong, ${hardenedExploits.length} money-leak exploits`);
  console.log(`Wrote results/hardening.json + golden/regression.json`);
}

// --check mode: assert hardened engine still matches the golden lock (regression gate)
async function check() {
  const golden = JSON.parse(await readFile(path.join(HERE, "golden", "regression.json"), "utf8"));
  const { cases } = JSON.parse(await readFile(path.join(HERE, "domain/cases.json"), "utf8"));
  const byId = Object.fromEntries(cases.map((c) => [c.id, c]));
  let fail = 0;
  for (const g of golden.cases) {
    const r = adjudicate(byId[g.case].facts, { hardened: true });
    if (r.verdict !== g.verdict || r.payable !== g.payable) { fail++; console.log(`REGRESSION ${g.case}: got ${r.verdict}/$${r.payable} want ${g.verdict}/$${g.payable}`); }
  }
  console.log(fail ? `\n${fail} REGRESSIONS` : `\nGolden OK: ${golden.cases.length}/${golden.cases.length} hardened verdicts match.`);
  process.exit(fail ? 1 : 0);
}

(process.argv.includes("--check") ? check() : main()).catch((e) => { console.error("harden failed:", e); process.exit(1); });
