## Surge AI Coding Evaluation Router: Week-1 Rollout Playbook

### Objective
Deploy the JSON contract router to enforce structured, auditable coding evaluation and training data workflows, ensuring every output meets Surge AI’s standards for schema validity, policy compliance, and human-in-the-loop oversight.

### Day 1-2: Setup & Baseline
- Integrate the router system prompt into your evaluation copilot or agentic workflow orchestrator.
- Review the four pipeline stages: normalization, rubric scoring, policy checkpoint, and human escalation.
- Validate the router on historical coding evaluation logs, comparing outputs to the provided test cases. Document any schema gaps or ambiguous fields.

### Day 3-4: Human Checkpoint Calibration
- Assign a facilitator (Surge AI ops or research lead) to review all router outputs with escalate_to_human: true.
- For each flagged case, confirm the detected risk (e.g., missing test cases, PII, prompt-injection, unsupported integration) and approve or remediate the substantive_deliverable.
- Refine escalation thresholds and audit rationales based on real-world ambiguity and policy risk frequency.

### Day 5: Live Pilot & Feedback Loop
- Enable the router for a subset of live coding evaluation or RL environment tasks.
- Track key adoption metrics: percentage of outputs with valid schema, rate of human escalations, time-to-resolution for flagged cases, and reviewer agreement on audit rationales.
- Collect operator and reviewer feedback on clarity of substantive_deliverable and checkpoint_reason fields.

### Ongoing SOP
- Weekly review of escalated cases and audit trails to ensure continued policy and schema alignment.
- Update rubric criteria and router prompt as new edge cases or integrations arise.
- Maintain a golden-set of annotated cases for ongoing calibration and reviewer training.

### Adoption Metrics
- Target >95% schema_valid outputs on routine cases.
- Human reviewer agreement >90% on escalated checkpoint_reason justifications.
- Mean time-to-resolution for escalated cases under 24 hours.

This playbook ensures Surge AI’s coding evaluation workflows remain robust, auditable, and scalable from Day 1.