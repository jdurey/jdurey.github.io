# Beacon Hill Financial Educators: Week-1 Rollout Playbook for Deterministic PDF-to-SCORM/QTI Compiler

## Objective
Deploy and operationalize the deterministic PDF/tax-code to SCORM 1.2 + IMS QTI 3.0 compiler, ensuring all NASBA QAS Self-Study CPA CPE, CFP Board CE, and IRS Enrolled Agent content is converted with full compliance, auditability, and zero reward-gaming or schema ambiguity.

## Day 1-2: Onboarding & Access
- Grant curriculum and compliance leads access to the compiler interface and audit dashboard.
- Review the JSON contract schema and escalation rules with all team members.
- Load sample '1040 Workshop', 'Private Equity Mastery', and 'CPA Regulatory Ethics' PDFs for dry-run ingestion.

## Day 3-4: Human-in-the-Loop QA
- For each conversion, review the compiler's JSON output:
  - Confirm all fields (action, route_or_tool, schema_valid, policy_flag, escalate_to_human, etc.) are present and accurate.
  - For any escalate_to_human=true or policy_flag=true, curriculum leads must review the flagged case, add missing rationale, or resolve ambiguities before approval.
- Use the audit trail to track all human interventions and remediation steps.

## Day 5-6: Policy & Rubric Calibration
- Run the four provided test cases to validate pipeline behavior against naive chatbot baselines.
- Document any edge cases or false positives/negatives and update policy gates as needed.
- Ensure all distractors, review checkpoints, and scoring logic are standards-locked and free of answer-leaks.

## Day 7: Adoption Metrics & SOP Finalization
- Track metrics: number of escalations, average human review time, schema/rubric error rates, and successful SCORM/QTI exports.
- Hold a team review to finalize SOPs for ongoing use, including:
  - Escalation response SLAs (e.g., <24h for flagged items)
  - Monthly rubric/policy review cadence
  - Continuous improvement loop for schema and policy updates

## Success Criteria
- 100% of outputs meet NASBA QAS and CFP Board compliance with zero unflagged ambiguities or policy violations.
- Human review is only required for true edge cases, reducing manual QA load by >60%.