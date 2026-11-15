# PharmCon (freeCE) Week-1 Rollout Playbook: Controlled Substance & USP <800> CEU Assessment Compiler

## Objective
Deploy and operationalize the JSON-governed curriculum and assessment pipeline for accredited CEU content, ensuring every SCORM 1.2 and QTI 3.0 item meets ACPE, ANCC, DEA, and USP <800> compliance, with full audit and human checkpoint coverage.

## Day 1-2: Team Onboarding & SOP Review
- Brief curriculum, compliance, and IT staff on the new JSON contract and router system prompt.
- Distribute the UNIFIED PRODUCTION JSON CONTRACT and review each key, using real PharmCon (freeCE) catalog examples (e.g., 'Preventing Controlled Substance Diversion in a Pharmacy').
- Walk through the four pipeline stages and review sample outputs for each case scenario.

## Day 3-4: Hands-On Authoring & Validation
- Assign curriculum authors to submit real course content and assessment items through the normalization and QTI compiler stages.
- Use the router agent to process submissions, reviewing the JSON output for schema_valid, policy_flag, escalate_to_human, and detected_risks_or_gaps.
- For any flagged or escalated cases, route to designated human reviewers with the provided checkpoint_reason and remediation steps.

## Day 5: Human Checkpoint Drills & Policy Audit
- Simulate edge cases (PII, unsupported integrations, ambiguous fields, and answer-leak attempts) using the provided test scenarios.
- Ensure human reviewers can interpret audit rationales and take corrective action or approve safe drafts.
- Document any recurring schema gaps or policy risks for SOP refinement.

## Adoption Metrics & Success Criteria
- Track percentage of submissions with zero missing/ambiguous fields after first pass.
- Monitor time-to-resolution for escalated cases and reviewer agreement rates.
- Target: 100% of assessment items and course modules processed with valid JSON contracts, all policy risks escalated, and no reward-gaming or compliance violations accepted.

## Ongoing
- Weekly review of flagged cases and SOP updates.
- Quarterly rubric calibration against ACPE/ANCC and DEA/USP updates.
