# Canvas Assessment Guardrails: Facilitator & Ops Playbook

## Week-1 Rollout Plan for Instructure Senior Learning Consultants

### 1. Onboarding & Access
- Ensure all consultants have access to the Canvas, Mastery Connect, and Impact sandbox environments.
- Distribute the JSON contract specification and router system prompt to all team members.
- Provide a 30-minute walkthrough of the 4-stage pipeline: normalization, diagnostic, policy checkpoint, and deliverable generation.

### 2. Human Checkpoint SOPs
- Any flagged case (missing standards mapping, ambiguous schema, PII, unsupported integration, or policy trap) must be reviewed by a designated curriculum or compliance lead before execution.
- Use the 'escalate_to_human' and 'policy_flag' fields in the JSON output to triage requests in the team dashboard.
- For ambiguous or incomplete items, the consultant reviews the normalized draft, confirms or corrects standards mapping, and clarifies item types before approval.
- For PII or external communication actions, verify institutional consent and compliance before proceeding.
- For unsupported integrations, provide the customer with a list of supported SIS/LTI partners and remediation steps.

### 3. Adoption Metrics & Feedback
- Track the number of requests processed, flagged, and escalated in the first week.
- Monitor time-to-resolution for escalated cases and aim for under 24 hours per checkpoint.
- Collect qualitative feedback from both consultants and institutional stakeholders on clarity, auditability, and actionable outputs.
- Review at least 10 random JSON contracts per week for schema validity, policy compliance, and audit rationale quality.

### 4. Continuous Improvement
- Hold a weekly debrief to review edge cases, update the router prompt, and refine escalation criteria.
- Share anonymized case studies of successful interventions and lessons learned.
- Iterate on the pipeline stages and system prompt based on real-world usage and feedback.

By following this playbook, Instructure consultants will ensure robust, compliant, and actionable curriculum and assessment workflows from Day 1.