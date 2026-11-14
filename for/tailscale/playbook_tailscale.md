## Tailscale Enterprise Agent-Orchestrated Workflow Router: Week-1 Rollout Playbook

### Overview
This runbook guides Tailscale Solutions Engineers and operations leads through the first week of deploying the agent-orchestrated workflow router for secure, deterministic handling of enterprise architecture, access, and compliance requests.

### Day 1-2: Setup & Schema Alignment
- Review the JSON contract and DAG stages with all Solutions Engineers and Sales Engineers.
- Map Tailscale's real customer workflow types (hybrid cloud, PAM, session recording, AI gateway) to the router's schema fields.
- Configure the router's supported integrations and compliance rulesets (e.g., Okta, Azure AD, supported SIEMs, PII handling).

### Day 3-4: Test Case Simulation & Human Checkpoint Training
- Run all four provided test cases through the router in a sandbox environment.
- For each flagged or escalated case, review the detected_risks_or_gaps and checkpoint_reason with a human auditor.
- Document any ambiguous or missing fields, and update escalation SOPs for identity provider ambiguity, PII onboarding, and unsupported integrations.

### Day 5: Live Pilot with Real Customer Inputs
- Route a sample of real customer requests (with sensitive fields redacted) through the agent pipeline.
- Ensure every output includes valid JSON governance fields, and that all policy/compliance checkpoints trigger human review as required.
- Track time-to-resolution and number of escalations for continuous improvement.

### Adoption Metrics & Continuous Improvement
- Success is measured by: (1) 100% of requests emitting valid JSON contracts, (2) zero unverified PII or unsupported integrations processed, (3) all ambiguous or policy-flagged cases escalated to a human, and (4) reduction in downstream rework or compliance issues.
- Hold a retrospective at the end of Week 1 to review flagged cases, human checkpoint outcomes, and update the router schema or escalation rules as needed.

### Human Checkpoint Rules
- Any ambiguous, null, or missing schema field (e.g., identity provider, integration, compliance scope) must be escalated.
- All PII, financial, or checkout actions require verification and human approval.
- Unsupported integrations or hallucinated SKUs must be flagged and remediated before proceeding.
- Policy-violation or prompt-injection attempts are refused and logged with full audit rationale.

This playbook ensures Tailscale's enterprise workflow automation is robust, compliant, and ready for scale.