# Pylon Agent Workflow Reliability Kit: Week-1 Rollout Playbook

## Objective
Deploy the JSON-governed agent workflow router to enforce schema, policy, and escalation governance across Pylon's B2B support flows, ensuring every automation and agent action is auditable, compliant, and production-safe.

## Day 1-2: Setup & Training
- **Install the workflow router** in Pylon's staging environment, connecting to Slack, Teams, Email, and Chat Widget channels.
- **Train support and ops teams** on the JSON contract keys, escalation triggers, and audit rationale fields using real Pylon cases (see above).
- **Walk through 'Normal_Complex' and 'Governance_Checkpoint' scenarios** in a live sandbox, emphasizing detection of missing fields and PII/compliance boundaries.

## Day 3-4: Human Checkpoint & Policy Gate Calibration
- **Configure escalation routing** so any request with null/ambiguous fields, policy_flag: true, or external PII/checkout triggers is routed to a designated human operator.
- **Run simulated 'Policy_Trap' and 'Schema_Edge_Case' cases** to validate prompt-injection detection, unsupported integration handling, and refusal logic.
- **Review audit logs** for every escalated or refused case, ensuring checkpoint_reason fields are clear and actionable.

## Day 5-7: Production Pilot & Adoption Metrics
- **Deploy to a subset of live support channels** (e.g., select Slack and Email accounts) with human-in-the-loop enabled for all escalations.
- **Track adoption metrics:**
  - % of tickets with complete, valid JSON contract outputs
  - % of ambiguous or policy-flagged cases correctly escalated
  - Average time to human checkpoint resolution
  - Operator feedback on clarity of checkpoint_reason and customer responses
- **Iterate on playbook** based on operator feedback and real-world edge cases, updating escalation SOPs and training materials as needed.

## Ongoing
- **Weekly review of escalated and refused cases** to refine rubric criteria and escalation boundaries.
- **Continuous improvement**: Add new edge cases and policy traps as Pylon's product and integrations evolve.