# Week-1 Rollout Plan: TEAM-CBT Case-to-SCORM/QTI Compiler for Feeling Good Institute

## Objective
Deploy and operationalize the clinical CBT case-to-SCORM 1.2 + QTI 3.0 compiler with distractor verification and governance gates for Feeling Good Institute's APA & ASWB ACE-accredited TalentLMS courses.

## Day 1-2: Onboarding & Access
- Grant access to the compiler toolkit for curriculum leads, instructional designers, and compliance officers.
- Provide a 30-minute live walkthrough of the pipeline: case normalization, distractor verification, SCORM/QTI compilation, and governance router.
- Distribute the JSON contract schema and sample outputs to all team members.

## Day 3-4: Pilot Item Authoring & Human Checkpoints
- Select 2-3 real TEAM-CBT case studies from 'Core Skills for Effective Therapy' and 'Deliberate Practice Hub'.
- Run each through the pipeline, reviewing outputs at each stage.
- At the governance stage, require human review for any flagged cases: ambiguous objectives, missing fields, PII/checkout actions, unsupported integrations, or policy traps.
- Document all escalations and checkpoint rationales for audit.

## Day 5: Quality Assurance & Rubric Calibration
- Cross-check distractor families against TEAM-CBT error taxonomies and ensure no answer-leak or superficial cues.
- Validate SCORM 1.2 and QTI 3.0 packages in a TalentLMS sandbox.
- Review JSON contract logs for schema validity, policy flags, and escalation accuracy.

## Day 6-7: Feedback & Adoption Metrics
- Collect feedback from all pilot users on clarity, false positives/negatives, and ease of human checkpointing.
- Track metrics: number of escalations, schema errors caught, policy violations prevented, and successful TalentLMS imports.
- Prepare a summary report with recommendations for full-scale rollout and ongoing governance.

## SOP Reminders
- Never bypass flagged governance or policy traps without human review.
- All outputs must conform to the unified JSON contract and Feeling Good Institute's accreditation standards.
- Escalate any ambiguous, external, or unsupported requests for compliance signoff.
