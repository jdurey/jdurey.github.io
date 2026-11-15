# Edmentum Principal Learning Designer AI Governance Runbook (Week-1 Rollout)

## Purpose
This runbook enables Principal Learning Designers and curriculum teams to operationalize the Edmentum Standards-Locked AI Item & Rubric Governance Router from Day 1, ensuring every AI-generated instructional item or assessment meets rigorous schema, policy, and audit standards.

## Day 1-2: System Onboarding & Human Checkpoint Setup
- Review the JSON contract structure and ensure all team members understand each key (action, route_or_tool, schema_valid, policy_flag, escalate_to_human, detected_risks_or_gaps, substantive_deliverable, proposed_steps, customer_or_learner_response, checkpoint_reason).
- Configure the router to map only to Edmentum-supported standards (e.g., CCSS, NGSS, TEKS) and block unsupported integrations or jurisdictions.
- Establish a human checkpoint queue for all cases where schema_valid: false, policy_flag: true, or escalate_to_human: true.

## Day 3-4: Live Workflow Pilots
- Run 10-20 real Edmentum item authoring and review scenarios through the pipeline, including at least 2 from each test case type (Normal_Complex, Governance_Checkpoint, Policy_Trap, Schema_Edge_Case).
- For each escalated case, assign a Principal Learning Designer or designated reviewer to audit the JSON output, confirm the detected risks/gaps, and approve or remediate the item.
- Document all escalations, audit rationales, and remediation actions in a shared tracker.

## Day 5-7: Metrics, Feedback, and Adoption
- Track adoption metrics: percentage of items routed through the pipeline, number of escalations, average human review time, and rate of schema or policy violations caught pre-release.
- Gather feedback from reviewers on clarity of detected risks, audit trail usefulness, and any false positives/negatives.
- Iterate on schema mapping, rubric calibration, and checkpoint rules based on real-world usage.

## Ongoing SOP
- Require all new AI-generated items and assessments to pass through the router before release.
- Update the standards mapping and policy rules quarterly, reflecting new Edmentum-supported standards or compliance requirements.
- Maintain a living FAQ and troubleshooting guide for reviewers and curriculum designers.
