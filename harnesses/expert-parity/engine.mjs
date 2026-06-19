// engine.mjs — the REFERENCE EXAMINER.
//
// This is the "credentialed human expert" slot in the parity harness, filled here by a
// deterministic rules engine so the public demo has defensible ground truth without an
// NDA'd human. It consumes the STRUCTURED facts of a claim (the distilled core) and the
// policy core, applies the policy's precedence order, and returns a disposition plus the
// controlling clause and a templated rationale. Candidate models never see this file or
// the structured facts — they read only domain/policy.raw.md and the raw claim narrative,
// and must reconstruct this reasoning. The transfer memo explains how a real human examiner
// drops into exactly this slot (their adjudications replace adjudicate()'s output; every
// downstream metric is unchanged).
//
// The naive vs hardened toggle (HARDENED=false) exists for the adversarial-hardening
// section: the naive engine omits anti-concurrent causation, the ensuing-loss carve-out,
// the vacancy override, and the refer-don't-guess rule, and gets the precedence battery
// wrong. See harden.mjs + golden/regression.json.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const POLICY = JSON.parse(readFileSync(path.join(HERE, "domain/policy.core.json"), "utf8"));

const subLimitFor = (category, peril) => {
  const sl = POLICY.sub_limits.find((s) => s.category === category);
  if (!sl) return null;
  // jewelry / firearms sub-limits bite for THEFT only; others bite for all perils.
  if (sl.perils === "theft only" && peril !== "theft") return null;
  return sl.limit;
};

const deductibleFor = (peril) =>
  peril === "windstorm_or_hail" ? POLICY.deductibles.wind_hail : POLICY.deductibles.standard;

const isCovered = (peril) => POLICY.covered_perils.includes(peril);
const exclusion = (id) => POLICY.exclusions.find((e) => e.id === id);

const fmt = (n) => "$" + Number(n).toLocaleString("en-US");

/**
 * Adjudicate one claim from its structured facts.
 * facts: {
 *   proximate_peril: covered-peril id | exclusion id | "indeterminate",
 *   contributing_excluded: [exclusion id, ...],   // concurrent excluded causes
 *   ensuing_peril: covered-peril id | null,        // for ensuing-loss cases
 *   ensuing_amount: number,                        // covered ensuing portion
 *   amount_claimed: number,
 *   item_category: sub-limit category | "dwelling" | "general",
 *   vacancy_days: number
 * }
 * @param {object} opts - { hardened: boolean }
 */
