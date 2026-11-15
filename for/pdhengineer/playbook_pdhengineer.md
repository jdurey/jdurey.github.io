# PDHengineer Week-1 Rollout Playbook: Deterministic SCORM/QTI Compiler Kit

## Overview
This playbook guides PDHengineer operations and content teams through the first week of deploying the deterministic SCORM 1.2 & QTI 3.0 Course Compiler Kit. The goal is to ensure every course and assessment package meets state-board, NCEES, and FBPE requirements, with zero schema ambiguity, answer-key drift, or unsupported integrations.

## Day 1-2: Onboarding and System Setup
- Assign a project lead and compliance reviewer from the PDHengineer team.
- Deploy the agent pipeline in a sandbox environment with access to sample course PDFs, NTSB reports, and state ethics rules.
- Review the router_system_prompt and JSON contract schema with all stakeholders.

## Day 3-4: Controlled Pilot and Human Checkpoint Training
- Run 5-10 legacy course and quiz compilations through the pipeline.
- For each flagged case (missing fields, ambiguous references, PII, or unsupported rules), require human reviewer sign-off before package export.
- Use the audit trail (checkpoint_reason, detected_risks_or_gaps) to document all escalations and remediations.
- Train staff to recognize and resolve flagged risks, referencing real state-board documentation.

## Day 5-7: Production Shadowing and Metrics
- Shadow live course compilation requests, comparing naive chatbot outputs to orchestrated pipeline results.
- Track the following adoption metrics:
  - Percentage of compilations with zero schema or policy flags on first pass.
  - Number of escalations resolved by human reviewers within 24 hours.
  - Instances of answer-key drift or distractor leakage detected and remediated.
- Hold a daily standup to review flagged cases, update SOPs, and refine escalation criteria.

## SOP for Human Checkpoints
- Any case with schema_valid: false, policy_flag: true, or escalate_to_human: true must be reviewed by a compliance lead before LMS export.
- All audit fields must be completed with clear rationale and remediation steps.
- No course or assessment package may be published without explicit human approval if any risk or ambiguity is detected.

## Success Criteria
- 100% of SCORM/QTI packages pass state-board and LMS import checks.
- All flagged risks are resolved or escalated within 24 hours.
- Zero instances of unsupported integrations, PII leakage, or answer-key drift in production.