# Prime Intellect RL Evaluation Router: Week-1 Rollout Playbook

## Objective
Deploy and operationalize the RL Evaluation Router to enforce structured JSON governance, golden-set scoring, and policy escalation for all RL agent and coding task evaluations.

## Day 1-2: Setup & Integration
- Clone the evaluation router repo and configure environment variables for Prime Intellect’s RL task schemas.
- Integrate the router as a pre-processing and post-processing layer in the RL evaluation pipeline, ensuring all agent outputs and environment states are routed through the system.
- Validate connectivity with RLTaskScorer v2, PolicyGuard v1, and OpsReviewOps modules.

## Day 3-4: Human Checkpoint SOPs
- Train evaluation and ops staff on interpreting router JSON outputs, especially escalate_to_human and policy_flag fields.
- Establish a Slack or ticketing channel for real-time human review of escalated cases (null/ambiguous fields, PII, prompt-injection, unsupported integrations).
- Document audit rationale and remediation steps for each escalated case, feeding back into rubric calibration.

## Day 5-7: Live Testing & Metrics
- Run all four provided test cases through the router, confirming correct escalation, refusal, and audit rationale behaviors.
- Monitor adoption metrics: percentage of evaluations routed through the system, number of escalations, and mean time to human resolution.
- Review false positive/negative rates for policy and schema flags, iterating on normalization and rubric logic as needed.

## Ongoing
- Weekly review of escalated cases and audit logs to refine rubrics and policy boundaries.
- Track operator feedback and update SOPs for new edge cases or integrations.
- Target: 100% of RL evaluation traffic governed by router, with <2% missed escalations and <24h human resolution SLA.
