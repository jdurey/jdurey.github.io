# Mercor LLM Evaluation & Rubric Router: Week-1 Rollout Playbook

## Objective
Deploy the JSON-based evaluation router to ensure all human data deliverables meet Mercor's quality, compliance, and audit standards from Day 1.

## Day 1-2: Onboarding & Training
- Introduce the router to the Quality Ops team and Learning Designers.
- Walk through the four pipeline stages: Input Normalization, Rubric Scoring, Policy Gate, and Human Auditor Agreement.
- Review the UNIFIED PRODUCTION JSON CONTRACT and demonstrate how the router flags, escalates, or delivers outputs.
- Run live demos using the four provided test cases, highlighting how the router catches ambiguous fields, PII, reward-gaming, and unsupported integrations.

## Day 3-4: Pilot & Human Checkpoint SOPs
- Integrate the router into a sandboxed Mercor workflow for APEX benchmark and enterprise data submissions.
- Assign two Quality Ops leads to monitor all escalated cases.
- For any output with escalate_to_human: true, require a dual-auditor review and consensus before delivery.
- Document all detected risks, flagged fields, and audit rationales in the case tracking system.
- For policy_flag: true cases, escalate to the compliance lead for final sign-off.

## Day 5: Metrics & Adoption
- Track: (a) % of submissions with missing/ambiguous fields caught, (b) PII/policy violations flagged, (c) reward-gaming attempts detected, (d) false-positive/negative rates in schema validation, and (e) average time to human resolution.
- Collect feedback from auditors and Learning Designers on router clarity, false alarms, and coverage.
- Adjust rubric calibration and escalation thresholds based on pilot findings.
- Prepare a summary report for leadership with adoption metrics, sample escalations, and next steps.

## Ongoing
- Update SOPs as new edge cases or integrations arise.
- Schedule weekly calibration sessions to review flagged cases and maintain reviewer agreement.
- Expand router coverage to additional Mercor workflows as adoption scales.