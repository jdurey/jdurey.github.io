# DataCamp Curriculum AI Router: Week-1 Rollout & Human-in-the-Loop SOP

## Objective
Deploy the Curriculum AI Router to ensure every new course item, assessment, or instructor submission is rigorously schema-validated, policy-compliant, and checkpointed for ambiguity, PII, or unsupported requests.

## Day-1 Setup
- Integrate the router as a required pre-review step for all new curriculum and assessment drafts in the DataCamp content pipeline.
- Train curriculum managers and instructional designers on interpreting JSON contract outputs, especially schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.

## Human Checkpoint Rules
- Any submission with schema_valid: false or escalate_to_human: true must be reviewed by a Curriculum Manager before approval or publication.
- Submissions with policy_flag: true (PII, external checkout, reward-gaming, or answer-leak) are immediately held for compliance review and cannot proceed until cleared.
- For ambiguous or incomplete fields (e.g., missing correct answer, unclear learning objective), the router delivers a normalized draft and flags for human completion.
- Unsupported integrations or feature requests (e.g., Tableau live grading) are flagged, and a remediation path is proposed to the requester.

## Adoption Metrics
- Track the percentage of submissions caught with missing/ambiguous fields, PII, or policy violations in the first week.
- Measure time-to-human-resolution for escalated cases.
- Monitor false positive/negative rates by comparing router escalations to human reviewer outcomes.
- Collect feedback from curriculum managers on clarity and actionability of router outputs.

## Continuous Improvement
- Weekly review of escalated cases and audit rationales to refine schema definitions and policy guardrails.
- Update training materials and onboarding SOPs as new edge cases or integrations arise.
- Foster a feedback loop between curriculum, compliance, and engineering to ensure router outputs remain tightly aligned with DataCamp's evolving standards and product capabilities.