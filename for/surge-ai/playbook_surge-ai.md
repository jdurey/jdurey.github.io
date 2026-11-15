# Surge AI RLHF Golden-Set Rubric Router: Week-1 Rollout Playbook

## Objective
Deploy a robust JSON contract router for RLHF, SFT, and evaluation data pipelines, ensuring every data point, rubric, and annotator event is normalized, scored, and governed with explicit schema, policy, and escalation checks.

## Day 1-2: Onboarding and Baseline Calibration
- Review Surge AI's current RLHF/SFT/eval data schemas, golden-set rubrics, and annotator calibration protocols.
- Walk through the provided router_system_prompt and JSON contract with the Human Data Architect and ops leads.
- Run the four test cases in a sandbox, comparing naive chatbot outputs to the orchestrated router's structured JSON responses.

## Day 3-4: Live Data Integration and Human Checkpoint SOPs
- Integrate the router as a pre-delivery gate in the RLHF and evaluation data pipeline.
- Configure escalation rules: Any missing rationale, ambiguous schema, unverified PII, prompt-injection, or unsupported RL environment triggers escalate_to_human: true and logs a checkpoint_reason.
- Assign a rotating human reviewer (Data Architect or QA lead) to audit all escalated cases daily, using the router's audit rationale to triage and remediate.

## Day 5-7: Feedback Loop, Metrics, and Adoption
- Track adoption metrics: percentage of RLHF/eval payloads passing schema and policy checks, number of escalations, and time-to-remediation for flagged cases.
- Collect feedback from annotators and QA on router clarity, false positives/negatives, and audit transparency.
- Iterate on rubric criteria and escalation logic based on real-world edge cases and reviewer insights.
- Document all SOPs, escalation triggers, and audit rationales in Surge AI's internal wiki for ongoing training and compliance.

## Success Metrics
- 100% of delivered RLHF/eval data emits valid JSON contracts with explicit schema_valid, policy_flag, and checkpoint_reason fields.
- All policy or schema violations are flagged and remediated before client delivery.
- Human reviewer workload is manageable, with clear audit trails for every escalation.
