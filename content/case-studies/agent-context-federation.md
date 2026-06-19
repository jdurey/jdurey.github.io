---
queued: true
queueOrder: 1
title: "An operating system for my AI agents"
slug: agent-context-federation
date: 2026-06-13
type: systems
summary: "A canonical router, a confidentiality firewall, and a cross-agent message bus, so every AI tool I use shares one context layer. No merging, no API keys."
models: ["Claude", "Codex", "Gemini", "Grok"]
status: "In daily use"
featured: true
---

Every AI tool I used had amnesia about everything the others knew. A new chat meant re-explaining who I am, what I'm working on, and which folders are off-limits. Different assistants, like Claude, a code CLI, and a couple of others, each ran as a stranger, blind to the context the rest of them had. So I built a thin operating layer that sits over my existing files and hands every agent the same map, the same rules, and a way to talk to each other.

The constraint I held the whole time was simple. Point, don't merge. Nothing gets reorganized or copied into a new system, because the layer is a router over folders that already exist. That keeps it reversible, and it keeps me from turning a navigation problem into a migration project.

## The pieces

**A canonical router.** One file is the single source of truth for what lives where and how to retrieve it. Every agent enters through a tiny adapter that points at the router, so the routing logic lives in exactly one place instead of drifting across a dozen config files. The indexes are generated, not hand-maintained, so the map can't quietly go stale.

**A confidentiality firewall.** Some zones hold sensitive material that can't leak into general-purpose or outward-facing work. The firewall is an anti-contamination boundary. It governs where data is allowed to land, not which model gets to run. Any artifact that would cross a zone boundary passes the firewall check first, and that includes caches and inter-agent messages. When a write is ambiguous, the rule is to stop and ask instead of guess. This very portfolio is built behind a hard clean-room gate that scans every page before it can publish, which is the same principle on a different surface.

**A cross-agent message bus.** Different model families have genuinely different strengths. One is the better structural analyst, one's the sharper contrarian, one's the stronger empirical builder. So the bus lets them hand work to each other through plain files on disk, with a strict contract for what a task and a result look like. No shared API keys, no vendor lock-in. Each agent reads its inbox, does the work in its own runtime, and writes back a result the others can consume.

**Deterministic work stays out of the model.** Renames, moves, index assembly, link checks, lint, anything mechanical, runs as scripts and never as in-context string surgery. Tokens are for judgment. And that one rule cut both cost and error rate sharply.

## Why I treat this as eval-adjacent

Running the same task across several model families and watching where they diverge is, honestly, a continuous informal eval. The bus made me precise about which model to trust for which kind of work, because I could see the same problem handled four ways and compare. And the firewall taught me to design controls whose default is to fail closed. Both instincts are exactly what an evaluation or model-safety function runs on, and this system is where I built them.

The whole thing is boring on purpose, because the best orchestration is the least orchestration that works.
