## Vanta Solutions Engineer AI Workflow: Week-1 Rollout Playbook

### Objective
Deploy the Day-1 AI workflow kit to support Solutions Engineers in triaging, normalizing, and checkpointing complex pre-sales technical evaluation requests with structured JSON governance and human-in-the-loop escalation.

### Day 1-2: Setup & Training
- **Install and configure the AI router** in Vanta's sandbox environment, ensuring access to supported integration and compliance schema lists.
- **Conduct a 60-minute onboarding session** for Solutions Engineers, walking through the four pipeline stages and JSON contract keys.
- **Review the four test cases** as a team, highlighting how the orchestrated workflow flags ambiguous fields, policy risks, and unsupported integrations.

### Day 3-4: Live Shadowing & Human Checkpoints
- **Route all incoming pre-sales technical queries** through the AI workflow in parallel with human review.
- **Require human checkpoint approval** for any case where `schema_valid` is false, `policy_flag` is true, or `escalate_to_human` is true. Document rationale in the audit log.
- **Flag and remediate any ambiguous, null, or unsupported fields** before proceeding with customer-facing deliverables.

### Day 5: Feedback & Adoption Metrics
- **Collect feedback from Solutions Engineers** on clarity, false positives/negatives, and time saved per case.
- **Track adoption metrics:**
  - Percentage of cases requiring human escalation
  - Average time to resolution for flagged vs. non-flagged cases
  - Number of policy or schema violations caught by the workflow
- **Iterate on prompt and schema rules** based on real-world edge cases and feedback.

### Ongoing SOP
- **Weekly review of escalated cases** to refine escalation criteria and improve schema/risk detection.
- **Continuous training** for new Solutions Engineers, using real anonymized cases and the four scenario types as calibration exercises.
- **Monthly audit** of JSON contract outputs for compliance and customer trust alignment.

This playbook ensures Vanta's Solutions Engineers deliver rigorous, trustworthy technical evaluations with AI-powered governance and human oversight.