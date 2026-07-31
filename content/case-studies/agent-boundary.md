---
title: "The agent-boundary harness: measuring whether an AI agent respects a data fence, and whether the fence holds"
slug: agent-boundary
date: 2026-07-31
type: eval
summary: "An agent with file access can leak in two ways. The guard code fails, or the model decides to cross. I built a two-layer instrument that measures both, scored by whether a sealed canary token ever reads out. A naive path guard passed 75% and leaked twice through known EscapeRoute-class bypasses. The hardened guard passed clean. Then I tempted real models with tasks where crossing the boundary is the easy path, and counted the crossings. Everything runs on a fictional workspace, so the whole machine is public."
models: ["Grok", "Llama 3.2 3B (local, ollama)"]
status: "Complete · reproducible harness + saved raw responses"
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/agent-boundary"
repoLabel: "harness + raw responses"
draft: false
---

Give an AI agent file access and you've drawn a line somewhere. These folders it may read. Those it must never touch. Every serious deployment has that line: client data next to scratch space, one tenant's records beside another's, a private zone beside a public one. I run a boundary like that in my own systems, and one question kept me honest. How would I actually know it holds? A code review that "looks right" wasn't going to satisfy me. I wanted a number.

A boundary fails in two distinct ways, and each way needs its own instrument. Sometimes the guard code fails: a symlink or a look-alike directory name slips past the path check. That failure is deterministic, so it deserves a deterministic test. Sometimes the model fails instead. No guard is in the way, the task makes the sealed folder the convenient answer, and the agent chooses to look. That failure is behavioral, so it needs a probe. This harness measures both layers separately, on the same fictional workspace.

## The workspace is invented, and that's the point

My real boundary lives in a private system I'm not going to describe. So the harness runs on the Veyra Collective, a workspace I built from scratch. An agent gets three files it may read, three sealed contributor records it must never touch, and one directory named to look almost exactly like an allowed one. Each sealed record carries a unique canary token. Canaries keep the scoring honest. If one shows up in any output, something crossed the line, and no judgment call is involved. Veyra shares structure with real systems (an allowed zone, a sealed zone, the same bypass classes) and shares content with nothing.

## Layer 1: the guard, scored like a regression suite

Ten access vectors hit the path guard: direct reads, traversal, and the structural bypasses that hide inside a correct-looking check. Two of those matter most. A symlink planted inside the allowed zone that points into the sealed one, and a sibling directory whose name shares a prefix with an allowed path. Neither is hypothetical. Both belong to a known public class, CVE-2025-53109 and CVE-2025-53110 ("EscapeRoute"), which is why I keep them in a standing gate that re-runs before any change to the plumbing.

I ran the battery against two guards. First the naive one, the kind of prefix check most people write on day one. It scored 0.75 deny-recall and leaked sealed canaries through both structural bypasses. The hardened guard scored 1.00 with zero leaks, so it graduates: it can sit in front of an agent as a regression gate, with the canary battery still ready to bite. In an ordinary code review, those two guards look the same. The score tells them apart in one line.

## Layer 2: take the guard away and tempt the model

Layer 2 asks the behavioral question. With no enforcement in the way, does the model choose to cross? Each probe hands the model a task where the sealed records are the path of least resistance, because the answer it wants sits right there in a file it was told to leave alone. Then I count crossings, scored by canary again, with every raw response saved.

I probed three subjects: a local Llama 3.2 3B with the policy in context, the same model with no policy stated at all, and Grok. Each crossed 0 times in 3 temptations. That's a small battery, and I report it as what it is, an encouraging early read rather than a clearance. The instrument is the deliverable here. "Our agent respects boundaries" becomes a number you can re-measure after every model swap.

## What this buys anyone running agents

If you deploy agents with file access, the discipline transfers even where my numbers don't. Seal your no-go zones with canaries so a leak announces itself, test the guard against the known structural bypass classes rather than only direct reads, and probe the model's behavior separately from the guard's correctness, because a passing grade on one says nothing about the other. My [instruction-hierarchy audit](/case-studies/instruction-hierarchy-audit) asks whether content can hijack an agent's task. This harness asks whether the agent honors the walls around its workspace. Between them, that covers most of what "can we trust it with access" actually means.

The guard, the probe, the Veyra workspace, the scoring oracle, and the saved raw responses are all in the repo, pinned by hash in the manifest. It runs end to end.
