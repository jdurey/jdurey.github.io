# Brisk Teaching: Week-1 Rollout Playbook for Automated Writing Feedback Calibration

## Objective
Deploy the Golden-Set Writing Feedback Calibration Pipeline to ensure AI-generated feedback is rubric-aligned, bias-mitigated, and ready for district-scale adoption.

## Day 1-2: Setup & Golden-Set Import
- Import 20+ district-approved writing samples (diverse genres, ELL, SPED, argumentative, narrative) as the golden-set.
- Upload corresponding Brisk-aligned rubrics for each assignment type.
- Configure the normalization agent to handle common formatting and ELL/SPED accommodations.

## Day 3: LLM & Panel Calibration
- Run golden-set samples through the Brisk LLM and cross-model panel (GPT-4o, Claude 3 Sonnet).
- Compare outputs to human-annotated gold standards, logging discrepancies.
- Adjust model prompts and scoring anchors for rubric fidelity and bias mitigation.

## Day 4: Human Checkpoint Training
- Train district reviewers on escalation SOPs: ambiguous rubric mapping, cross-model disagreement, policy boundary triggers (e.g., PII, prompt injection).
- Review flagged cases in a shared dashboard, annotate with rationale, and update calibration notes.

## Day 5: Live Pilot & Metrics
- Process 100+ real student submissions from Brisk's platform.
- Monitor pipeline logs for: (1) cross-model agreement rate, (2) escalation frequency, (3) rubric alignment accuracy, and (4) reviewer turnaround time.
- Hold a daily standup to review flagged cases and refine escalation criteria.

## Human Checkpoint Rules
- Any case with rubric ambiguity, policy trap, or cross-model disagreement is auto-escalated.
- Reviewers must annotate final decisions and update the golden-set if new edge cases emerge.

## Adoption Metrics
- Target: 90%+ rubric alignment accuracy, <5% unhandled escalations, reviewer turnaround <24h.
- Weekly review of flagged case logs and calibration drift.

## Next Steps
- Expand golden-set, iterate on panel prompts, and prepare for district-wide rollout.
