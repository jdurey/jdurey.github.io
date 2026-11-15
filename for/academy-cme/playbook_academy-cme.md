## Week-1 Rollout Plan: Guideline-to-SCORM/QTI Pipeline for American Academy of CME

### Objective
Deploy a robust, policy-compliant pipeline for converting clinical guidelines and symposium monographs into SCORM 1.2 enduring CE modules and QTI 3.0 assessments, with built-in schema and policy governance for American Academy of CME's interprofessional CE programs.

### Day 1-2: Onboarding & Access
- Grant access to the pipeline UI and documentation for curriculum, assessment, and compliance teams.
- Conduct a 45-minute onboarding session covering: pipeline stages, JSON contract outputs, and escalation rules.
- Distribute quick-reference guides on generic pharmacologic naming, Moore's Outcomes Levels, and PII redaction.

### Day 3-4: Hands-On Lab & Human Checkpoint SOPs
- Run 2-3 real guideline-to-module conversion scenarios (e.g., Cardiology, Oncology) in sandbox mode.
- For each run, require human reviewers to:
  - Confirm all learning objectives are mapped to Moore's Levels 4-5 and use generic drug names.
  - Review detected_risks_or_gaps and checkpoint_reason fields in the JSON output.
  - Approve, remediate, or escalate flagged cases (ambiguous objectives, PII, unsupported integrations).
- Document all escalations and remediation actions in a shared tracker.

### Day 5: Policy & Compliance Drill
- Simulate edge cases: prompt-injection attempts, PII leaks, and unsupported LMS requests.
- Validate that the system outputs correct JSON governance flags and halts automation as required.
- Review audit logs for false negatives or missed escalations.

### Adoption Metrics & Continuous Improvement
- Track: (1) % of modules passing schema and policy checks on first run, (2) average human review time per escalation, (3) number of detected policy or schema risks per week.
- Hold a retrospective to refine escalation SOPs and update quick-reference materials.

### Human Checkpoint Rules
- Any flagged ambiguous, incomplete, or policy-risk field must be reviewed and resolved by a designated compliance lead before module publication.
- All PII or unsupported integration requests are hard-stopped for human intervention.
- Only modules with schema_valid: true and policy_flag: false may proceed to LMS upload.
