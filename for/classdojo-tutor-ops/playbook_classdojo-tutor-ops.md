# ClassDojo TutorOps JSON Governance Kit: Week-1 Rollout Playbook

## Objective
Deploy a robust, auditable JSON workflow for Tutor Operations, ensuring every tutor application, session booking, and assessment item is schema-valid, policy-compliant, and free from reward-gaming, PII, or unsupported requests.

## Day 1-2: Team Onboarding & Training
- **Walk through the JSON contract**: Review each key (action, route_or_tool, schema_valid, policy_flag, escalate_to_human, detected_risks_or_gaps, substantive_deliverable, proposed_steps, customer_or_learner_response, checkpoint_reason) with TutorOps, Product, and Support leads.
- **Live demo**: Run the four provided cases through the orchestrated pipeline, highlighting where naive chatbots fail and the governance kit succeeds.
- **Human checkpoint rules**: Emphasize that any ambiguous, incomplete, or policy-risk case (missing locale, PII, prompt-injection, unsupported SKU) must be escalated to a human reviewer before approval.

## Day 3-4: Pilot Integration & SOPs
- **Integrate the router agent** into the TutorOps intake and session booking flows as a pre-approval step.
- **Standard Operating Procedures**:
  - Intake: All tutor/session inputs pass through the normalization and guardrail stages before reaching the dashboard.
  - Escalation: Any flagged case is routed to a designated TutorOps supervisor for review within 2 business hours.
  - Audit: Every decision (approve, hold, refuse) is logged with checkpoint_reason for compliance and training.

## Day 5: Adoption Metrics & Feedback
- **Track metrics**: Number of escalations, schema-invalid cases caught, policy violations prevented, and time-to-resolution for human checkpoints.
- **Feedback loop**: Hold a retrospective with TutorOps and Support to refine schema fields, escalation criteria, and customer/learner response templates.

## Success Criteria
- 100% of tutor and session records entering production are schema-valid and policy-compliant.
- Zero PII, unsupported integrations, or answer leaks reach families or tutors.
- Human checkpoint SLAs met for all escalated cases.

## Next Steps
- Expand the JSON governance kit to cover new subjects, languages, and group session types as ClassDojo Tutor scales.