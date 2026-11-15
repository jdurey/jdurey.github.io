# SE University Week-1 Rollout Playbook: SCORM 1.2 & QTI 3.0 Curriculum Normalization Pipeline

## Objective
Deploy and operationalize the Day-1 curriculum and assessment normalization pipeline for SE University's NCEES-accredited CEU and multi-state PDH catalog. Ensure all SCORM 1.2 and QTI 3.0 content is standards-locked, policy-checked, and human-verified before release.

## SOP Steps
1. **Initial Onboarding**
   - Brief curriculum and compliance staff on the pipeline's four stages: normalization, distractor analysis, policy/reward-gaming guard, and human checkpoint.
   - Review sample cases (see above) to calibrate expectations for schema gaps, policy flags, and escalation triggers.
2. **Content Submission**
   - All new or revised course modules and assessment items are submitted via the SEU_CurriculumNormalizer_v1 interface.
   - Staff must provide explicit region, standard, and SKU references for each item.
3. **Automated Processing**
   - The pipeline normalizes input to SCORM 1.2/QTI 3.0, analyzes distractors, and applies policy gates.
   - Any ambiguous, null, or unsupported fields automatically trigger escalate_to_human: true, with a detailed audit trail.
4. **Human Checkpoint**
   - Compliance or curriculum leads review all escalated cases daily, using the audit rationale to resolve ambiguities or policy risks.
   - Only verified, standards-compliant content is published to the SE University catalog.
5. **Adoption Metrics & Feedback**
   - Track: (a) percentage of submissions requiring human escalation, (b) time-to-resolution for flagged cases, (c) number of policy or schema violations caught pre-release, and (d) reviewer agreement rates.
   - Hold weekly retrospectives to refine escalation criteria and improve schema/rubric coverage.

## Human Checkpoint Rules
- Any incomplete, ambiguous, or externally unverifiable field must be reviewed by a human before release.
- All PII, checkout, or unsupported integration attempts are blocked and escalated.
- Prompt-injection or answer-leak attempts are refused and logged for compliance review.

## Success Criteria
- Zero unverified or noncompliant SCORM/QTI releases.
- 100% of flagged cases resolved with audit trail.
- Reviewer agreement rate above 95% within two weeks.
