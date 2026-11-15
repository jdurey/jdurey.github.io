# Figma AI Evaluation Router: Week-1 Rollout Playbook

## Objective
Deploy the AI Output Evaluation Router to enforce structured, rubric-based, and policy-compliant evaluation of all AI-generated actions and plugin outputs in Figma's design workflows.

## Day 1-2: Setup & Integration
- Integrate the router agent as a middleware in Figma's AI workflow endpoints (e.g., plugin actions, AI-powered suggestions).
- Configure the router to intercept all AI outputs, normalizing Figma-specific fields (plugin names, design object references, user intents).
- Set up golden-set rubric criteria for core workflows (plugin usage, export actions, design suggestions) and calibrate LLM-as-judge scoring.

## Day 3-4: Human Checkpoint & Policy Gate Training
- Train the team on schema validation: flagging missing, null, or ambiguous fields (e.g., unspecified plugin versions, ambiguous selections).
- Establish escalation rules: any PII, checkout, or ambiguous request triggers policy_flag and escalate_to_human.
- Run live drills using the provided test cases, ensuring the router emits only contract-compliant JSON and holds or refuses risky requests.

## Day 5: Governance & Audit Trail
- Review all escalated cases for audit trail completeness and checkpoint rationale.
- Validate that no unsupported integrations or hallucinated plugins are processed.
- Confirm that all prompt-injection and reward-gaming attempts are correctly flagged and refused.

## Adoption Metrics
- Track the percentage of AI outputs routed through the evaluation pipeline versus naive acceptance.
- Monitor the rate of human escalations, policy flags, and schema validation failures.
- Measure reviewer agreement on rubric scores and audit rationales.
- Target: 100% contract-compliant JSON emission, zero unflagged policy violations, and >95% reviewer agreement within the first week.

## Ongoing
- Update rubrics and plugin lists as Figma's ecosystem evolves.
- Periodically audit escalated cases for new edge cases or policy drift.
- Share reusable methods and checkpoint rationales with the broader AI Research and Modeling Platform teams.