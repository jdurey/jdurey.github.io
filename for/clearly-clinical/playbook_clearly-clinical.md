# Clearly Clinical: Week-1 Rollout Playbook for Audio-to-SCORM/QTI CEU Compiler

## Objective
Deploy and operationalize the Day-1 Audio-to-SCORM 1.2 & QTI 3.0 CEU Compiler pipeline, ensuring all content, assessment, and workflow outputs meet APA, ASWB ACE, NBCC, and CAMFT accreditation, audit, and compliance standards.

## SOP Steps
1. **Team Onboarding**
   - Brief curriculum, compliance, and operations staff on the pipeline’s four stages and JSON contract governance.
   - Distribute this playbook and review the router_system_prompt logic and escalation rules.

2. **Content Ingestion & Segmentation**
   - Assign a staff member to upload new podcast/self-study audio to the ingestion tool.
   - Review automated transcript segments for accuracy and learning objective alignment.

3. **Domain Normalization & Standards Mapping**
   - Curriculum lead reviews AI-normalized outputs, focusing on APA Ethical Principles, C-SSRS/Safety Planning, and IFS standards.
   - Any flagged or ambiguous fields (e.g., incomplete learning objectives) are escalated for human confirmation before proceeding.

4. **SCORM/QTI Item Generation & Review**
   - SCORM/QTI compiler agent generates modules and assessment items, embedding distractor diagnostics and answer-leak prevention.
   - Human reviewer checks for policy flags, schema validity, and compliance with accreditation standards.

5. **Governance & Human Checkpoints**
   - All outputs with policy_flag: true or escalate_to_human: true are routed to the compliance lead for review and sign-off.
   - Document all escalations and audit rationales in the workflow log.

## Adoption Metrics
- **First-week success rate:** % of modules/assessments passing schema and policy checks without escalation.
- **Escalation rate:** % of cases requiring human intervention (target <15% after week 1).
- **Compliance audit pass:** 100% of outputs must meet APA/ASWB ACE/NBCC audit requirements.
- **Feedback loop:** Weekly review of flagged cases and continuous improvement of normalization and escalation logic.

## Human Checkpoint Rules
- Any incomplete, ambiguous, or unsupported schema field.
- Any external PII, checkout, or financial action.
- Any detected reward-gaming, answer-leak, or prompt-injection attempt.
- Any unsupported integration or jurisdictional mismatch.

## Next Steps
- Schedule weekly standups to review flagged cases and pipeline improvements.
- Update normalization rules and escalation triggers based on real-world edge cases.