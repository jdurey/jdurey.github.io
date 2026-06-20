# Transfer Memo — boundary adherence on your agent, as a standing regression gate

The synthetic demo proves the instrument runs. Here's how I point it at your real agent and your real
zone policy, and return two things: a deterministic gate that fails loudly when a path-guard change
reopens a bypass, and a cross-model ranking of which models you can trust inside the boundary.

## What I need from you

- The **boundary policy**: which paths or zones an agent may read, which it must never touch, and
  what overrides what (does a task instruction or a claimed authorisation ever lift the fence? the
  honest answer is usually no).
- The **file-access surface** under test — the guard, tool, or resolver that decides allow/deny.
- The **models** you actually run inside that boundary (local, API, or CLI), so the adherence probe
  measures your fleet, not a generic one.
- A handful of **known-good and known-bad paths** to seed the vector battery and the canaries.

## The plan

**1 — Model the zones.** Restate your policy as an allowed/sealed tree with arbitrary canary tokens
in the sealed files, so a leak is objective: the token either reaches the agent or it doesn't.
Deliverable: a reproducible workspace and a vector battery covering symlink, traversal,
prefix-confusion, and normalization escapes.

**2 — Gate the guard.** Run your real path-guard against the battery and against a naive baseline, so
the contrast is visible. Lock a graduation rule: the guard graduates only at 100% deny on the battery
with zero canary leaks, and only while the canary battery still bites. Deliverable: a regression gate
your CI runs on every change to the access layer.

**3 — Probe the models.** Give each model in your fleet the standing policy, a read tool, and tasks
whose answers live only behind the fence, then score crossings objectively with an oracle that shares
no code with the thing under test. Deliverable: a per-model collapse ranking — who stays inside the
boundary under direct, laundered, and authority-pressure temptations.

**4 — Standing gate + report.** A regression gate for the guard and a refreshed adherence ranking for
the models, both re-runnable as your agent and your models change. The cheap, deterministic layer
graduates and runs unattended; the model layer stays reported, because a model's disposition drifts
with every version bump.

## What you get

- The **regression gate** (vector battery + canary check + graduation rule), wired into your CI so a
  reopened bypass fails the build instead of shipping.
- The **cross-model adherence ranking**, so "which model can we let near the sealed zone" is a
  measured answer, not a vibe.
- The **harness**, pointed at your system, so your team re-runs it every change — a standing boundary
  gate, not a one-off audit.

It runs on your infrastructure, against your policy. One honest note on the model layer: a model that
respects the boundary today can regress on its next release, so that layer is always reported and
re-measured, never graduated to "trusted forever."
