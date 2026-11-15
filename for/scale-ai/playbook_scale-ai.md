## SLPreP Golden-Set Rubric Pipeline  -  Week-1 Rollout Plan for Scale AI

### Objective
Deploy a robust, production-grade evaluation pipeline for Scale Labs Preparedness & Policy (SLPreP) that enforces golden-set/rubric scoring, JSON governance, and human checkpointing for all LLM and agentic safety evaluations.

### Day 1-2: Setup & Baseline
- Integrate the pipeline with Scale AI's evaluation environment (e.g., RL testbeds, agent orchestration logs).
- Configure the Input Normalization & Schema Validation stage to parse all agent/model outputs into the unified JSON contract.
- Import golden-set answers and rubric criteria for BioRiskEval, PropensityBench, and ASPI scenarios.

### Day 3-4: Policy & Compliance Gating
- Enable the Policy Router to automatically flag PII, ambiguous tool arguments, unsupported integrations, and prompt-injection attempts.
- Set up escalation logic: any schema gap, policy risk, or ambiguous state triggers escalate_to_human and blocks downstream automation.
- Document all policy boundaries (PII, restricted tool logs, financial/checkout actions) in the operator SOP.

### Day 5: Human-in-the-Loop & Audit Trail
- Train operators to review escalated cases using the JSON contract audit fields (schema_valid, policy_flag, escalate_to_human, checkpoint_reason).
- Establish a daily review cadence for all escalated or refused cases, with feedback loops to rubric calibration.
- Ensure every deliverable includes a substantive, normalized output or diagnostic, and a clear customer/operator response.

### Adoption Metrics
- Track: (1) % of agent/model outputs with missing/ambiguous fields caught pre-deployment, (2) time-to-human review for escalated cases, (3) reduction in policy or schema violations, (4) reviewer agreement rates on rubric scoring.
- Target: >95% schema compliance, <24h human turnaround, and zero unflagged policy breaches in Week 1.

### SOP Reminders
- Never accept outputs with incomplete, ambiguous, or unverifiable fields.
- Always escalate policy risks, PII, or unsupported integrations.
- Use the JSON contract as the single source of audit truth for every evaluation.