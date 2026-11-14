## Datadog AI Account LLM Evaluation & Reward Rubric Pipeline: Week-1 Rollout Plan

### Objective
Deploy a robust, auditable LLM evaluation pipeline for Datadog AI Account workflows, ensuring every workflow request is normalized, scored, and governed by production-grade JSON contracts. This prevents schema drift, policy violations, and reward-gaming in high-value AI customer engagements.

### Day 1-2: Onboarding & System Setup
- Review the JSON contract specification and pipeline stages with all Regional Managers and Senior Sales Engineers.
- Integrate the router_system_prompt into Datadog's internal LLM workflow orchestration tool (e.g., via API gateway or workflow engine).
- Configure access controls so only authorized SEs and managers can review escalated cases.

### Day 3-4: Golden-Set Calibration & Human Checkpoint Training
- Run the provided four test cases through the pipeline, comparing outputs to expected rubric-aligned JSON contracts.
- Train SEs to recognize ambiguous schema fields, unsupported integrations, and policy-flag triggers.
- Establish a Slack or PagerDuty channel for real-time human checkpoint escalations.

### Day 5: Live Shadow Mode & Metrics Baseline
- Enable the pipeline in shadow mode for live AI account workflow traffic, logging all outputs and escalations.
- Track key adoption metrics: percent of requests with schema_valid: false, policy_flag: true, and human escalations; reviewer agreement rates; and time-to-remediation for flagged cases.
- Hold a daily standup to review flagged outputs, audit rationales, and remediation steps.

### Week 1 Success Criteria
- 100% of workflow requests are processed via the JSON contract pipeline, with zero freeform or ungoverned outputs.
- All ambiguous, policy, or unsupported cases are escalated with clear audit trails.
- Regional Managers and SEs demonstrate proficiency in both interpreting JSON outputs and remediating flagged cases.
- Adoption metrics are reviewed and shared with Sales Engineering leadership to drive continuous improvement.

### Ongoing
- Iterate on rubric criteria and escalation rules based on real-world feedback.
- Expand the golden-set with new edge cases from live customer engagements.
- Monitor for reward-gaming, schema drift, and compliance risks, updating the pipeline as Datadog's AI product surface evolves.