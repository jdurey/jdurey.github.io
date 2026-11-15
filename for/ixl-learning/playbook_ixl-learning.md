# IXL Learning Rosetta Stone Tutor Training Specialist: Week-1 Rollout Playbook

## Objective
Deploy the Tutor Session Rubric Normalizer and Compliance Gate to ensure all tutor observations, rubrics, and feedback events are standards-aligned, schema-complete, and policy-compliant from Day 1.

## Day 1-2: Setup and Orientation
- Introduce the JSON contract workflow to all Tutor Training Specialists and QA leads.
- Review the four pipeline stages: Input Normalization, Rubric Scoring, Policy Checkpoint, and Human Escalation.
- Distribute sample cases (see above) to demonstrate common failure points and the importance of structured governance.

## Day 3-4: Pilot and Human-in-the-Loop Checkpoints
- Run all live tutor observation and rubric submissions through the agent pipeline.
- For any flagged or ambiguous fields (e.g., missing rubric data, unverified PII, unsupported integrations), the system auto-escalates to a designated human reviewer.
- Reviewers must confirm or correct flagged items, using the normalized draft as a starting point.
- Log all escalations and resolutions for audit and continuous improvement.

## Day 5-7: Adoption, Metrics, and Feedback
- Track adoption metrics: percentage of tutor submissions processed via the pipeline, number of escalations, and time-to-resolution.
- Hold a daily standup to review flagged cases, discuss edge cases, and refine escalation SOPs.
- Collect feedback from specialists and tutors on clarity, usability, and any schema or rubric gaps.
- Iterate on the workflow based on real-world usage and feedback, updating normalization rules and escalation triggers as needed.

## Human Checkpoint Rules
- Any incomplete, ambiguous, or policy-risk field must be held for human review before finalization.
- All PII, unsupported integrations, or prompt-injection attempts are to be escalated and never auto-processed.
- Human reviewers must document rationale for each escalation, supporting continuous audit and improvement.

## Success Metrics
- 100% of tutor observations and rubrics processed with valid JSON contract.
- Zero unreviewed policy violations or answer-leak incidents.
- Reduction in incomplete or ambiguous rubric submissions by 80% within the first week.
