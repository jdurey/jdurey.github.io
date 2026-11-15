# CLE Assessment Compiler Kit: Week-1 Rollout Plan for National Academy of Continuing Legal Education

## Objective
Deploy the Day-1 CLE SCORM 1.2 & QTI 3.0 Ethics/E-Discovery Assessment Compiler Kit to ensure all new and updated self-study courses meet multi-state accreditation, ABA/FRCP compliance, and robust schema governance.

## Day 1-2: Initial Setup
- Assign a project owner from the curriculum team and a technical liaison for SCORM/QTI integration.
- Install and configure the workflow pipeline (CLE_Content_Normalizer_v1, QTI_SCORM_Itemizer_v2, CLE_Policy_Guard_v1, CLE_Human_Ops_Review) on the internal content staging environment.
- Load 2-3 existing catalog courses (e.g., '3 Ways to Create More Favorable Case Outcomes with E-Discovery Principles') as test cases.

## Day 3-4: Human Checkpoint Calibration
- Run all four test scenarios from the provided cases through the pipeline.
- For each flagged gap, policy violation, or ambiguous field, require explicit human sign-off before final output is approved.
- Document all escalation events and checkpoint rationales in a shared audit log.

## Day 5: Team Training & Adoption
- Conduct a 90-minute hands-on workshop for curriculum developers and compliance officers, using real flagged outputs and remediation steps.
- Emphasize the importance of schema validation, PII/checkout verification, and reward-gaming detection.
- Provide a quick-reference guide for interpreting JSON contract fields and responding to escalation prompts.

## Day 6-7: Metrics & Continuous Improvement
- Track adoption metrics: number of flagged cases, average human review turnaround time, and rate of schema or policy errors caught pre-release.
- Hold a daily 15-minute standup to review new flagged outputs and discuss remediation or workflow adjustments.
- Set a target of 100% human checkpoint coverage for all flagged or escalated cases in the first week.

## Ongoing SOP
- All new CLE assessment content must pass through the pipeline before publication.
- Any case with schema_valid: false, policy_flag: true, or escalate_to_human: true requires documented human review and sign-off.
- Review and update escalation rules quarterly, based on audit log findings and accreditation changes.