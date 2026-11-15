# Figma AI Evaluation Router: Week-1 Rollout Plan

## Goal
Score AI canvas and plugin outputs with a clear rubric before changes ship. Catch bad schemas and prompt traps early.

## Days 1-2: Wire the Check
- Point the router at staging plugin and prompt logs.
- Map Figma fields like layer IDs, selection scope, and user intent into one JSON check.
- Set golden-set pass bars with AI Insights and compare automated scores against human ratings. Fix drift first.

## Days 3-4: Human Review Drills
- Flag missing layer targets or vague prompts right away.
- Route billing, account data, or unclear actions to a human reviewer (`escalate_to_human: true`).
- Run the four sample cases with engineers so everyone sees how bad payloads stop.

## Day 5: Audit & Sign-Off
- Check every held case for a plain reason code.
- Block fake plugin names and prompt-override tricks.
- Track human-vs-judge agreement each Friday. Aim for 95% agreement and zero unflagged leaks.
