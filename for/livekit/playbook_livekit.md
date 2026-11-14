# LiveKit Technical Enablement Engineer: Week-1 Rollout Playbook

## Objective
Rapidly deploy a hands-on, JSON-governed enablement workflow for onboarding and certifying AEs, SDRs, and presales teams, ensuring every technical scenario is governed, scored, and checkpointed with LiveKit-specific schema and policy logic.

## Day 1-2: Setup & Baseline Audit
- Review current sales and presales demo scripts, onboarding materials, and technical Q&A logs.
- Identify top 5 recurring technical gaps or ambiguous requests (e.g., missing media type, compliance flags, unsupported integrations).
- Deploy the JSON workflow kit in a sandboxed Slack or Notion channel for controlled pilot.

## Day 3-4: Hands-On Lab Launch
- Run a live onboarding session using the four curated test cases. Each participant submits a real-world scenario through the workflow agent.
- Require all outputs to conform to the unified JSON contract, with explicit schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.
- Human facilitator reviews all escalated or flagged cases, providing rapid feedback and remediation steps.

## Day 5: Governance & Adoption Metrics
- Track adoption: % of onboarding flows using the JSON kit, number of escalations, and time-to-resolution.
- Measure ramp time: average time from first scenario submission to demo-ready certification.
- Audit for false negatives: review any scenario where naive chatbots failed to flag ambiguous, policy, or unsupported requests.

## SOPs & Human Checkpoint Rules
- Any scenario with missing, null, or ambiguous schema fields, PII/checkout actions, or unsupported integrations must be escalated to a human checkpoint before proceeding.
- All policy violations (e.g., prompt-injection, reward-hacking, unauthorized data access) must trigger action: 'REFUSE_POLICY_VIOLATION' and be logged for compliance review.
- Weekly review of all escalated cases to update training materials and refine rubric criteria.

## Success Metrics
- 100% of onboarding scenarios processed through the JSON workflow kit.
- <24h average time to resolve escalated cases.
- Zero policy or compliance breaches in demo or onboarding flows.
- Documented reduction in ramp time and increased seller confidence, measured via post-onboarding survey.
