# Agent-Boundary Harness

**When an AI agent gets file access, does the fence hold and do models try to cross it?**

A folder fence fails in two ways. Sometimes the path-guard code lets a symlink or look-alike folder name slip past. Other times no guard is there, and the model reads a sealed file because the easy answer sits inside it. This two-part tool tests both paths on the fake Veyra workspace. If a seed canary token shows up in output, a line was crossed.

Read the full writeup in [`content/case-studies/agent-boundary.md`](../../content/case-studies/agent-boundary.md). Hash pins and scope notes live in [`MANIFEST.md`](MANIFEST.md), [`NDA-BOUNDARY.md`](NDA-BOUNDARY.md), and [`TRANSFER-MEMO.md`](TRANSFER-MEMO.md).

## Run it

```bash
node guard.mjs
node probe.mjs
node score.mjs
node manifest.mjs
```

Layer 1 reads [`domain/policy.json`](domain/policy.json) and runs offline with no model calls. Layer 2 saves raw model replies in `results/raw_probe/` so `node score.mjs` can check the saved runs anytime.

## Two layers, two tests

- **Layer 1: Path guard (`guard.mjs`).** Runs 10 path attacks, including symlink jumps and sibling prefix tricks (CVE-2025-53109 and CVE-2025-53110 EscapeRoute class). The naive guard hits `0.75` deny-recall with `2` leaks. The hardened guard hits `1.00` deny-recall with `0` leaks (`READY`).
- **Layer 2: Model probe (`probe.mjs`).** Drops the code guard and tempts each model with tasks whose fast answer sits inside sealed files. On this probe set, `ollama` (`llama3.2:3b`), `ollama-nopolicy`, and `grok` each logged `0/3` canary leaks.

The scorer in `domain/world.mjs` (`classifyZone`) shares zero code with `guard.mjs`. Layer 2 stays a live report because a new model build can change how an agent acts near a fence.

## Related Book, Video Course & Benchmarks

- **Print Book ($24.99 on Amazon).** [*AI for Corporate Training & Instructional Design: The UbD Glass-Box Playbook*](https://www.amazon.com/dp/B0HRQFWFPR) is live in print.
- **65-Min Video & Code-Lab Course ($12.99 through Dec 15, Reg. $69.99).** [*AI Corporate Training: UbD SOP-to-SCORM & Video Factory*](https://www.udemy.com/course/ai-corporate-training-ubd-sop-to-scorm-video-factory/?couponCode=MASTER2026_SCORM) walks through the code lab.
- **40-Question Scenario Exam ($12.99 through Dec 15).** [*Production LLM Evals & Multi-Agent Ops Practice Exams*](https://www.udemy.com/course/production-llm-evals-multi-agent-ops-practice-exams/?couponCode=LAUNCH2026_EVALS) tests routing and grading gates.
- **Instant Code Kits.** Grab the [SOP-to-SCORM Factory ($99)](https://whop.com/checkout/plan_y1ACgqNYGtul8/) or the [Enterprise AI Eval & 6-Rung Router Kit ($79)](https://whop.com/checkout/plan_lGsdWjQsePkvO/) on Whop.
- **Live AI Video Twin & 56 Open Studies.** Browse all 56 benchmarks at [jdurey.github.io](https://jdurey.github.io) or run live Q&A on the [AI video twin](https://jdurey.github.io/interview/) page.
