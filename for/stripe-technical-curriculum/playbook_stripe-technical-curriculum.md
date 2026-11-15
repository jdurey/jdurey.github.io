# Stripe Curriculum & Assessment AI Router: Week-1 Rollout Playbook

## Objective
Deploy a robust, standards-locked JSON router to govern all technical curriculum and assessment workflows for Stripe’s enablement team, ensuring schema validity, policy compliance, and human checkpointing for ambiguous or risky cases.

## Day 1-2: System Onboarding
- Review the router system prompt and JSON contract with curriculum leads and assessment designers.
- Integrate the router into the stripe.training content authoring pipeline as a pre-publish gate.
- Conduct a live walkthrough using the four provided test cases, demonstrating both naive and orchestrated agent outcomes.

## Day 3-4: Human Checkpoint Calibration
- Assign a rotating human reviewer (enablement lead or compliance officer) to handle all escalated cases flagged by the router (policy_flag or escalate_to_human true).
- Establish a Slack or ticketing channel for rapid human-in-the-loop escalation and feedback.
- Document all ambiguous, policy, or schema-invalid cases for continuous rubric refinement.

## Day 5: Adoption Metrics & Continuous Improvement
- Track: (1) % of curriculum/assessment items passing router checks on first submission, (2) mean time to human resolution for escalated cases, (3) frequency and type of detected risks or gaps (e.g., PII, unsupported integrations, ambiguous schema).
- Hold a daily 15-minute standup to review escalations, false positives, and rubric drift.
- Update router prompt and rubric criteria weekly based on real-world edge cases and Stripe product changes.

## Ongoing SOP
- All new curriculum and assessment items must pass the router before publication.
- Any flagged policy, PII, or ambiguous schema case requires explicit human signoff.
- Maintain an audit log of all router outputs and human interventions for compliance and continuous improvement.
- Use adoption metrics to drive targeted training for content authors and reviewers, ensuring high-quality, standards-locked enablement content.