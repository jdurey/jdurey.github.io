# CDEWorld SCORM/QTI Assessment Router: Week-1 Rollout Playbook

## Objective
Deploy and operationalize the CDEWorld SCORM 1.2 & QTI 3.0 Assessment Router to ensure all self-study dental CE items meet AGD PACE & ADA CERP standards, block policy risks, and streamline human review for ambiguous or compliance-boundary cases.

## Day 1-2: Onboarding & Access
- Grant access to the assessment router interface for curriculum leads, compliance officers, and item authors.
- Provide a 30-minute walkthrough of the JSON contract, schema fields, and escalation logic using real CDEWorld course examples (e.g., DEA Opioid, Infection Control modules).
- Distribute quick-reference guides highlighting policy_flag, escalate_to_human, and audit rationale fields.

## Day 3-4: Live Item Submission & Review
- Authors submit 5-10 new or legacy CE items (MCQs, case vignettes) via the router.
- The agent normalizes content, applies distractor diagnostics, and runs policy/compliance checks.
- All flagged or ambiguous cases are routed to the human checkpoint queue, with audit rationale and detected risks.
- SMEs review escalated cases, accept or remediate, and log outcomes in the audit trail.

## Day 5-7: Policy Trap & Edge Case Drills
- Run simulated edge cases: prompt-injection, reward-hack attempts, unsupported integrations, and jurisdictional mismatches using anonymized real-world CDEWorld scenarios.
- Confirm the router blocks or escalates all policy violations and schema edge cases.
- Review audit logs to ensure every escalation includes a substantive deliverable and checkpoint_reason.

## Adoption Metrics & SOPs
- Track: (1) % of items normalized without human escalation, (2) average human review turnaround, (3) number of policy violations caught, (4) reviewer agreement rate on escalated cases.
- SOP: All financial/PII actions, ambiguous schema fields, and unsupported integrations must be escalated. No item goes live without passing the router or explicit human signoff.
- Weekly standup: Review flagged cases, update policy rules, and share lessons learned to continuously harden the workflow.
