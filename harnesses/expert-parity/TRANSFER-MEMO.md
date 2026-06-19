# Transfer Memo — your model vs your best human expert, in 10 business days

The synthetic demo proves the instrument runs. Here's how I point it at your real domain and
return a defensible **ship / don't ship / ship-with-guardrails** call on whether your model can
do an expert's adjudication, classification, or review job.

## What I need from you

- Read access to the **policy / rulebook / rubric** the experts actually apply (the messy
  source — I do the distillation).
- **40–80 real cases** with outcomes, or one expert who can adjudicate that many on a holdout.
- **One credentialed expert** (ideally two) for the blind panel — a few hours of their time.
- The **model or system** you want measured, behind whatever interface you already have.

## The 10-day plan

**Days 1–3 — Distill & instrument.** Turn your rulebook into a structured core (entities, rules,
exceptions, precedence). Stand up the reference set from your real cases. Lock a held-out test
split your model has never seen. Deliverable: the structured-core schema + a leakage-controlled
holdout, reviewed with your expert.

**Days 4–6 — Run & score.** Your model adjudicates the holdout from the raw inputs. Score against
the expert standard: κ agreement with CIs, plus the two asymmetric error rates that actually
matter to you — **false-approve** (money/risk out the door) and **false-deny** (a good case
wrongly refused) — sliced by case type so you see *where* it breaks, not just an average.

**Days 7–8 — Blind A/B + red-team.** Your expert(s) blind-compare model vs human adjudications,
masked and order-randomized, for inter-rater reliability and a true parity read. In parallel I
run the adversarial battery for your domain (ambiguous cause, hallucinated coverage, precedence
traps, policy-boundary cases) to find the failure classes a happy-path eval misses.

**Days 9–10 — Verdict & guardrails.** A verdict card with the numbers, the error taxonomy, and a
recommendation:

- **Ship** — parity inside your non-inferiority margin, no catastrophic error class.
- **Don't ship** — a failure class that costs you money, risk, or trust.
- **Ship-with-guardrails** — parity on most slices, with the specific classes that must route to
  a human, plus the gate to enforce it.

## What you get

- The **verdict card** (κ + CI, false-approve / false-deny, per-slice parity) and the
  **error taxonomy** with worked examples.
- The **harness**, pointed at your domain, so your team re-runs it every model version — this
  becomes your standing model-launch gate, not a one-off report.
- A **golden-regression file** so a future change that regresses a known-correct case fails loudly.

It runs on your data, under your NDA, on infrastructure you approve. The number I hand you is one
your own expert helped produce and can defend in the room.
