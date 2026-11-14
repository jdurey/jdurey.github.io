# Langfuse Agentic Workflow & Eval Gate Sample Kit: Week-1 Ops Playbook

## Objective
Deploy and operationalize the Cross-Family LLM-Judge Eval Router & Loop-Guard Gate Sample Kit to enforce structured governance, cross-model scoring, and policy checkpoints across Langfuse agent workflows.

## Day 1-2: Setup & Integration
- Clone the sample kit repo and review the provided pipeline stages and JSON contract.
- Integrate the Input Normalization & Schema Validator with your existing Langfuse SDK or OpenTelemetry exporter.
- Configure the Cross-Family LLM-Judge Scoring stage to route agent outputs through OpenAI, Anthropic, and Gemini via the Langfuse Gateway.
- Set up the Loop-Guard & Policy Gate to enforce escalation and refusal logic as per the unified JSON contract.

## Day 3-4: Test & Human Checkpoint Calibration
- Run the four provided test cases through the orchestrated pipeline.
- For each flagged or escalated case, review the audit rationale and verify that human escalation is triggered where required.
- Document any schema gaps, ambiguous fields, or unsupported integrations encountered.
- Train ops staff to review escalated cases in the Langfuse Ops Dashboard, using checkpoint_reason as the audit trail.

## Day 5-7: Production Rollout & Adoption Metrics
- Deploy the pipeline to a staging environment and monitor for false negatives or missed policy flags.
- Track adoption metrics: percentage of agent traces processed with valid JSON contracts, number of escalations correctly routed to human review, and time-to-resolution for flagged cases.
- Collect feedback from Langfuse users and ops on clarity of substantive_deliverable and checkpoint_reason fields.
- Iterate on schema validation and escalation logic based on real-world usage and feedback.

## SOPs & Human Checkpoint Rules
- Any request with missing, null, or ambiguous schema fields must be escalated for human review.
- All external PII, checkout, or unsupported integration requests require policy_flag and human checkpoint before execution.
- Prompt-injection, reward-gaming, or answer-leak attempts must be refused and logged with a detailed checkpoint_reason.
- Human reviewers should use the audit log to resolve escalations and update schema or policy rules as needed.
