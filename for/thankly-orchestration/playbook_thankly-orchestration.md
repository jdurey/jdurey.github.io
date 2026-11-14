# Thankly RL Shopping-Agent Rubric Router: Week-1 Rollout Playbook

## Objective
Deploy a robust agent orchestration pipeline that transforms real shopper queries into structured RL tasks, applies anti-gaming rubric grading, and enforces human-calibrated checkpoints for ambiguous or risky cases.

## Day 1-2: Onboarding & Environment Setup
- Clone the kit and review the JSON contract specification.
- Integrate ThanklyNormalizerV1 and ThanklyRubricRouter into the dev environment.
- Run sample queries through the normalization and rubric stages, confirming schema extraction and ambiguity detection.

## Day 3: Automated Grader & Policy Gate Calibration
- Connect ThanklyJudge (LLM+Rules) to the pipeline.
- Test governance and policy traps (PII, checkout, prompt-injection) using provided cases.
- Confirm that all outputs strictly emit the unified JSON contract, with correct policy_flag and escalate_to_human settings.

## Day 4: Human Calibration Loop & Audit Logging
- Set up ThanklyHumanOps review dashboard for escalated cases.
- Train reviewers on audit rationale, schema gap detection, and reward calibration.
- Log reviewer agreement rates and error types for continuous rubric improvement.

## Day 5: Live Pilot & Adoption Metrics
- Deploy the pipeline to a limited set of live Thankly shopper sessions.
- Track: (1) % of cases escalated to human, (2) reviewer agreement with automated grading, (3) number of reward-gaming or policy violations caught, (4) time-to-resolution for ambiguous cases.
- Gather feedback from both operators and end-users on clarity of responses and audit trails.

## SOPs & Human Checkpoint Rules
- Any ambiguous, null, or incomplete schema field triggers escalate_to_human: true.
- All PII, checkout, or unsupported integration actions require policy_flag: true and human review.
- Prompt-injection or reward-gaming attempts must be refused or escalated, never processed.
- Human reviewers must document audit rationales and update rubric calibration weekly.

## Success Criteria
- 100% of outputs conform to the JSON contract.
- Zero unverified PII/checkout actions processed without escalation.
- Reviewer agreement rate above 90% within the first week.
- All reward-gaming and policy traps are caught and logged.