# Instructure Assessment Content Router: Week-1 Rollout Playbook

## Objective
Deploy and operationalize the Mastery Assessment AI Content Router to ensure all item authoring, scoring, and diagnostic workflows for Mastery Predictive and College Prep Assessments are standards-locked, policy-governed, and checkpointed for compliance and psychometric integrity.

## Day 1-2: Setup & Orientation
- Provision the router agent in a secure, sandboxed Canvas/Assessment environment.
- Distribute the JSON contract and router_system_prompt to all content authors, psychometricians, and district-facing ops leads.
- Run onboarding workshops: demonstrate router behavior using the four provided cases, highlighting schema validation, policy flagging, and human escalation.

## Day 3-4: Live Pilot & Human Checkpoints
- Route all new item authoring and scoring requests through the agent pipeline.
- For each flagged case (schema_valid: false, policy_flag: true, escalate_to_human: true), assign a content ops lead or psychometrician to review and resolve.
- Maintain an audit log of all escalations, including checkpoint_reason and detected_risks_or_gaps.
- Use the router's customer_or_learner_response field to communicate outcomes and next steps to authors and district leads.

## Day 5-7: Feedback, Metrics, and Iteration
- Track adoption metrics: percent of requests processed with valid JSON contract, number of escalations, time-to-resolution for flagged cases, and human reviewer agreement rates.
- Collect feedback from authors and district leads on clarity of router responses and audit trails.
- Refine escalation SOPs: clarify ambiguous schema field handling, update policy rules for new compliance scenarios, and tune distractor diagnostics based on psychometrician input.

## Ongoing SOPs
- Weekly review of flagged and escalated cases to identify emerging schema or policy gaps.
- Update router_system_prompt and contract as new standards, SKUs, or compliance requirements are added.
- Maintain a knowledge base of resolved edge cases and best practices for standards mapping, PII detection, and policy enforcement.

## Success Metrics
- 100% of item authoring and scoring requests processed with valid JSON contract.
- Zero unflagged PII or unsupported integration incidents.
- Human reviewer agreement rate above 95% on escalated cases.
- Positive feedback from district leads on auditability and standards alignment.
