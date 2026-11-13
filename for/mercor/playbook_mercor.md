# Mercor LLM Evaluation & Rubric Calibration Kit: Week-1 Rollout Plan

## Objective
Enable Mercor Learning Designers to reliably evaluate, calibrate, and improve LLM-generated learning content and rubrics for client-facing upskilling programs, ensuring alignment with golden-set standards and policy compliance.

## Day 1-2: Golden-Set Curation
- Assemble a cross-functional team (Learning Designer, SME, Ops Reviewer) to select 10-15 gold-standard learning items and rubrics for each target vertical (e.g., fintech onboarding, SaaS sales enablement).
- Store golden sets in a shared, version-controlled repository (e.g., Notion, GitHub, or Mercor’s internal LMS).

## Day 3: System Setup & Training
- Deploy the LLM Evaluation Copilot with the provided system prompt and JSON schema.
- Run onboarding workshops for Learning Designers on rubric mapping, bias detection, and escalation protocols.
- Provide hands-on walkthroughs using CASE-01 and CASE-02 to practice normalization and domain alignment.

## Day 4: Live Evaluation & Human Checkpoints
- Begin live evaluation of new LLM-generated rubrics and content using the 4-stage pipeline.
- For any flagged cases (cross-model disagreement, policy violation, ambiguous mapping), Learning Ops Reviewer must review within 24 hours and annotate outcomes.
- Use CASE-03 and CASE-04 as red-team drills to reinforce policy boundary and hallucination detection.

## Day 5: Feedback & Iteration
- Collect feedback from Learning Designers and Ops Reviewers on pipeline usability and false positive/negative rates.
- Update golden sets and system prompt as needed based on real-world edge cases.

## Adoption Metrics
- Track time-to-review for flagged cases, cross-model agreement rates, and number of escalations per week.
- Target: >90% agreement on golden-set items, <24h turnaround for escalated cases, and <5% rubric drift incidents in first month.

## SOP Summary
- Always use the JSON schema for outputs.
- Escalate any ambiguous, policy-violating, or cross-model-discrepant cases.
- Review and update golden sets monthly or as new client verticals are added.