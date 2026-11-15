# Abnormal AI Enablement Pipeline: Week-1 Ops Playbook

## Objective
Rapidly deploy a structured, role-based enablement workflow for all field, technical, and partner-facing teams, ensuring every onboarding, upskilling, and certification action is governed by JSON contract, human checkpoints, and policy compliance.

## Day 1-2: Intake & Schema Validation
- Enablement Ops team launches the Intake Bot to collect role, region, and product context for each new user or partner.
- Intake Bot normalizes entries to Abnormal AI’s taxonomy (AE, CSM, Channel Partner, etc.) and flags any missing or ambiguous fields for human review.
- All requests are routed via the JSON contract, with incomplete or ambiguous fields triggering escalate_to_human: true.

## Day 3-4: Learning Path Assignment & Policy Gate
- Routing Engine assigns onboarding or upskilling modules based on validated schema.
- Policy gates check for PII, unsupported integrations, or compliance boundaries (e.g., batch onboarding with external PII triggers policy_flag: true and escalation).
- All escalations are logged with checkpoint_reason for audit.

## Day 5: Scenario-Based Assessment & Certification
- Assessment Copilot delivers hands-on labs and pitch simulations tailored to each role and product.
- All certification assessments are scored against rubric; any reward-gaming, answer-leak, or ambiguous responses are flagged for human review.
- Human checkpoints are mandatory for policy_flag: true or escalate_to_human: true cases.

## Day 6-7: Feedback Loop & Analytics
- Enablement Analytics Dashboard aggregates completion, certification, and adoption metrics.
- Weekly review of flagged cases, adoption blockers, and field feedback triggers just-in-time content updates.

## Adoption Metrics
- Track onboarding completion rates, certification pass/fail, time-to-field-readiness, and number of escalated cases.
- Monitor field performance uplift (multi-product attach, platform story proficiency) and feedback loop closure rates.

## Human Checkpoint Rules
- Any ambiguous, incomplete, or unsupported schema triggers escalate_to_human: true.
- All policy_flag: true cases (PII, compliance, reward-gaming) require human review and audit rationale before proceeding.
