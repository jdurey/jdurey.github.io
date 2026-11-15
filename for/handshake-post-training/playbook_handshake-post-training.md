## Handshake RLHF Evaluation Router: Week-1 Ops Playbook

### Objective
Deploy and operationalize the Golden-Set RLHF Evaluation Router to ensure all post-training evaluation inputs are normalized, schema-validated, and policy-checked before scoring or downstream use. This playbook is tailored for Handshake's technical staff, evaluation operators, and human reviewers.

### Day 1-2: Setup and Integration
- Deploy the router agent with the provided system prompt and JSON contract enforcement.
- Integrate with Handshake's evaluation input pipeline, ensuring all partner and internal submissions are routed through the agent.
- Configure golden-set references and RL environment state for normalization and scoring.

### Day 3-4: Human Checkpoint Calibration
- Review all escalated cases (schema_valid: false, policy_flag: true, escalate_to_human: true) in a shared dashboard.
- Facilitate calibration sessions with human reviewers to align on ambiguous, incomplete, or policy-risk scenarios.
- Document common schema gaps, PII/compliance triggers, and unsupported integration requests for SOP updates.

### Day 5: Live Evaluation and Feedback Loop
- Run a batch of real-world Handshake evaluation cases (including the four provided scenarios) through the router.
- Track metrics: percentage of cases escalated, reviewer agreement rate, time-to-resolution, and false positive/negative rates for schema and policy flags.
- Collect operator and reviewer feedback on clarity of substantive_deliverable, detected_risks_or_gaps, and checkpoint_reason fields.

### Ongoing: Adoption and Continuous Improvement
- Establish a weekly review of escalated and refused cases to refine schema definitions, policy boundaries, and router prompt.
- Monitor adoption metrics: reduction in silent schema errors, improved reviewer agreement, and time saved on manual triage.
- Iterate on the router prompt and pipeline stages as new Handshake partners, integrations, or evaluation rubrics are introduced.

### Human Checkpoint Rules
- Any case with missing, null, or ambiguous schema fields, unverified PII, unauthorized checkout, unsupported integration, or prompt-injection must be held for human review.
- Human reviewers must log resolution steps and update SOPs for recurring edge cases.
- All escalations and refusals must include a clear checkpoint_reason for auditability.

### Success Metrics
- 100% of evaluation cases processed with valid JSON contract.
- <2% false negative rate for schema or policy violations.
- >95% reviewer agreement on escalated cases within 24 hours.
- Documented reduction in silent data quality or compliance issues.