export function adjudicate(facts, opts = {}) {
  const hardened = opts.hardened !== false; // default ON
  const f = {
    contributing_excluded: [],
    ensuing_peril: null,
    ensuing_amount: 0,
    item_category: "general",
    vacancy_days: 0,
    ...facts,
  };

  // --- R6: vacancy override (precedence #1) ---
  if (hardened && f.vacancy_days > 60) {
    return decide("DENY", 0, "R6_vacancy_override",
      `Dwelling was vacant ${f.vacancy_days} consecutive days (> 60) immediately before the loss. ` +
      `Vacancy denies coverage regardless of peril.`, f);
  }

  // --- R7: genuinely indeterminate proximate cause -> REFER, don't guess ---
  if (f.proximate_peril === "indeterminate") {
    if (!hardened) {
      // naive examiner guesses "covered" and approves — the trap.
      return applyMoney(f.amount_claimed, "windstorm_or_hail_GUESS", f, "R1_covered_peril_required",
        `Cause unclear; assumed a covered peril.`, hardened);
    }
    return decide("REFER", 0, "R7_burden_of_proof",
      `Evidence is equally consistent with a covered peril and an excluded peril. ` +
      `Proximate cause cannot be established from the facts; refer for investigation rather than guess.`, f);
  }

  const proximateExcluded = exclusion(f.proximate_peril);

  // --- Excluded proximate cause ---
  if (proximateExcluded) {
    // R3: ensuing-loss carve-out (only wear_and_tear / mold), hardened only
    if (hardened && proximateExcluded.ensuing_loss_eligible && f.ensuing_peril && isCovered(f.ensuing_peril)) {
      const r = applyMoney(f.ensuing_amount, f.ensuing_peril, f, "R3_ensuing_loss",
        `Excluded cause (${proximateExcluded.label.toLowerCase()}) is not covered, but it led to a ` +
        `separate ensuing ${label(f.ensuing_peril)} loss, which IS covered. ` +
        `Only the ensuing ${fmt(f.ensuing_amount)} is eligible; the cost to fix the excluded cause is not.`,
        hardened, /*forcePartial*/ true);
      return r;
    }
    // otherwise: excluded -> DENY
    return decide("DENY", 0, "R1_covered_peril_required",
      `Proximate cause is ${proximateExcluded.label.toLowerCase()}, an excluded peril` +
      (proximateExcluded.ensuing_loss_eligible ? ` with no separate ensuing covered peril` : ``) + `. Not covered.`, f);
  }

  // --- Covered proximate cause ---
  if (isCovered(f.proximate_peril)) {
    // R2: anti-concurrent causation — any excluded contributing cause excludes the whole loss
    if (hardened && f.contributing_excluded.length > 0) {
      const ex = exclusion(f.contributing_excluded[0]);
      return decide("DENY", 0, "R2_anti_concurrent_causation",
        `Proximate cause is ${label(f.proximate_peril)} (covered), but ${ex.label.toLowerCase()} ` +
        `contributed concurrently. Under anti-concurrent causation the loss is excluded even though a ` +
        `covered peril also contributed.`, f);
    }
    return applyMoney(f.amount_claimed, f.proximate_peril, f, "R1_covered_peril_required",
      `Proximate cause is ${label(f.proximate_peril)}, a covered peril, with no controlling exclusion.`,
      hardened);
  }

  // unknown peril id
  return decide("DENY", 0, "R1_covered_peril_required",
    `No covered peril identified for this loss.`, f);
}

// Apply sub-limit (R4) then deductible (R5) to a covered base amount.
function applyMoney(base, peril, f, baseRule, lead, hardened, forcePartial = false) {
  let reasons = [lead];
  let subLimitCapped = false;

  const cap = subLimitFor(f.item_category, peril); // sub-limits are basic; the hardening battery is R2/R3/R6/R7
  let amount = base;
  if (cap != null && base > cap) {
    amount = cap;
    subLimitCapped = true;
    reasons.push(`The ${f.item_category.replace(/_/g, " ")} sub-limit caps the ${fmt(base)} loss at ${fmt(cap)} (applied before the deductible).`);
  }
  const reduced = subLimitCapped || forcePartial;

  const ded = deductibleFor(peril);
  const net = amount - ded;
  reasons.push(`The ${fmt(ded)} ${peril === "windstorm_or_hail" ? "wind/hail " : ""}deductible is subtracted, leaving ${fmt(Math.max(net, 0))}.`);

  if (net <= 0) {
    return decide("DENY", 0, "R5_deductible",
      reasons.join(" ") + ` Net payable is at or below zero — below the deductible, nothing is payable.`, f, baseRule);
  }
  const verdict = reduced ? "PARTIAL" : "APPROVE";
  const controlling = subLimitCapped ? "R4_sub_limit_cap" : baseRule;
  return decide(verdict, net, controlling, reasons.join(" "), f, baseRule);
}

function decide(verdict, payable, controlling_clause, rationale, facts, baseRule) {
  return { verdict, payable: Math.round(payable), controlling_clause, rationale };
}

const label = (id) => (id || "").replace(/_or_/g, "/").replace(/_/g, " ");

// Reference rationale shown to blind judges (identity-masked, no "the engine"/"the examiner" tells).
export function referenceRationale(facts, result) {
  const v = result.verdict;
  const pay = result.payable > 0 ? ` Payable: ${fmt(result.payable)}.` : ` Payable: $0.`;
  return `${result.rationale} Disposition: ${v}.${pay}`;
}

export { fmt };
