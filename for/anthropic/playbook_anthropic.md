# Anthropic Cyber Evaluation Router: Week-1 Rollout Playbook

## Objective
Deploy the JSON-governed Cyber Evaluation Router to ensure all model outputs, cyber probes, and abuse detection requests are processed with robust schema, policy, and audit controls, supporting Anthropic's safety and compliance mandates.

## Day 1-2: Setup & Integration
- Clone the router codebase and integrate with Anthropic's internal evaluation APIs.
- Configure schema fields to match Anthropic's cyber evaluation requirements (model version, deployment context, abuse type, etc.).
- Set up logging for all JSON contract outputs and audit trails.

## Day 3: Human Checkpoint Calibration
- Review the four provided test cases with the cyber policy and engineering teams.
- Confirm escalation rules: any missing/ambiguous schema, PII/checkout action, unsupported integration, or policy boundary triggers escalate_to_human: true.
- Establish a human reviewer rota for flagged cases.

## Day 4: Live Pilot
- Route a batch of real-world cyber evaluation requests through the router.
- Monitor for false negatives (missed risks) and false positives (over-escalation).
- Use the audit logs to review all escalate_to_human and policy_flag triggers.

## Day 5: Feedback & Iteration
- Collect feedback from human reviewers and operators on clarity of detected_risks_or_gaps and checkpoint_reason fields.
- Refine normalization and risk detection logic based on observed edge cases.
- Update SOPs for handling ambiguous or novel requests.

## Adoption Metrics
- Track percent of requests processed with valid JSON contract.
- Measure time to human resolution for escalated cases.
- Monitor reduction in unstructured or policy-violating outputs.
- Report weekly on audit trail completeness and reviewer agreement rates.

## Ongoing
- Schedule weekly calibration sessions to review new edge cases and policy changes.
- Continuously update schema and escalation logic as Anthropic's cyber evaluation needs evolve.