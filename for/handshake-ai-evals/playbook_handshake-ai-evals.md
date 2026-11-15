## Handshake Eval Router: Week-1 Rollout Playbook

### Objective
Deploy the Golden-Set RL Eval Router to ensure every LLM/agent evaluation, reward, and data workflow at Handshake emits a complete, auditable, and policy-compliant JSON contract. This playbook details the steps for technical staff, ops, and reviewers to operationalize the pipeline and drive adoption.

### Day 1-2: Setup and Integration
- Deploy the router as a middleware in the Handshake evaluation stack.
- Integrate with existing agent/LLM endpoints and data attribution workflows.
- Configure schema normalization, reward/rubric criteria, and policy/compliance rules based on Handshake's current RL environments and data governance standards.

### Day 3-4: Human Checkpoint Calibration
- Run through the four provided test cases, ensuring the router flags missing fields, PII, prompt-injection, and unsupported integrations.
- For each escalate_to_human or policy_flag event, route to a designated reviewer with the full JSON contract and checkpoint_reason.
- Reviewers confirm or remediate flagged outputs, updating rubric or schema rules as needed.

### Day 5: Adoption and Metrics
- Track adoption metrics: percentage of evals emitting valid JSON, number of escalations, and time-to-resolution for human checkpoints.
- Monitor for false negatives (missed risks) and false positives (unnecessary escalations), tuning router logic accordingly.
- Collect operator feedback on substantive_deliverable clarity and audit trail completeness.

### Ongoing SOP
- All new evaluation or data workflows must pass through the router.
- Any schema drift, new integration, or policy update triggers a review of router rules and test cases.
- Weekly audit: sample 10% of escalated and executed cases for compliance and rubric alignment.

### Success Criteria
- 100% of production evals emit a valid, complete JSON contract.
- All policy, PII, and ambiguous schema risks are escalated or refused with clear audit rationale.
- Human reviewers resolve escalations within 24 hours, with continuous improvement of rubric and schema logic.