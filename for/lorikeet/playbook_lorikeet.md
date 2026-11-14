## Lorikeet Concierge Agent Orchestration: Week-1 Rollout Playbook

### Objective
Deploy and operationalize the JSON-governed agent orchestration pipeline for Lorikeet's Concierge product, ensuring every support workflow is normalized, audited, and escalated according to production-grade governance and compliance standards.

### Day 1-2: Kickoff & Baseline Setup
- Review the agent orchestration DAG and JSON contract with Forward Deployed Product Managers (FDPMs) and Forward Deployed Engineers (FDEs).
- Integrate the Input Normalization & Schema Validation stage into the Concierge intake pipeline. Confirm that all incoming requests are parsed and missing/ambiguous fields are flagged.
- Establish a shared Slack or Ops channel for real-time escalation and audit notifications.

### Day 3-4: Policy & Compliance Routing SOPs
- Map customer-specific policy rules (e.g., payout thresholds, prescription refill boundaries) into the Policy Router.
- Train FDPMs to review flagged tickets in the audit queue, focusing on cases with missing schema fields, ambiguous policy, or unverified PII/checkout actions.
- Set up daily standups to review escalated cases and refine escalation criteria.

### Day 5: Tool Invocation & Cross-Check
- Enable multi-agent tool invocation for high-volume workflows (e.g., payment_dispute_resolver, prescription_status_checker).
- Validate that cross-family verification gates catch hallucinated SKUs, unsupported integrations, and reward-gaming attempts.
- Document remediation steps for unsupported or ambiguous requests, and ensure clear customer/operator responses are generated.

### Day 6-7: Audit Logging, Human Checkpointing, and Metrics
- Ensure all outputs emit the unified JSON contract, with explicit checkpoint_reason and audit rationale.
- Track adoption metrics: percentage of tickets with flagged schema or policy issues, average human escalation response time, and reduction in unverified actions.
- Gather feedback from FDPMs and FDEs on workflow friction points and iterate on playbooks.

### Ongoing
- Update playbooks with new edge cases and remediation patterns.
- Monitor for false negatives (missed escalations) and false positives (unnecessary holds), aiming for >98% contract compliance by end of Week 1.
- Share learnings and playbook updates with the broader Lorikeet deployment team.