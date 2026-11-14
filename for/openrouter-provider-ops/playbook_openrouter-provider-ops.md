# OpenRouter Week-1 Rollout Plan: LLM Provider Onboarding & Eval Rubric Kit

## Objective
Accelerate safe onboarding of new LLM providers by deploying a golden-set, cross-family, and human-in-loop evaluation pipeline. Ensure every model launch meets OpenRouter's quality, compliance, and operational standards.

## Step-by-Step SOP
1. **Golden-Set Calibration**
   - Curate and update a golden set of 50-100 prompt-response pairs covering legal, medical, code, and OpenRouter-specific scenarios.
   - Run new provider endpoints against this set using automated scripts (Python/TypeScript) and log all outputs.

2. **Cross-Family Judge Agreement**
   - Use at least two established LLMs (e.g., GPT-4, Claude 3) to independently score each output on a 1-5 rubric (accuracy, refusal handling, formatting, compliance).
   - If scores differ by more than 1 point, flag for human checkpoint.

3. **Annotation Rubric & Policy Boundary Check**
   - Apply a detailed rubric: factuality, formatting, refusal, policy compliance, hallucination, and ambiguity.
   - Any output with policy violation, ambiguous refusal, or suspected hallucination is escalated to a designated human reviewer.

4. **Release Readiness & Provider Feedback**
   - Aggregate findings, generate a summary report with actionable feedback for the provider, and document all human-reviewed cases.
   - Only approve provider for production launch after all escalated cases are resolved.

## Human Checkpoint Rules
- Any policy violation, ambiguous refusal, or cross-model judge disagreement triggers mandatory human review.
- Human reviewers must annotate the reason for escalation and final decision in the tracking system.

## Adoption Metrics
- Track time-to-onboard per provider, number of escalations per batch, and rubric pass rates.
- Target: 90% of new provider launches pass golden-set and rubric checks with <10% human escalation after week 2.

## Continuous Improvement
- Update golden set and rubrics monthly based on new edge cases and provider feedback.
- Hold weekly review to discuss escalations and refine SOPs.
