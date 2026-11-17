## Prophetic Week-1 Rollout Plan for LinkedIn Easy-Apply Bypass AI Evals Engineer Pipeline

### Objective
Deploy and operationalize the trusted AI evaluation dataset pipeline to produce and maintain ground truth for Prophetic's LinkedIn Easy-Apply Bypass AI components.

### SOP Steps
1. **Data Onboarding and Normalization**
   - Ingest candidate interaction logs and LinkedIn Easy-Apply bypass test cases daily.
   - Run automated schema normalization scripts to detect missing, null, or ambiguous fields.
   - Flag any incomplete records for human review before scoring.

2. **Multi-Vendor Reward Calibration**
   - Apply calibrated reward models from Prophetic-approved vendors.
   - Monitor scoring consistency and detect reward-gaming patterns.
   - Log all scoring outputs with versioned rubric metadata.

3. **Anti-Gaming and Bias Checks**
   - Execute prompt-injection probes and refusal-aware grading.
   - Run anti-self-enhancement bias detection modules.
   - Automatically flag suspicious inputs for escalation.

4. **Human Reviewer Agreement Gates**
   - Route flagged cases to a panel of 3+ human reviewers.
   - Require minimum 80% inter-reviewer agreement to finalize ground truth.
   - Escalate persistent disagreements to senior evaluation leads.

5. **Governance and Compliance**
   - Enforce strict PII redaction and no unauthorized checkout or financial actions.
   - Maintain audit logs of all escalations and refusals.
   - Conduct weekly review meetings to analyze policy flags and system performance.

### Human Checkpoint Rules
- Escalate any schema ambiguity, null critical fields, or unverified external data.
- Refuse inputs containing prompt injections, reward-hacking attempts, or policy violations.
- Require human adjudication for borderline cross-model scoring ambiguities.

### Adoption Metrics
- Target 95% schema_valid rate with less than 5% human escalations after week 2.
- Achieve 90% reviewer agreement on ground truth labels.
- Reduce policy violation incidents to zero within first month.

### Communication
- Weekly status updates to Prophetic AI Enablement Lead.
- Immediate alerts on policy_flag or refusal cases.

This rollout plan ensures Prophetic's AI evaluation datasets are trustworthy, auditable, and aligned with the LinkedIn Easy-Apply Bypass role requirements.