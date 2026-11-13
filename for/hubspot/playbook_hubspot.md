# HubSpot TrustOps Red Team Kit: Week-1 Rollout Plan

## Objective
Deploy a behavioral red team pipeline to proactively test and harden HubSpot's AI agent workflows against adversarial prompts, policy bypasses, and ambiguous customer requests, ensuring customer trust and compliance from Day 1.

## Day 1-2: Setup & Access
- Provision access to the TrustOps Red Team Kit for the Senior Manager, Customer Trust Enablement and designated TrustOps specialists.
- Integrate the Input Normalization & Canary Check module with HubSpot's Agent Hub and Service Hub test environments.
- Confirm logging and audit trail setup for all flagged and escalated cases.

## Day 3-4: Scenario Injection & Human Checkpoint Configuration
- Load the four provided HubSpot-specific test cases into the pipeline.
- Assign at least two TrustOps team members as human checkpoint reviewers for all escalated or ambiguous cases.
- Review and customize escalation triggers (e.g., canary phrase detection, ambiguous intent, policy boundary violations) to match HubSpot's latest policies.

## Day 5: Live Simulation & Response Calibration
- Run live simulations using the provided cases and several real anonymized customer queries from Service Hub.
- Document agent responses, refusal rates, escalation frequency, and any policy or refusal errors.
- Hold a daily 30-minute standup to review flagged cases and calibrate escalation/refusal logic.

## Day 6-7: Metrics, Feedback, and Continuous Improvement
- Track adoption metrics: percentage of high-risk cases correctly escalated, refusal accuracy, and time-to-human resolution.
- Gather feedback from TrustOps reviewers on edge cases and false positives/negatives.
- Iterate on prompt hardening, canary phrase lists, and escalation SOPs based on findings.

## Ongoing SOP
- Require human checkpoint review for all flagged or high-risk cases (minimum 2 reviewers per week).
- Update policy boundaries and escalation rules monthly or as HubSpot policies evolve.
- Report weekly adoption and incident metrics to the Customer Trust Enablement leadership.

## Success Metrics
- 100% refusal accuracy on policy-trap and prompt injection cases.
- <10% false negative rate for escalation triggers.
- <24h mean time to human resolution for escalated cases.
- Documented improvement in agent refusal and escalation behavior within two weeks.