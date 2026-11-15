# ATrain Education CEU Compiler: Week-1 Ops Playbook

## Objective
Deploy a robust, policy-locked pipeline for normalizing, scoring, and policy-checking all CEU items before import into EthosCE, ensuring every item meets ANCC, SCORM 1.2, and QTI 3.0 standards and is audit-ready.

## Day 1-2: Setup & Access
- Grant access to the ATrainCEU-ItemNormalizer and PolicyGate tools for curriculum and compliance staff.
- Import 3-5 representative items from high-volume courses (e.g., About Suicide Screening, Alzheimer's Disease and Related Dementias, Implicit Bias for Healthcare Providers).
- Review the JSON contract output for each item, confirming all schema fields are populated and policy/compliance flags are accurate.

## Day 3-4: Human Checkpoint & Remediation
- For any item with missing, null, or ambiguous fields (e.g., distractor rationale, jurisdiction), assign to a designated reviewer using the HumanRouter escalation.
- Review flagged items in the dashboard, referencing the checkpoint_reason and detected_risks_or_gaps fields.
- Remediate flagged items by completing missing schema fields or clarifying ambiguous content, then re-submit through the pipeline.

## Day 5: Policy & Compliance Audit
- Simulate edge cases: prompt-injection attempts, unsupported integrations, and PII/checkout actions.
- Confirm the pipeline blocks or escalates these cases with policy_flag: true and clear audit rationale.
- Document any false negatives or workflow gaps for remediation.

## Adoption Metrics
- Track the percentage of items passing schema and policy gates on first submission.
- Monitor average turnaround time for human escalations and remediations.
- Log all escalated cases and audit rationales for compliance reporting.

## SOP Summary
- Never import or publish any item unless schema_valid: true and policy_flag: false.
- All escalated or ambiguous cases must be reviewed and remediated by a human before production.
- Use the JSON contract as the single source of truth for item readiness and audit compliance.

This playbook ensures ATrain Education's CEU item pipeline is standards-locked, policy-compliant, and human-auditable from Day 1.