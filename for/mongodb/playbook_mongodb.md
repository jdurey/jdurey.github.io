# MongoDB Partner API Router: Week-1 Rollout Plan

## Goal
Standardize Partner API onboarding for human devs and coding agents. Catch schema gaps early.

## Days 1-2: Contract Check
- Connect the intake router to sandbox Partner API requests.
- Check required fields like tenant scope, OAuth roles, billing tier, and Atlas cluster bounds.
- Test how coding agents parse error messages. Retries must stay safe.

## Days 3-4: Design-Partner Runs
- Replay four design-partner payloads, including dirty JSON and over-broad token scopes.
- Route billing overrides, cross-tenant writes, or missing scopes to a human checkpoint.
- Review held requests with IAM, Billing, and Docs.

## Day 5: Ecosystem Metrics
- Measure time to first working Atlas integration.
- Track agent pass rates and schema error drops. Fold fixes straight into Partner API docs.
