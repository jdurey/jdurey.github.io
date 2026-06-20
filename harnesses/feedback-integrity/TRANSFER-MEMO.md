# Transfer Memo — feedback integrity on your item bank, with a stop-checking-by-hand verdict

The synthetic demo proves the instrument runs. Here's how I point it at your real bank and return a
defensible, per-class call on when the QC can move from *in* the loop (hand-checking everything) to
*on* the loop (auditing samples).

## What I need from you

- Read access to the **item bank** in any structured export: stem, options, the key, and the
  per-option wrong-answer feedback.
- Your **standard** — what counts as answer-reveal / ghost / mismatch in your program (a short
  rubric, or one reviewer to set it with me).
- **A few dozen human-verified items per grade band** to seed the golden set and the canary battery.
- The **cheap and strong models** you want in the loop (or I bring sensible defaults).

## The plan

**1 — Map & instrument.** Turn your standard into the deterministic screen's exact rules, stand up
the blind-solver against your bank, and lock a golden set + canary battery from your verified items.
Deliverable: the screen, the solver, and a golden file your reviewer signs.

**2 — Run & score.** Screen the whole bank for free, run the blind-solver in bulk on a cheap/local
model (keys withheld, raw responses saved), and run the cheap semantic pass. Score every defect
class against the golden set: recall, a noise tripwire, the canary check, and the false-clean
guards. Deliverable: the per-class scorecard.

**3 — Adjudicate the short list.** Only the surfaced candidates reach a strong model or a human, who
makes the actual call citing the specific phrase and the key language it echoes. Cheap rungs
proposed; this rung disposes. Deliverable: confirmed findings with verbatim evidence.

**4 — Graduation verdict + feedback loop.** A per-class **READY / HOLD** card: which classes can run
unsupervised on your bank and which keep a human, with the canary battery that keeps the claim
honest as the bank changes. Then the deepest move — feed every confirmed failure back into the
authoring prompt, so the next grade's bank is written without the defect in the first place.

## What you get

- The **per-class scorecard** (recall, noise tripwire, canary catch, READY/HOLD) and the **error
  taxonomy** with worked examples from *your* bank.
- The **harness**, pointed at your bank, so your team re-runs it every authoring change — a standing
  QC gate, not a one-off report.
- A **golden set + canary battery** so a future change that regresses a known-broken item fails
  loudly, and a clean run has to survive its own zero.

It runs on your data, under your NDA, on infrastructure you approve. A note on the cheap rung: the
public demo runs a 3B local model and shows it collapse — useful proof that the instrument never
auto-trusts the cheap pass. On your bank the cheap rung is a frontier-small model that actually
discriminates, and it still only ever *proposes*.
