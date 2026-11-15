# CPEthink.com Day-1 JSON Governance Kit: Facilitator & Ops Playbook

## Week-1 Rollout Plan

### 1. Onboarding & Training
- Schedule a 90-minute onboarding session for curriculum leads, assessment authors, and SCORM/QTI operators. Walk through the JSON governance pipeline, emphasizing the four pipeline stages and the unified production JSON contract.
- Provide hands-on demos using real CPEthink.com catalog items (e.g., 'Concepts and Mechanics of Exchanges - v16', 'Tax Strategies for Bankruptcy, Divorce, Foreclosure, and Debt Issues (Video)').
- Distribute a quick-reference guide mapping common CPEthink.com authoring tasks to the new JSON contract fields and escalation rules.

### 2. Workflow Integration
- Integrate the JSON governance agent into the existing course compilation workflow. Route all new course and assessment item submissions through the pipeline.
- Configure OpsReview to receive all escalated or policy-flagged cases, with Slack/email alerts for human checkpoints.
- Set up a shared dashboard for tracking flagged cases, schema gaps, and audit rationales.

### 3. Human Checkpoint SOPs
- For any case with escalate_to_human: true, assign a curriculum lead to review the flagged fields and audit rationale within 24 hours.
- If schema_valid is false, require explicit remediation (e.g., completing missing assessment mappings or removing unsupported jurisdictional metadata) before approval.
- For policy_flag: true or action: REFUSE_POLICY_VIOLATION, log the incident and review quarterly for policy updates.

### 4. Adoption & Quality Metrics
- Track the following metrics weekly: number of escalated cases, average human review time, percentage of submissions with schema gaps, and number of policy violations caught.
- Survey authors and reviewers after Week 1 for feedback on clarity, false positives, and workflow fit.
- Set a Week-2 goal of reducing unflagged schema gaps by 80% and achieving 100% audit trail coverage for all new course compilations.
