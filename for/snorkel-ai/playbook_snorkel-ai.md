## Snorkel AI LLM Evaluation & Rubric Governance Pipeline: Week-1 Ops Playbook

### Objective
Deploy a robust, production-grade evaluation and rubric governance pipeline that ensures every LLM evaluation, RL-environment probe, and reward rubric is schema-verified, policy-compliant, and checkpointed for human review when ambiguity, reward-gaming, or unsupported actions are detected.

### Day 1-2: Setup & Integration
- Deploy the pipeline stages (Normalizer, Rubric Calibrator, Policy Gate, HumanOps) in Snorkel AI's evaluation environment.
- Integrate with existing dataset/rubric upload endpoints and RL-environment evaluation triggers.
- Configure logging and audit trail storage for all pipeline outputs and escalations.

### Day 3-4: Human Checkpoint Calibration
- Train human reviewers on the JSON contract, escalation rules, and audit rationale fields.
- Run calibration sessions using the provided test cases (ambiguous reward scale, PII detection, prompt-injection, unsupported integration).
- Establish a 24-hour SLA for human review of escalated or policy-flagged cases.

### Day 5: Live Pilot & Metrics
- Go live with real customer/rubric submissions, routing all ambiguous, policy-flagged, or schema-invalid cases to human review.
- Track adoption metrics: percentage of evaluations passing schema validation, number of escalations, average human review turnaround time, and policy violation detection rate.
- Hold daily standups to review edge cases, false positives/negatives, and reviewer agreement rates.

### Ongoing SOP
- Weekly review of flagged cases and audit logs to refine normalization, calibration, and policy detection logic.
- Continuous feedback loop with Forward Deployed Researchers to tune rubric criteria, anti-gaming checks, and escalation thresholds.
- Quarterly retraining of human reviewers on new schema fields, integrations, and compliance boundaries.

### Success Metrics
- >98% of evaluations and rubrics are schema-verified and policy-compliant on first pass.
- <24-hour turnaround for all escalated cases.
- Zero unflagged PII, reward-gaming, or unsupported integration incidents in production.
