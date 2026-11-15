## Duolingo Learning AI Workflow: Week-1 Rollout Playbook

### Objective
Deploy and operationalize the JSON-governed agent workflow for learning item normalization, scoring, and policy compliance, ensuring every submission or user request passes schema, policy, and human checkpoint gates before action or release.

### Day 1-2: Onboarding & Training
- **Kickoff Session:** Introduce the new workflow to Learning Ops, content creators, and product managers. Walk through the four pipeline stages and the unified JSON contract.
- **Hands-On Lab:** Run sample cases (from the provided scenarios) in the agent UI or API harness. Highlight how ambiguous fields, PII, and unsupported requests are flagged and escalated.
- **Checklist Distribution:** Provide a quick-reference SOP for required schema fields (language, item type, skill, rubric alignment) and policy boundaries (PII, checkout, reward actions).

### Day 3-4: Pilot & Human Checkpoint Integration
- **Live Pilot:** Route real submissions through the workflow. Assign a Learning Ops reviewer to monitor all escalated or flagged cases.
- **Checkpoint Rules:** Any case with schema_valid: false, policy_flag: true, or escalate_to_human: true must be reviewed and resolved by a designated human before release.
- **Audit Logging:** Ensure every action, escalation, or refusal is logged with checkpoint_reason for compliance and continuous improvement.

### Day 5-7: Adoption, Feedback, and Metrics
- **Adoption Metrics:** Track number of submissions, percent flagged/escalated, and time-to-resolution for human checkpoints.
- **Feedback Loop:** Collect feedback from reviewers and content creators on false positives/negatives and workflow clarity.
- **Iterative Tuning:** Adjust schema validation and policy rules based on real-world edge cases and reviewer input.

### Success Criteria
- 100% of learning item submissions and user requests are processed via the JSON-governed workflow.
- All ambiguous, policy-risk, or unsupported cases are escalated and resolved by a human reviewer.
- Audit logs are complete and actionable, supporting compliance and future workflow improvements.