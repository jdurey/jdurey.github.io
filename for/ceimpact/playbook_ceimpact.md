# CEimpact Week-1 Rollout Plan: Deterministic CPE Module Compiler Kit

## Objective
Deploy the deterministic ACPE Pharmacy CPE SCORM/QTI Compiler with robust schema, policy, and audit guardrails to ensure every module meets accreditation, compliance, and item security standards.

## Day 1-2: Onboarding & SOP Alignment
- Brief CEimpact instructional designers and compliance leads on the JSON contract and workflow agent's schema/policy guardrails.
- Review the four pipeline stages: content normalization, SCORM/QTI compilation, governance gate, and human checkpoint.
- Distribute quick-reference guides for identifying ambiguous fields, PII/checkout boundaries, and unsupported integrations.

## Day 3-4: Hands-On Workflow Simulation
- Run the four provided test cases through the orchestrated pipeline.
- For each flagged escalation (e.g., missing VIS effective date, PII collection, answer-leak, unsupported LMS), assign a designated reviewer (e.g., CEimpact CE Administrator) to resolve or approve.
- Document each escalation in the audit log, noting checkpoint_reason and remediation steps.

## Day 5: Live Module Compilation & Human Review
- Compile a real CEimpact module (e.g., 'Vax Facts: Navigating Legal Issues') using the pipeline.
- Confirm that all objectives are mapped to ACPE standards, distractor/answer leaks are blocked, and ambiguous or policy-risk fields are escalated for review.
- Use the JSON contract output to track schema_valid, policy_flag, escalate_to_human, and audit rationale for every module.

## Adoption Metrics & Continuous Improvement
- Track: (1) % of modules with zero distractor/answer leaks, (2) % of escalations resolved within 24 hours, (3) reviewer agreement rate on escalated cases, (4) time-to-publish for new modules.
- Hold a weekly review to analyze flagged cases, update SOPs, and refine normalization/rubric rules based on real-world feedback.

## Human Checkpoint Rules
- Any incomplete, ambiguous, or unverified schema field triggers escalate_to_human.
- Any PII, checkout, unsupported integration, or prompt-injection triggers policy_flag and escalation/refusal.
- All escalations require a documented checkpoint_reason and reviewer sign-off before module release.