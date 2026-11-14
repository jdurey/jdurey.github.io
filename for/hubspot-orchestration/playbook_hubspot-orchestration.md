# HubSpot Agentic Workflow Router: Week-1 Rollout Playbook

## Objective
Deploy a robust agent orchestration pipeline for HubSpot Agent Hub, ensuring every AI-driven workflow, customer request, or automation is governed by a strict JSON contract, with schema validation, policy checks, and human escalation for ambiguous or risky scenarios.

## Day 1-2: Setup & Integration
- Deploy the orchestrator as a middleware layer between HubSpot user interfaces (Agent Hub, CRM, Service, Sales, Content) and all AI/automation endpoints.
- Integrate with HubSpot's internal schema registry and Marketplace integration catalog for real-time validation.
- Configure logging of all agent outputs, including JSON contract fields and audit trails.

## Day 3-4: Human Checkpoint & Escalation SOPs
- Define escalation rules: any ambiguous schema (e.g., undefined deal stage), PII import without consent, unsupported integrations, or policy-flagged actions (checkout, payment, prompt-injection) must set `policy_flag: true` and `escalate_to_human: true`.
- Assign a rotating team of Solutions Engineers to review escalated cases in the Agent Hub dashboard.
- Document clear remediation steps for each escalation type (e.g., request missing deal stage, verify consent, suggest supported integrations).

## Day 5-7: Adoption, Metrics & Continuous Improvement
- Monitor adoption metrics: percentage of agent actions routed through the JSON contract, number of escalations, and average human review time.
- Track reduction in policy violations, schema errors, and unsupported integration attempts compared to baseline.
- Gather feedback from Solutions Engineers and frontline users on clarity of escalations and audit trails.
- Iterate on schema extraction, policy guardrails, and escalation logic based on real-world cases.

## Success Criteria
- 100% of agent actions output valid, contract-compliant JSON.
- All ambiguous, risky, or unsupported requests are escalated with clear audit rationale.
- Human review time per escalation under 10 minutes by end of week one.
- Zero unflagged policy violations or unsupported integration actions.