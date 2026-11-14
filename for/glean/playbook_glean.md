# Glean Agentic Workflow Router: Week-1 Rollout Playbook

## Objective
Deploy and operationalize the Agentic Workflow Router for Glean, ensuring every agentic response is governed by structured JSON contracts, robust schema validation, and human escalation for ambiguous, risky, or unsupported actions.

## Day 1-2: Setup & Integration
- Deploy the router agent as a middleware layer between Glean's user-facing interfaces (e.g., Microsoft Teams, Slack, ServiceNow) and backend workflow engines.
- Integrate with Glean's Enterprise Graph and connector registry to enable schema extraction and connector validation.
- Configure the router to enforce the UNIFIED PRODUCTION JSON CONTRACT, rejecting any freeform or incomplete outputs.

## Day 3-4: Human Checkpoint Calibration
- Define escalation rules: Any request with missing/ambiguous schema fields, PII/checkout actions, unsupported integrations, or policy boundary triggers must set `escalate_to_human: true`.
- Assign Resident Solutions Architect or designated ops reviewer as the escalation handler.
- Set up a dashboard to log all escalated cases, including detected risks, audit rationale, and customer-facing responses.

## Day 5: Test & Validate
- Run the four provided test cases through both naive and orchestrated pipelines. Confirm that only the orchestrated pipeline emits valid JSON contracts, flags schema/policy issues, and escalates as required.
- Document failure modes and remediation steps for each edge case.

## Day 6-7: Adoption & Metrics
- Train customer-facing teams on interpreting JSON contract outputs and handling escalations.
- Track key adoption metrics: percentage of agentic responses with valid JSON contracts, number of escalations, mean time to human resolution, and reduction in unauthorized or unsupported actions.
- Gather feedback from initial users and reviewers to refine escalation criteria and improve normalization logic.

## Ongoing SOP
- Review escalated cases weekly to identify new schema gaps, policy risks, or integration requests.
- Continuously update connector registry and schema mappings as Glean's platform evolves.
- Maintain strict adherence to JSON governance, with zero tolerance for freeform or ambiguous agent outputs.
