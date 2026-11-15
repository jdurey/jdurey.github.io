# Harvey Legal Eval Router: Week-1 Rollout Playbook

## Objective
Deploy the Legal Eval Router pipeline to enforce structured JSON governance, golden-set rubric scoring, and explicit policy/human checkpoints for all post-training and benchmarking workflows in Harvey's legal LLM stack.

## Day 1-2: Integration & Baseline Testing
- Integrate the router into the post-training eval API and agentic workflow endpoints.
- Run the provided four test cases, confirming that each emits a valid JSON contract with correct schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.
- Validate that ambiguous, incomplete, or policy-risking inputs are flagged and routed to human review.

## Day 3-4: Human Reviewer SOPs
- Train legal ops and data science reviewers on the JSON contract fields and audit rationale expectations.
- Establish a dual-reviewer protocol for all escalate_to_human: true cases, requiring reviewer agreement before finalizing eval or training signal.
- Document reviewer feedback and edge cases for continuous rubric calibration.

## Day 5: Adoption Metrics & Feedback Loop
- Track adoption metrics: percent of evals routed through the JSON contract, rate of human escalations, reviewer agreement rates, and time-to-resolution for flagged cases.
- Collect feedback from legal experts and data engineers on rubric clarity, false positive/negative rates, and operational friction.
- Iterate on rubric criteria and policy gating logic based on reviewer and customer feedback.

## Ongoing: Safeguard & Continuous Improvement
- Monitor for new schema drift, unsupported integrations, or emerging policy risks.
- Update the router's normalization and gating logic as Harvey's legal workflows and product integrations evolve.
- Maintain a living audit trail of all escalated and refused cases for compliance and RL signal calibration.

**Success is measured by: (1) zero unreviewed policy or schema violations passing to production, (2) >95% reviewer agreement on escalated cases, and (3) measurable reduction in reward-gaming, hallucination, and compliance risk in Harvey's legal LLM outputs.**