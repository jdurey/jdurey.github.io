# Harnesses

Runnable eval and red-team harnesses behind the case studies on
[jdurey.github.io](https://jdurey.github.io). Each directory is self-contained:
the scenarios, the runner, and the scoring, so a result can be re-derived rather
than trusted.

**Principle:** every published finding links to the code that produced it. If it
isn't reproducible, it isn't here.

## Coming first

`instruction-hierarchy-audit/` — 20 adversarial scenarios run across four frontier
models simultaneously, ranked by where each model's instruction hierarchy collapses.
Publishing with the case study once the run is complete and the ordering is verified
to be structural (i.e. it survives an adversary trying to explain it away).
