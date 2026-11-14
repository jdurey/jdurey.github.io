# Decagon Week-1 Rollout Plan for AOP Enablement & Policy-Checkpoint Verification

## Objective
Enable CX managers and AI Enablement Leads to author, verify, and deploy clear, compliant Agent Operating Procedures (AOPs) with deterministic human checkpoints and policy-guard enforcement from Day 1.

## Step 1: Training & Onboarding
- Conduct a 2-hour hands-on workshop with CX managers demonstrating the AOP authoring interface and common ambiguity pitfalls.
- Introduce the verification kit pipeline and explain the JSON contract outputs.
- Share examples of flagged ambiguous refund rules and PII policy violations.

## Step 2: Pilot Deployment
- Select 3 active CX teams to pilot the enablement kit on live AOPs.
- Require all AOP submissions to pass through the pipeline before deployment.
- Assign designated human checkpoint reviewers (CX leads or compliance officers) to handle escalations.

## Step 3: Human Checkpoint Workflow
- Review flagged cases daily using the structured remediation steps and checkpoint rationale.
- Approve, correct, or reject ambiguous or policy-flagged AOPs.
- Document decisions and update SOPs based on recurring issues.

## Step 4: Metrics & Adoption Tracking
- Track number of escalations, time to resolution, and failure-to-rule corrections prevented.
- Measure reduction in ambiguous or non-compliant AOPs over 4 weeks.
- Collect qualitative feedback from CX managers on clarity and confidence in AOPs.

## Step 5: Continuous Improvement
- Iterate on rubric criteria and policy rules based on pilot learnings.
- Expand rollout to all CX teams after 30 days with updated training.
- Integrate telemetry gates and Watchtower monitoring for ongoing quality assurance.

## Human Checkpoint Rules
- Escalate any AOP with missing or ambiguous refund/policy checkpoints.
- Escalate all cases involving external PII, checkout actions, or unsupported integrations.
- Refuse and escalate all detected prompt-injection or policy-bypass attempts.

## Adoption Metrics
- Target >90% schema_valid AOP submissions by Week 4.
- Reduce failure-to-rule corrections by 75% within first month.
- Achieve >85% human checkpoint resolution within 24 hours.

This rollout plan ensures Decagon’s CX teams author precise, compliant AOPs with robust human and policy guardrails, eliminating Day-30 bottlenecks and enabling scalable AI concierge excellence.
