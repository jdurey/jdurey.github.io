# Speak Assessment Router & Rubric Guardrail: Week-1 Rollout Plan

## Objective
Deploy a robust JSON contract router and rubric guardrail for all assessment workflows, ensuring every Proficiency, Placement, and Curriculum Mastery event at Speak is schema-verified, policy-compliant, and audit-traceable from Day 1.

## Day 1-2: Onboarding & Training
- Brief Proficiency and Curriculum teams on the JSON contract and router workflow.
- Walk through each pipeline stage: normalization, rubric mapping, policy gate, and human checkpoint.
- Use the four provided test cases to demo both naive and contract-compliant behaviors.
- Assign team members to review flagged outputs and checkpoint rationales.

## Day 3-4: Controlled Pilot
- Route all new assessment submissions through the router in shadow mode.
- Human reviewers compare router outputs with legacy/manual workflows, focusing on:
  - Detection of missing/ambiguous rubric fields
  - Policy/compliance boundary triggers (PII, prompt-injection, unsupported languages)
  - Audit trail completeness
- Log all escalate_to_human and policy_flag events for review.

## Day 5-7: Full Integration & Metrics
- Switch to production mode: router governs all assessment intake and scoring events.
- SOP: Any escalate_to_human or policy_flag event must be reviewed and resolved by an Assessment Ops Reviewer within 24 hours.
- Adoption metrics:
  - % of submissions with schema gaps or policy risks correctly flagged
  - Time-to-resolution for escalated cases
  - Reviewer agreement rate on rubric normalization and audit rationale
- Weekly retro: Review flagged cases, update router rules for new edge cases, and share learnings with the team.

## Ongoing
- Integrate router outputs with Speak's assessment analytics and reporting dashboards.
- Schedule monthly audits of escalation logs and policy refusals to ensure continuous improvement.
- Expand rubric and construct mapping as new languages or assessment types are added.