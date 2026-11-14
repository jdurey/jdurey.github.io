# Arize AI LLM Evaluation & Rubric Router: Week-1 Rollout Playbook

## Objective
Deploy and operationalize the LLM evaluation and reward rubric router for Arize AI's observability workflows, ensuring every trace, session, and agentic output is normalized, scored, and governed by the unified JSON contract from day one.

## Day 1-2: Onboarding & Baseline Setup
- Integrate the router system prompt and JSON contract into the Arize evaluation pipeline.
- Conduct a walkthrough with Product, Engineering, and Ops to review the four pipeline stages and JSON schema.
- Import golden-set traces and RL-environment states for initial rubric calibration.

## Day 3-4: Human Checkpoint Training & Policy Drills
- Train designated human reviewers on schema validation, policy flagging, and escalation SOPs using the four provided test cases.
- Simulate ambiguous, PII, policy-trap, and hallucination scenarios; ensure reviewers can interpret the JSON contract and provide audit rationales.
- Set up dashboards to track flagged, escalated, and refused cases.

## Day 5: Live Pilot & Feedback Loop
- Route 50+ live production traces through the pipeline, monitoring for schema gaps, policy risks, and unsupported integrations.
- Hold daily standups to review escalated cases, audit rationales, and remediation steps.
- Collect feedback from AI engineers and human reviewers on workflow clarity and false positive/negative rates.

## Adoption Metrics
- Track: (1) % of traces with missing/ambiguous fields flagged, (2) % of PII/policy violations escalated, (3) reviewer agreement rate on audit rationales, and (4) time-to-remediation for flagged cases.
- Target: >95% schema gap detection, 100% policy violation escalation, and <24h average remediation cycle.

## SOP for Human Checkpoints
- Any case with null/ambiguous fields, unverified PII, unsupported integrations, or policy risk must be escalated.
- Human reviewers must log a checkpoint_reason and remediation steps in the audit trail.
- Weekly review of escalated cases for rubric drift and continuous improvement.
