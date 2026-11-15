# DataCamp AI Tutor Router: Week-1 Rollout Playbook

## Overview
This playbook guides DataCamp's curriculum and assessment, engineering, and support teams through the first week of deploying the AI Tutor Router. The router enforces schema, curriculum, and policy guardrails for all AI tutor interactions, ensuring every workflow is standards-aligned, auditable, and ready for human escalation when ambiguity or risk is detected.

## Day 1-2: Integration and Smoke Testing
- Deploy the router as a middleware service between the AI tutor frontend and backend grading/content APIs.
- Run the provided four test cases and at least 10 real DataCamp learner submissions through the router.
- Confirm that every output is a valid JSON contract, with correct action, schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.
- Log all escalations and refusals for review.

## Day 3-4: Human Checkpoint SOPs
- Assign a curriculum or support team member to review all cases where escalate_to_human: true.
- For each escalation, use the substantive_deliverable and detected_risks_or_gaps fields to guide manual resolution and feedback.
- Document any recurring schema gaps, ambiguous learner behaviors, or policy edge cases for router refinement.

## Day 5: Adoption Metrics and Feedback
- Track adoption metrics: percent of tutor interactions routed through the contract, number of escalations, and time-to-resolution for human checkpoints.
- Survey curriculum and support staff for clarity of router outputs and audit rationales.
- Identify any false positives/negatives in schema or policy flagging.

## Day 6-7: Iteration and Policy Hardening
- Refine router schema and policy rules based on logged edge cases and human feedback.
- Update documentation and SOPs for new edge cases or integrations.
- Prepare a summary report on Week-1 adoption, escalation rates, and actionable improvements for the next development sprint.
