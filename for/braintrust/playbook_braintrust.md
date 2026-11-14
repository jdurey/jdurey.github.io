# Braintrust Week-1 Rollout: Golden-Set Anti-Gaming Rubric & JSON Governance Pipeline

## Purpose
This playbook guides Braintrust ops and evaluation leads through deploying, validating, and operationalizing the Day-1 JSON governance and anti-gaming rubric pipeline for agent evaluation and production scoring.

## Day 1-2: Setup & Integration
- Deploy the pipeline as a gated workflow in the Braintrust evaluation platform.
- Integrate with trace ingestion, golden-set dataset, and production scoring endpoints.
- Configure the router_system_prompt for all agent and human-in-the-loop evaluation flows.
- Validate schema field mapping against current agent tool call and output schemas.

## Day 3-4: Human Checkpoint & Escalation SOP
- Train ops leads and reviewers on the unified JSON contract: every output must include action, route_or_tool, schema_valid, policy_flag, escalate_to_human, detected_risks_or_gaps, substantive_deliverable, proposed_steps, customer_or_learner_response, and checkpoint_reason.
- For any case where schema_valid is false, policy_flag is true, or escalate_to_human is true, route to designated human reviewer queue.
- Reviewers must audit flagged cases, confirm or remediate detected gaps, and document final decisions in the audit log.

## Day 5-7: Adoption, Metrics, and Continuous Improvement
- Monitor pipeline adoption: % of agent traces and golden-set evals processed via the JSON contract, % of escalations, and mean time to human resolution.
- Track false negative/positive rates on policy and schema flags using the provided test cases and real production traces.
- Hold daily standups to review flagged outputs, update rubric calibration, and refine escalation rules based on reviewer feedback.
- Document all edge cases and update the playbook weekly.

## Success Metrics
- 100% of production evals and golden-set cases emit valid JSON contract outputs.
- All ambiguous, incomplete, or policy-risk cases are escalated and resolved within 24 hours.
- Reviewer agreement rate >95% on escalated cases within the first week.
