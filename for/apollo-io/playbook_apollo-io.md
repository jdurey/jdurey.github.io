# Apollo.io GTM Presales Workflow Router: Week-1 Rollout Playbook

## Objective
Deploy a robust, JSON-governed workflow router for GTM Senior Solutions Consultants, ensuring every presales engagement is normalized, risk-audited, and checkpointed for human escalation where needed.

## Day 1-2: Onboarding & Training
- **Review the JSON contract**: All Solutions Consultants and workflow operators must understand the unified JSON schema, including required keys and escalation logic.
- **Hands-on lab**: Run through the four provided test cases in a sandbox, comparing naive chatbot outputs to the orchestrated router’s JSON outputs. Discuss why each checkpoint or escalation is triggered.
- **Checklist**: Confirm all team members can interpret action, schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.

## Day 3-4: Live Pilot & Human Checkpoint SOP
- **Enable router in shadow mode**: Route real presales requests through the agent, but require human review before final delivery.
- **Checkpoint rules**:
  - Any missing, null, or ambiguous schema field (e.g., company domain, region, integration details) triggers escalate_to_human.
  - Any external PII, checkout, unsupported integration, or prompt-injection attempt triggers policy_flag and escalate_to_human.
  - All escalations must be reviewed and signed off by a designated Solutions Consultant.
- **Audit trail**: Log every escalation and checkpoint_reason for compliance and continuous improvement.

## Day 5-7: Adoption Metrics & Continuous Improvement
- **Track metrics**:
  - % of requests with schema_valid: false or escalate_to_human: true
  - Time-to-resolution for escalated cases
  - Number of policy violations detected and refused
- **Feedback loop**: Hold a daily standup to review escalated cases, update SOPs, and refine normalization rules.
- **Documentation**: Update internal playbooks with new edge cases, remediation steps, and best practices.

## Success Criteria
- 100% of presales workflows emit valid JSON contracts.
- All policy and schema risks are escalated and audited.
- No unauthorized PII, unsupported integrations, or prompt-injection attempts reach production without human review.