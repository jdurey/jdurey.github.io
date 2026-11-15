# Cloudflare One Validation Kit: Week-1 Rollout Plan

## Goal
Help Solutions Engineers check Zero Trust, SASE, and MCP server requests fast during customer Proofs of Value. Stop bad configs early.

## Days 1-2: Sandbox Setup
- Load the four-stage router into a Cloudflare One demo workspace.
- Walk SEs through each JSON field so audit logs read the same way across accounts.
- Test the four sample cases. Watch how missing device posture gets caught.

## Days 3-4: Live PoV Checks
- Run two real or mock customer PoV requests per SE, like Tunnel routing or MCP tool permissions.
- Hold any unverified PII, unsupported connector, or policy gap for human review (`escalate_to_human: true`).
- Compare notes in standup. Turn repeat fixes into reusable PoV templates.

## Day 5: Field Sign-Off
- Name one rotating SE each week to clear held edge cases.
- Track PoV turnaround time and false flags. Keep 100% of risky configs behind human sign-off.
