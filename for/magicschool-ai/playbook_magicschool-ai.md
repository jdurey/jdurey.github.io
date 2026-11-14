# MagicSchool AI Raina Tutor Answer-Leak Prevention & Cost Routing: Week-1 Ops Playbook

## Objective
Deploy and operationalize the Day-1 evaluation pipeline for Raina Student Tutor answer-leak prevention, 6-rung cost routing, and district AI enablement. Ensure all MagicSchool AI workflows are governed by structured JSON contracts, robust rubric scoring, and human-in-the-loop checkpoints.

## Day 1-2: Setup & Stakeholder Alignment
- Review the JSON contract and DAG stages with district AI leads, curriculum directors, and IT compliance officers.
- Map all existing Raina Tutor and district workflow endpoints to the Input Normalization & Schema Validation stage.
- Assign district ops staff as escalation reviewers for flagged cases (missing schema, policy risks, unsupported integrations).

## Day 3-4: Pilot & Human Checkpoint Training
- Run 10-20 live Raina Tutor and district admin scenarios through the pipeline, including all four provided test cases.
- For each flagged or escalated case, require a human reviewer to audit the detected_risks_or_gaps and checkpoint_reason fields before output is released to end users.
- Train reviewers to recognize answer-leak, prompt-injection, and reward-gaming attempts using real MagicSchool AI classroom examples.

## Day 5-7: Metrics, Feedback, and Iteration
- Track key adoption and safety metrics: percentage of sessions with valid JSON output, rate of human escalations, rubric agreement rate between agent and human reviewers, and time-to-resolution for flagged cases.
- Hold a daily standup to review escalated cases and refine schema validation, rubric calibration, and policy checkpoint logic.
- Update district onboarding materials to include JSON contract requirements and escalation SOPs.

## Ongoing
- Weekly audit of pipeline logs for false negatives (missed leaks or policy risks) and false positives (over-escalation).
- Quarterly rubric recalibration with district curriculum and compliance teams.
- Continuous improvement of agent prompts and schema validation rules based on real classroom and district feedback.
