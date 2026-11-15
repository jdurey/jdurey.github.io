# Playlab Trust & Safety JSON Router: Week-1 Rollout & Ops Playbook

## Overview
This playbook enables Playlab's Trust & Safety Lead, Education to operationalize the JSON router and moderation pipeline for educator app submissions and live incident triage. The system ensures every moderation action, policy checkpoint, and ambiguous schema is handled with Playlab-specific taxonomy, FERPA/COPPA compliance, and a fully auditable JSON contract.

## Day 1-2: Setup & Calibration
- Deploy the router agent in a staging environment, connecting it to the educator app submission and flagged content queues.
- Review and calibrate Playlab's harm taxonomy and labeling rubric within the router prompt.
- Run the provided four test cases, confirming correct JSON outputs, escalation triggers, and audit rationale.

## Day 3-4: Human Checkpoint Training
- Train Trust & Safety and moderation staff on interpreting router JSON outputs, focusing on `policy_flag`, `escalate_to_human`, and `checkpoint_reason` fields.
- Establish a Slack or ticketing workflow for escalated cases, ensuring every ambiguous, high-risk, or policy-violating submission is reviewed within 24 hours.
- Document SOPs for handling flagged PII, ambiguous schema fields, unsupported integrations, and prompt-injection attempts.

## Day 5: Live Pilot & Feedback Loop
- Enable the router on a subset of live educator app submissions and incident reports.
- Track key adoption metrics: percentage of submissions with valid schema, number of human escalations, and time-to-resolution for flagged cases.
- Collect feedback from moderators and educators on clarity of router responses and audit trails.

## Week-1 Metrics
- Target: 100% of flagged or ambiguous cases emit a valid JSON contract with clear audit rationale.
- Target: All unverified PII exports and unsupported integrations are blocked or escalated.
- Target: Human review resolves all escalated cases within 24 hours.

## Continuous Improvement
- Review escalation logs weekly to refine taxonomy, labeling rubrics, and router prompt.
- Update SOPs as new policy risks or schema edge cases are discovered.
- Schedule monthly cross-team reviews with engineering and privacy leads to ensure ongoing compliance and platform safety.