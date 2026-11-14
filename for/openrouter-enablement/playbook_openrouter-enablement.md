# OpenRouter Community Ops Kit: Week-1 Rollout Playbook

## Overview
This playbook enables the Community Lead to automate Discord event intake, FAQ surfacing, and moderator onboarding, while enforcing OpenRouter's policy boundaries and human checkpoints. The kit is designed for immediate deployment, reducing repetitive manual work and scaling community engagement safely.

## Day 1-2: Setup
- Deploy the Discord bot with intake hooks for event proposals, support requests, and FAQ questions.
- Connect the bot to OpenRouter's LLM API (Claude, GPT-4, Mixtral) for triage and FAQ matching.
- Import existing FAQ entries and event templates into the system.

## Day 3-4: Policy Gate Configuration
- Define sensitive actions: mod role assignment, API credit giveaways, user data access, and refund/credit requests.
- Configure rule-based policy engine to flag these for human checkpoint (Community Lead or designated mod).
- Test with sample inputs to ensure correct escalation and logging.

## Day 5: Mod Team Onboarding
- Use the automated intake to recruit and onboard new moderators.
- Assign non-monetary recognition roles (e.g., 'Bug Hunter', 'Community Helper') via bot, with approvals routed through the policy gate.
- Hold a live onboarding session to walk through SOPs and escalation rules.

## Day 6-7: Community Event & FAQ Automation
- Launch a Discord event using the intake pipeline, ensuring API credit or sponsor requests are flagged for review.
- Monitor FAQ surfacing: verify that typo-laden or ambiguous questions are correctly matched or escalated.
- Log all actions and review with the mod team for continuous improvement.

## Human Checkpoint Rules
- Any request for mod roles, user data, refunds, or API credits must be flagged for manual review.
- Ambiguous or policy-violating inputs are never processed automatically.
- All escalations are logged for audit and training.

## Adoption Metrics
- Time saved per week by automating FAQ and event intake.
- Number of escalations correctly flagged vs. missed.
- Mod onboarding throughput and engagement.
- Community satisfaction (via Discord poll or feedback thread).

This kit ensures OpenRouter's community scales with trust, safety, and operational excellence from day one.