# Week-1 Rollout Plan: ASHA Dysphagia CEU SCORM/QTI Item Normalizer & Policy Router

## Objective
Deploy the Day-1 normalization and policy-routing kit to ensure every new Northern Speech Services dysphagia CEU course item, assessment, and workflow step is SCORM 1.2/QTI 3.0 compliant, audit-ready, and free from ambiguous fields, unsupported integrations, or policy violations.

## SOP Steps
1. **Initial Operator Training**
   - Conduct a 90-minute onboarding session for SLP curriculum leads and CEU course compilers, using real catalog items (e.g., 'Medical Speech Pathology Essentials for Dysphagia Practice', 'e353: Moving Beyond A Score').
   - Walk through the four pipeline stages: content normalization, schema validation, policy routing, and rubric-based scoring.
   - Demonstrate JSON contract outputs and checkpoint/audit fields using the provided test cases.

2. **Live Item Intake & Processing**
   - Route all new or revised SCORM/QTI items through the pipeline. Operators submit items via the intake form, triggering the agentic workflow.
   - Human checkpoints are mandatory for any flagged schema_valid: false, policy_flag: true, or escalate_to_human: true outputs. Operators review flagged drafts, resolve ambiguities, and approve or reject escalations.

3. **Governance & Policy Enforcement**
   - All requests involving PII, checkout, or external integrations must be escalated for manual review. No direct processing is permitted without explicit operator approval.
   - Prompt-injection, answer-leak, or reward-gaming attempts are logged and refused, with audit rationale provided for compliance.

4. **Metrics & Adoption**
   - Track: (a) number of items processed, (b) flagged escalations, (c) time-to-resolution for human checkpoints, (d) rubric agreement rates between agent and human reviewers.
   - Weekly review of flagged cases and audit logs to refine schema/rubric rules and operator SOPs.

## Success Criteria
- 100% of new items pass schema and policy validation before SCORM/QTI compilation.
- Zero unverified PII/checkout actions processed.
- All flagged cases have clear audit trails and operator resolutions.
- Operator feedback loop closes rubric edge cases and improves normalization accuracy.
