# Brisk Teaching Day-1 Writing Feedback Calibration & Rubric Alignment Rollout Plan

## Week-1 SOP for Facilitators and Ops

### 1. Onboarding & Training
- **Kickoff Session:** Introduce the JSON governance kit to instructional coaches, curriculum leads, and district IT. Demo the four-stage pipeline using real Brisk tools (Batch Feedback, Essay Feedback, Rubric Generator).
- **Hands-on Lab:** Run through the four test cases in a sandbox. Highlight how the orchestrated agent flags missing rubric fields, PII, prompt-injection, and unsupported integrations, while naive chatbots fail.
- **Role Assignment:** Assign at least one human reviewer per school or district to handle escalated cases flagged by the pipeline (e.g., ambiguous rubric, PII, policy traps).

### 2. Live Workflow Integration
- **Tool Configuration:** Ensure Brisk's writing feedback and rubric tools are routed through the JSON contract pipeline. Disable freeform chatbot outputs for any feedback or rubric-alignment actions.
- **Human Checkpoint SOP:** For any case with `escalate_to_human: true`, reviewers must check the audit log, confirm flagged risks, and either approve, remediate, or reject the output. All actions and rationales are logged for compliance.
- **Policy Review:** Weekly review of flagged cases to refine escalation criteria and update rubric mappings or compliance rules as needed.

### 3. Adoption & Quality Metrics
- **Metrics to Track:**
  - % of feedback actions processed with complete, schema-valid JSON contracts
  - # of escalated cases resolved within 24 hours
  - Reviewer agreement rate on flagged cases
  - Reduction in incomplete or non-compliant feedback compared to baseline
- **Feedback Loop:** Collect teacher and reviewer feedback on flagged cases and pipeline usability. Iterate on schema and escalation rules based on real classroom scenarios.

### 4. Communication & Support
- **Weekly Standup:** Share adoption metrics and surfaced edge cases with the Brisk Teaching team. Highlight success stories and areas for improvement.
- **Support Channel:** Maintain a dedicated Slack or Teams channel for rapid escalation and troubleshooting of flagged cases.

By following this playbook, Brisk Teaching ensures every automated writing feedback action is standards-aligned, policy-compliant, and fully auditable from Day 1.