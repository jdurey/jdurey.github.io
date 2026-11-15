# Zscaler Enablement Workflow Router: Week-1 Rollout Playbook

## Objective
Deploy the AI-driven Enablement Workflow Router to ensure all technical enablement assets, demo requests, and lab scenarios are rigorously validated for schema completeness, policy compliance, and Zscaler domain alignment before field release.

## Day 1-2: Setup and Stakeholder Alignment
- Brief Enablement, Sales Engineering, and Product Management teams on the router's JSON contract and escalation rules.
- Map Zscaler's official product, use case, and audience taxonomies for normalization.
- Configure the router in a test environment with sample enablement requests.

## Day 3-4: Pilot and Human Checkpoint Calibration
- Run 10-15 real enablement asset submissions through the router.
- For each flagged case (ambiguous fields, PII, unsupported integrations, or policy risks), route to a designated Enablement Lead Reviewer.
- Review audit logs to ensure every escalation includes a clear checkpoint_reason and remediation steps.
- Refine escalation thresholds and update the normalization schema as needed.

## Day 5: Go-Live and Field Training
- Enable the router for all new enablement asset and demo requests.
- Train field teams to interpret router JSON outputs and respond to customer_or_learner_response guidance.
- Establish a Slack/Teams channel for real-time escalation and feedback.

## Adoption Metrics and Continuous Improvement
- Track: (1) percentage of requests flagged for human review, (2) average time to resolution, (3) reduction in policy or schema errors in released assets, and (4) field team confidence scores.
- Hold weekly reviews with Enablement Ops and Product SMEs to analyze flagged cases and update schema/rubric logic.
- Iterate on router prompts and escalation rules to further reduce risk and accelerate enablement asset delivery.
