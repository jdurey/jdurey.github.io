# Harnesses

Runnable eval and red-team harnesses behind the case studies on
[jdurey.github.io](https://jdurey.github.io). Each directory is self-contained:
the scenarios, the runner, and the scoring, so a result can be re-derived rather
than trusted.

**Principle:** every published finding links to the code that produced it. If it
isn't reproducible, it isn't here.

## Harnesses

`instruction-hierarchy-audit/` — adversarial prompt-injection scenarios run across five
models on identical inputs, ranked by where each model's instruction hierarchy collapses.

`expert-parity/` — the blind expert-parity instrument: distill a messy domain to a
structured core, adjudicate it with candidate models against a reference examiner, and
prove parity with κ + confidence intervals and a blind, masked A/B panel. Shown on a
synthetic insurance-adjudication domain so the machine is public while the real one stays
under NDA. Includes the adversarial-hardening before/after and a golden-regression lock.

`feedback-integrity/` — measures defects in AI-authored wrong-answer feedback for an MCQ
bank: answer-reveal, ghost-distractor, feedback-option mismatch, and the longest-option
length cue. A deterministic screen, a blind-solver that names the answer from the feedback
alone (the centerpiece, which catches the paraphrased leak the screen misses), and a cheap
semantic pass, scored to a per-class READY/HOLD graduation verdict against a golden set and
canary battery. Runs on a fictional K-8 Social Studies bank so the machine is public while
the real one stays under NDA.
