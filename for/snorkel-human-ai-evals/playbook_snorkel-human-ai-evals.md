# Snorkel AI Day-1 Rubric Router Rollout Playbook

## Week-1 Objectives
- Deploy the JSON-governed rubric router as a free work sample for Research Scientist - Human-AI Systems onboarding.
- Ensure all human-AI data and agentic environment submissions are processed through the orchestrated pipeline, not naive chat.
- Establish clear human checkpoint and audit SOPs for ambiguous, policy-risk, or unsupported cases.

## Step-by-Step Rollout
1. **Kickoff & Training (Day 1-2):**
   - Introduce the rubric router to research, data ops, and product teams.
   - Walk through the four pipeline stages and JSON contract keys using real Snorkel AI datasets and workflows.
   - Review the four test cases, highlighting how the router flags missing fields, policy risks, and unsupported integrations.

2. **Integration & Test Harness (Day 2-3):**
   - Integrate the router into the Snorkel AI workflow submission portal and RL environment evaluation endpoints.
   - Run the provided test cases and additional real-world submissions, logging all outputs and audit trails.
   - Confirm that all outputs strictly adhere to the JSON contract, with no freeform or ambiguous responses.

3. **Human Checkpoint SOP (Day 3-4):**
   - Assign a rotating team of human reviewers to handle all cases where escalate_to_human: true or policy_flag: true.
   - Review flagged submissions for missing schema fields, PII, prompt-injection, or unsupported integrations.
   - Document all audit rationales and remediation steps in the Snorkel AI compliance log.

4. **Adoption Metrics & Feedback (Day 5):**
   - Track the percentage of submissions processed without schema drift, policy violations, or reward-gaming.
   - Monitor time-to-human-review and resolution rates for escalated cases.
   - Collect feedback from researchers and data ops on clarity, false positives, and workflow fit.

## Success Criteria
- 100% of submissions emit valid JSON contracts with accurate schema_valid, policy_flag, escalate_to_human, and checkpoint_reason fields.
- All ambiguous, risky, or unsupported cases are held for human review with clear audit trails.
- No golden-set leaks, PII exposures, or unsupported integrations pass through undetected.
- Human reviewers report clear, actionable diagnostics and remediation steps for all escalated cases.
