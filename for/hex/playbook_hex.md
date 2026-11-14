## Hex Partner Enablement Workflow Router: Week-1 Rollout Plan

### Objective
Deploy the Partner Enablement Workflow Router and Audit Kit to govern all partner onboarding, demo, and certification requests, ensuring every workflow is schema-validated, policy-audited, and checkpointed for human review where needed.

### Day 1-2: Setup & Training
- Provision the router agent in the Hex partner enablement workspace.
- Train Partner Solutions Engineers and onboarding leads on the JSON contract, schema fields, and escalation rules using real Hex demo and onboarding scenarios.
- Review the four test cases as a team, highlighting how the router flags ambiguous fields, unsupported integrations, and policy risks.

### Day 3-4: Live Pilot
- Route all new partner demo, onboarding, and curriculum requests through the workflow router.
- For every request, require the agent to emit the full JSON contract, including detected_risks_or_gaps and checkpoint_reason.
- Human checkpoint: Any request with escalate_to_human: true or policy_flag: true must be reviewed by a Partner Enablement Lead before fulfillment.
- For ambiguous or incomplete requests, deliver a draft output but hold final delivery until human confirmation.

### Day 5: Feedback & Metrics
- Collect metrics: percent of requests flagged for human review, average time-to-resolution, and number of schema or policy gaps detected.
- Gather partner feedback on clarity of demo scripts, onboarding collateral, and escalation communications.
- Debrief with Product and Engineering to review flagged integration or capability gaps for roadmap consideration.

### Ongoing SOP
- Update the schema and router prompt as new partner scenarios or integrations are added.
- Track adoption: percent of partner teams demo-independent, certifications completed, and time-to-first-deal.
- Review flagged cases weekly to refine escalation criteria and improve partner experience.

**Key Adoption Metrics:**
- Human escalation rate under 20% by week 2
- 100% valid JSON contract compliance
- Partner demo independence rate above 80% within first month