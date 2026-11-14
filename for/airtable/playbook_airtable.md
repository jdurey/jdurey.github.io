# Airtable Agentic Workflow Router: Week-1 Rollout Playbook

## Objective
Deploy a production-grade, agent-orchestrated workflow router that enforces structured JSON governance, schema validation, and human escalation for all agent-initiated actions in Airtable Professional Services engagements.

## Day 1-2: Setup & Baseline
- **Install the router agent** in a secure Airtable workspace with access to representative bases and automations.
- **Configure the agent's system prompt** with the provided JSON contract and domain normalization rules.
- **Test baseline cases** using the four provided scenarios to validate schema extraction, policy flagging, and escalation logic.

## Day 3-4: Human Checkpoint Integration
- **Define escalation SOPs:**
  - Any request with missing, null, or ambiguous schema fields is flagged for human review before execution.
  - All external PII/checkout actions require explicit human approval.
  - Policy-violating, prompt-injection, or unsupported integration requests are refused and escalated with a clear audit rationale.
- **Assign a human reviewer** (Solutions Architect or designated operator) to monitor the agent's escalation queue and approve, remediate, or refuse flagged actions.

## Day 5-7: Adoption & Metrics
- **Monitor agent logs** for JSON contract compliance, false negatives, and false positives in escalation.
- **Track adoption metrics:**
  - % of agent outputs with valid JSON contract.
  - % of ambiguous or policy-risk requests correctly escalated.
  - Time-to-resolution for escalated cases.
- **Iterate on prompt and SOPs** based on observed edge cases and user feedback.
- **Document reusable solution patterns** and reference architectures for future engagements.

## Success Criteria
- 100% of agent outputs conform to the JSON contract.
- All ambiguous, policy-risk, or unsupported requests are flagged and escalated per SOP.
- Human reviewers resolve escalations within 24 hours, with clear audit trails.

## Next Steps
- Expand to additional Airtable bases and automation scenarios.
- Train Professional Services team on agent orchestration best practices and escalation handling.
- Continuously update the router prompt and escalation rules as new integrations and workflows emerge.