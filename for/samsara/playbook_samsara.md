# Samsara GTM Agent Orchestration Rollout Playbook (Week 1)

## Objective
Deploy a production-grade, policy-gated agent orchestration pipeline for GTM AI Engineering, ensuring all sales, customer success, and support automations are governed by strict schema, compliance, and escalation logic.

## Day 1-2: Setup & Baseline
- Deploy the agent orchestration pipeline in a staging environment using the provided JSON contract and system prompt.
- Integrate with Samsara's GTM data schemas (opportunities, contacts, equipment events) and tool APIs (Salesforce, internal GTM apps).
- Validate pipeline with 10+ real historical workflow samples, ensuring normalization and schema validation logic triggers as designed.

## Day 3-4: Human Checkpoint & Policy Gate Calibration
- Configure escalation rules: all ambiguous, null, or missing schema fields, PII/checkout actions, unsupported integrations, and detected policy risks must trigger escalate_to_human.
- Assign GTM operations leads as human reviewers for flagged cases. Document audit trail for each escalation, including checkpoint_reason and detected_risks_or_gaps.
- Run through the four provided test cases, ensuring naive chatbot failure is caught and orchestrated agent emits valid JSON contract for each.

## Day 5: Live Shadow Deployment & Adoption Metrics
- Enable shadow mode in production: agent processes live GTM workflow requests, but only delivers outputs to human reviewers for final approval.
- Track adoption metrics: percent of requests normalized, number of escalations, time-to-human resolution, and audit trail completeness.
- Collect feedback from GTM operators on clarity of customer_or_learner_response and checkpoint_reason fields.

## Week 1 Success Criteria
- 100% of flagged policy, schema, or unsupported integration cases are escalated to human with clear rationale.
- Zero unverified PII, checkout, or prompt-injection actions processed without escalation.
- All substantive_deliverables are normalized to Samsara GTM schema, with no vague placeholders.
- Audit trail is complete for every request, supporting rapid compliance and continuous improvement.

## Next Steps
- Expand agent orchestration to additional GTM workflows and tool integrations.
- Iterate escalation and policy rules based on real operator feedback and audit findings.