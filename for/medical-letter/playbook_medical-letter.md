# The Medical Letter: Week-1 Rollout Playbook for Drug-Review SCORM/QTI Compiler

## Objective
Deploy a deterministic, standards-locked pipeline for compiling peer-reviewed drug monographs into SCORM 1.2 and QTI 3.0-compliant MOC post-tests, with robust human checkpointing and audit trails.

## Day 1-2: Setup and Training
- **Install & Configure**: Deploy the compiler kit on a secure Medical Letter workstation or cloud instance. Configure access for editorial and CE operations staff.
- **Team Briefing**: Conduct a 30-minute session with Jean-Marie Pflomm, PharmD, and the CE team to review pipeline stages, JSON contract enforcement, and escalation rules.
- **Sample Run**: Process a recent monograph (e.g., 'Finerenone for CKD') through the pipeline. Highlight how ambiguous dosing triggers human escalation.

## Day 3-4: Human-in-the-Loop Checkpointing
- **Checkpoint SOP**: For any flagged case (missing schema fields, PII/checkout, policy traps, or unsupported integrations), the system halts and notifies the assigned human reviewer.
- **Reviewer Actions**: The reviewer inspects the JSON contract, confirms flagged risks, and either remediates the input or approves the draft for packaging.
- **Audit Logging**: All escalations and reviewer decisions are logged for compliance and continuous improvement.

## Day 5-7: Adoption and Metrics
- **Live Pilot**: Run 2-3 monographs through the full pipeline, tracking rates of human escalation, schema errors, and policy flags.
- **Metrics to Track**:
  - % of cases requiring human review (target: <20% by week 2)
  - Time-to-resolution for escalated cases
  - Zero PII/checkout or answer-leak incidents
  - Reviewer agreement rate on flagged items
- **Feedback Loop**: Hold a debrief with the editorial and CE teams to collect feedback, refine escalation criteria, and update SOPs.

## Ongoing
- **Continuous Monitoring**: Weekly review of flagged cases and audit logs.
- **Policy Updates**: Update compliance and schema rules as ACCME/ACPE standards evolve.
- **User Support**: Provide a dedicated contact for workflow or escalation questions.
