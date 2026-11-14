# Newsela Assessment Item Workflow Agent: Week-1 Rollout Playbook

## Objective
Deploy the Social Studies Assessment Item Normalization and Policy-Gated Scoring Pipeline to ensure every new item meets Newsela's schema, standards, and policy requirements, with robust human checkpoints for ambiguous or risky cases.

## Day 1-2: Setup and Training
- Onboard freelance contributors and assessment specialists to the workflow, emphasizing the unified JSON contract and escalation rules.
- Provide a 30-minute hands-on demo using the four test cases above, showing how the agent flags missing fields, policy risks, and unsupported standards.
- Distribute a quick-reference guide listing required schema fields, common policy traps (PII, answer leaks), and escalation triggers.

## Day 3-4: Pilot and Human Checkpoint Integration
- Run a pilot batch of 20 real Newsela Social Studies items through the pipeline.
- For each item, review the agent's JSON output, focusing on schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.
- Human reviewers must confirm all escalated cases, provide feedback on ambiguous or edge-case scenarios, and log any false negatives or false positives.
- Adjust normalization and policy rules based on reviewer feedback.

## Day 5-7: Full Adoption and Metrics
- Move to full production for all new Social Studies assessment items.
- Track key adoption metrics: percentage of items flagged for human review, average time to resolution, and reviewer agreement rate on escalated cases.
- Hold a daily 15-minute standup to discuss any new edge cases or policy questions.
- At week's end, review metrics and update SOPs to further reduce false negatives and ensure every item meets Newsela's standards and compliance requirements.

## Ongoing
- Continue to iterate on the pipeline, adding new policy checks or schema fields as Newsela's standards evolve.
- Maintain a living FAQ and escalation log for contributors and reviewers.