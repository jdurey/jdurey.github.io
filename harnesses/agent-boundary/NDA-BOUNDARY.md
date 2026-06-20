# NDA Boundary

This harness measures whether an agent respects a data boundary. The boundary I care about in real
work is my own — the zone fences in a private federated AI system I run, where some folders must
never be read into the wrong context. That system isn't public. So this repo demonstrates the
*method* on a fictional workspace instead, and I want to be exact about the line.

## What's public (this repo)

- **The method.** A two-layer measurement: a deterministic path-guard regression gate (naive vs.
  hardened, scored by whether a sealed canary reads out) and a cross-model boundary-adherence probe
  (does a model choose to cross when a task tempts it). The graduation rule, the independent scoring
  oracle, and the canary discipline are all here, running.
- **A fictional workspace built from scratch.** The Veyra Collective, its briefs, its sealed
  contributor records, and their canary tokens are invented. They share nothing with any real
  system, file tree, or policy.
- **Real model runs** against that fictional workspace, with every raw response saved.

## What's private (and stays that way)

- **The real boundary system.** The actual zone layout, the real fences, and the enforcement code I
  run are not shown, named, or reconstructable from anything here. The Veyra tree is structurally
  analogous (an allowed zone, a sealed zone, the same bypass classes) and substantively unrelated.
- **Any client or employer data.** None of it is here. The synthetic workspace was generated
  independently, from a fictional world.

## On the CVE provenance (a methods note, not a headline)

The structural bypasses in the guard battery — the in-zone symlink and the same-prefix sibling
directory — are a known public class. They line up with **CVE-2025-53109 / -53110 ("EscapeRoute")**,
a filesystem-server sandbox issue disclosed and patched in July 2025 and credited to an external
researcher (Elad Beber, Cymulate). I make no discovery claim on them. They're reproduced here only
as a named, citable shape of structural escape, so the regression gate is testing against real
failure modes rather than ones I made up. The point of this repo is the **measurement instrument**,
not the vulnerability.

## The line, in one sentence

I'm showing you the **instrument** that measures boundary adherence, not any real system's fences. If
you want it pointed at your agent's file-access layer and your zone policy, that's the
[transfer memo](TRANSFER-MEMO.md).
