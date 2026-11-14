# Thankly RL Shopping-Agent Evaluation Kit: Week-1 Rollout Playbook

## Overview
This playbook guides Thankly's ops and engineering teams through a safe, production-grade rollout of the RL Shopping-Agent JSON Governance & Reward Calibration Kit. The goal is to enforce structured agent evaluation, reward rubric calibration, and robust human checkpoints across all conversational storefronts and checkout flows.

## Day 1-2: Environment Setup & Baseline Runs
- Deploy the four-stage pipeline (Normalizer, ProductVerifier, RubricGrader, HumanOps) in a staging environment.
- Run 20+ real Thankly shopper queries (including the four provided cases) through both the naive chatbot and the orchestrated pipeline.
- Compare outputs, focusing on JSON contract compliance, schema validation, and escalation accuracy.

## Day 3-4: Human Checkpoint Calibration
- Review all escalated cases with Thankly's human reviewers.
- Refine escalation triggers: ambiguous product variants, external PII, unsupported integrations, and prompt-injection attempts must always trigger `escalate_to_human: true`.
- Document edge cases and update the normalization schema as needed.

## Day 5: Reward Rubric & Anti-Gaming Audit
- Use the RubricGrader to calibrate reward scores across at least 3 storefronts (ChatGPT, Claude, Gemini).
- Cross-check agent scores with human reviewer judgments, targeting >95% agreement.
- Flag any reward-gaming or self-enhancement bias for remediation.

## Day 6-7: Adoption Metrics & SOP Finalization
- Track: (a) JSON contract compliance rate, (b) escalation accuracy, (c) reviewer agreement, (d) false positive/negative rates.
- Set up daily review standups to discuss flagged cases and update SOPs.
- Prepare a 1-page summary of adoption metrics and lessons learned for Thankly leadership.

## Ongoing
- Continue refining schema and escalation logic based on new product launches and shopper behaviors.
- Maintain a living FAQ and SOP doc for onboarding new reviewers and engineers.