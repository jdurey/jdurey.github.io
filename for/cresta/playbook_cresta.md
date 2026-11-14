# Cresta Agent Orchestration: Week-1 Rollout Playbook

## Objective
Deploy and operationalize the unified JSON governance and escalation pipeline for all customer-facing AI agent workflows, ensuring every agent action is production-safe, auditable, and compliant with Cresta's standards.

## Day 1-2: Onboarding & Baseline Setup
- Review the JSON contract specification with Forward Deployed Engineers and Product Managers.
- Integrate the Input Normalization & Pre-Screen and Tool/Route Schema Validation stages into the Cresta agent workflow sandbox.
- Configure domain-specific normalization rules for key customer intents (e.g., loyalty updates, booking, refund, escalation).

## Day 3-4: Human Checkpoint Calibration
- Run the four provided test cases through the pipeline, verifying that ambiguous, incomplete, or policy-violating requests are correctly escalated.
- Establish a human-in-the-loop review queue for all outputs with `escalate_to_human: true` or `policy_flag: true`.
- Document escalation SOPs: e.g., any request with external PII, unsupported integration, or ambiguous schema fields must be held for human review before execution.

## Day 5: Production Shadow & Audit
- Enable shadow mode: route live customer/agent requests through the pipeline in parallel with existing workflows, logging all JSON outputs and audit rationales.
- Track adoption metrics: percentage of requests correctly flagged/escalated, time-to-human-review, and false positive/negative rates.
- Hold a daily standup with FDEs and PMs to review flagged cases, update normalization rules, and refine escalation triggers.

## Week 1 Success Metrics
- 100% of ambiguous, incomplete, or policy-risk requests are held for human review.
- Zero PII or unsupported integration actions reach production without escalation.
- All agent outputs are fully auditable via the unified JSON contract, with clear checkpoint_reason fields for every action.

## Next Steps
- Expand the pipeline to additional customer workflows and new integration channels as validated.
- Iterate on normalization and policy rules based on real-world feedback and audit findings.
- Train customer-facing teams on interpreting JSON contract outputs and handling escalations efficiently.