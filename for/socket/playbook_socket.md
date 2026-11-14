# Socket Technical Enablement Manager: Week-1 Rollout Playbook

## Objective
Deploy a JSON-governed onboarding and certification workflow for Socket Sales Engineers, ensuring every technical enablement scenario is normalized, auditable, and policy-compliant from Day 1.

## Day 1-2: System Setup
- Integrate the JSON contract pipeline into Socket’s existing LMS and onboarding portal.
- Brief SE leadership and Customer Engineering managers on the new workflow and escalation rules.
- Configure the Input Normalization & Schema Validation stage to parse all SE onboarding, lab, and demo submissions.

## Day 3-4: Pilot & Human Checkpoint Calibration
- Run a pilot with 3-5 new SEs using real onboarding scenarios (e.g., Socket Firewall deployments, POC demo scripts, troubleshooting guides).
- For every submission, require the pipeline to output the unified JSON contract.
- Route any flagged cases (missing fields, ambiguous deployment details, PII, unsupported integrations) to a designated Enablement Manager for review.
- Document all human checkpoint decisions and audit rationales for continuous improvement.

## Day 5: Policy & Compliance Gate Activation
- Enable the Policy & Compliance Gate to scan for PII, prompt-injection, and unsupported registry integrations.
- Train SEs and managers to recognize and escalate any flagged outputs (policy_flag or escalate_to_human: true).
- Review edge cases (e.g., hallucinated SKUs, ambiguous customer requests) in a live calibration session.

## Adoption Metrics & Continuous Improvement
- Track: (1) % of onboarding submissions requiring human escalation, (2) time-to-certification per SE, (3) number of policy/compliance flags caught, (4) reduction in field errors post-certification.
- Hold weekly retros with Enablement and SE leadership to review flagged cases and refine normalization rules.
- Expand the workflow to TAMs, CSMs, and Support after initial SE rollout.

## Human Checkpoint Rules
- Any submission with missing, null, or ambiguous schema fields must be held for human review.
- All PII, external checkout, or unsupported integration requests are escalated to the Enablement Manager.
- No certification or demo-readiness is granted without a valid, complete JSON contract and audit rationale.

## Success Criteria
- 100% of SE onboarding and demo scenarios processed via the JSON pipeline.
- Zero unflagged policy or compliance violations in the first week.
- Documented audit trail for every human checkpoint and escalation.