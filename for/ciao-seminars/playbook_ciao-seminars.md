## CIAO Seminars Week-1 Rollout Playbook: Dysphagia Protocol-to-SCORM+QTI Compiler

### Objective
Deploy and operationalize the CIAO Dysphagia Protocol-to-SCORM+QTI Compiler to streamline eCourse and assessment creation, ensure ASHA/AOTA compliance, and enforce robust governance for all new and updated clinical modules.

### Day 1-2: Onboarding & Access
- Assign a clinical content lead (SLP/OT with CIAO eCourse experience) and a technical facilitator.
- Grant access to the compiler interface and governance dashboard.
- Review the JSON contract schema and pipeline stages with all stakeholders.

### Day 3-4: Pilot Protocol Conversion
- Select 2-3 real CIAO dysphagia protocols (e.g., 'MBS: The Clear Picture', 'VitalStim Therapy and Beyond').
- Run each protocol through the pipeline:
  - Stage 1: Normalize protocol and map to ASHA/AOTA objectives.
  - Stage 2: Generate three-family physiological distractors, review for clinical plausibility.
  - Stage 3: Compile SCORM 1.2 and QTI 3.0 packages.
  - Stage 4: Review governance output, focusing on detected_risks_or_gaps, escalate_to_human, and checkpoint_reason fields.
- For any flagged cases, clinical lead reviews and resolves ambiguities or missing data before final export.

### Day 5-7: Human Checkpoint & Adoption Metrics
- Establish a daily checkpoint review: all escalated or policy-flagged cases are reviewed by a designated human (SLP/OT or compliance officer) within 24 hours.
- Track adoption metrics:
  - Number of protocols successfully converted without human escalation.
  - Frequency and type of detected schema gaps or policy flags.
  - Time-to-resolution for escalated cases.
- Gather feedback from course authors and compliance team on clarity of audit trails and ease of remediation.

### Ongoing SOP
- All new or revised dysphagia protocols must be processed through the compiler before eCourse publication.
- Maintain a log of all escalated cases and remediation actions for accreditation audits.
- Update distractor family templates and rubric criteria quarterly based on reviewer feedback and learner performance data.

### Success Criteria
- 90%+ of protocols processed with zero unflagged schema or policy violations.
- Human review turnaround under 24 hours for all escalated cases.
- Positive feedback from course authors and compliance reviewers on transparency and auditability.