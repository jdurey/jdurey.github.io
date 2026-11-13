# MagicSchool AI Day-1 Rollout Playbook: Principal Rubric & Raina Tutor Safeguards

## Week-1 Objectives
- Deploy the multi-stage rubric and answer-leak prevention pipeline for Raina Student Tutor.
- Ensure all outputs are aligned with MagicSchool's Principal Evaluation Rubric and answer-leak policies.
- Establish cost-routing and human escalation for ambiguous or high-risk cases.

## SOP Steps
1. **Golden-Set Calibration**
   - Load 10-15 golden-set student-tutor exchanges covering all rubric dimensions (e.g., ELA, Math, Science, SEL).
   - Run initial outputs through Stage 1 and review rubric scores. Flag any outputs below 4 for manual review.
2. **Policy Gate & Leak Detection**
   - Integrate Claude 3 Opus policy layer. Test with known answer-leak and prompt injection probes (see CASE-01, CASE-03).
   - Document any false positives/negatives and adjust detection thresholds in collaboration with the security team.
3. **6-Rung Cost Routing**
   - Configure CostRouter v2 with district-specific cost/complexity thresholds. Validate routing logic with 5-10 real teacher/student queries.
   - For any rung 5-6 cases, ensure "escalate_to_human" is triggered and logged in the audit dashboard.
4. **Cross-Model Verification & Human Checkpoint**
   - Assign 2-3 Enablement Team members to review all escalated cases daily. Use the cross-model verification protocol to resolve rubric disagreements or policy traps.
   - Document escalation outcomes and update the rubric or policy guidance as needed.

## Human Checkpoint Rules
- Any ambiguous rubric fit, prompt injection, or district policy change triggers mandatory human review.
- All escalations must be logged with explanation and resolution timestamp.

## Adoption Metrics
- Target: 95% rubric-aligned, leak-free outputs in first 7 days.
- <2% false positive escalation rate.
- All district policy changes reflected in rubric logic within 48 hours.

## Communication
- Daily Slack updates to Principal Evaluation and Enablement Teams.
- Weekly summary report to district leadership and MagicSchool AI product leads.