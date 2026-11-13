# Langfuse Agentic Workflow & Eval Gate Rollout Playbook (Week 1)

## Objective
Rapidly deploy and validate the Multi-LLM Eval DAG for cross-family judge calibration, loop-guard gating, and human escalation in production agent workflows. Target: Zero silent policy violations, deterministic traceability, and measurable reduction in agent-induced incidents.

## Day 1-2: Setup & Integration
- Deploy Langfuse SDK and AI Gateway in staging, instrumenting all agent endpoints (RAG, workflow, coding) for trace capture.
- Configure Input Normalization and Pre-Gate Policy Scan (Stage 1) with regex and semantic rules for PII, financial, and healthcare domains.
- Connect primary agent LLMs (OpenAI GPT-4, Anthropic Claude) and secondary judge LLMs (Gemini 1.5 Pro, GPT-4 Turbo) via Langfuse Gateway.

## Day 3-4: Policy & Schema Calibration
- Define and encode JSON schema requirements for each agent use case (e.g., financial tables, clinical summaries, support actions).
- Run golden-set test cases (see above) through the pipeline, validating cross-family judge agreement and loop-guard triggers.
- Simulate prompt injection and ambiguous requests to verify escalation logic and human checkpoint routing.

## Day 5: Human-in-the-Loop Enablement
- Onboard designated reviewers to the Langfuse Human-in-the-Loop Dashboard.
- Train reviewers on trace context, escalation criteria, and audit logging procedures.
- Set up automated alerts for all "escalate" or "block" decisions, ensuring SLA-compliant human response.

## Adoption Metrics & Continuous Improvement
- Track: (1) % of agent outputs passing both primary and judge LLM gates, (2) mean time to human resolution for escalations, (3) number of policy violations or schema mismatches detected pre- vs. post-DAG deployment.
- Hold daily standups to review flagged cases, update policy rules, and tune escalation thresholds.
- End of week: Present dashboard metrics and incident logs to Langfuse product and customer teams for feedback and next-step planning.