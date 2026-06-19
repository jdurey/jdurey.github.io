---
title: "Author with one model, attack with another"
slug: author-one-model-attack-another
date: 2026-06-19
type: method
summary: "A rule I follow on any code where a quiet failure is expensive: don't trust your own review, and don't trust a same-family review either. One model writes it, a different family tries to break it, empirically."
status: "Standing practice"
featured: true
queued: true
queueOrder: 4
---

Here's a rule I follow on any code where being wrong is expensive. A detector, a parser, an auth check, a firewall, anything where a quiet failure costs you something real. I don't trust my own review of it. And I don't trust a review from the same model that wrote it either, because a same-family reviewer shares the author's blind spots. It reads what the author meant.

So I split the two jobs across model families. One writes the code. A different family tries to break it. And breaking it means empirically, not on paper. Run the thing against crafted inputs and show the failing case, not a guess about where one might be.

## The cost math drives it

For a clean-room publish gate, a false negative, which is a leak that gets through, is catastrophic. A false positive, a clean page wrongly blocked, is just annoying. So I tell the attacker to bias toward breaking, and I say the asymmetry out loud. Default to "this leaks" when you're unsure. That framing surfaces far more real holes than a neutral "review this for issues" ever does.

## Every break becomes a test

When a confirmed bypass comes back, I write a regression test for it before I fix it. So the bug can't return, and over time the suite turns into a map of every way the thing has ever failed. When I hardened my own publish gate this way, two other model families found fourteen bypasses I hadn't seen, and each one is a test now. The [full writeup is here](/work/red-teaming-my-publish-gate/).

## The honest limit

This costs more than a single pass. You're running several models and integrating what they find. So I don't do it for every commit. I save it for the precision-critical pieces, the ones where a single silent failure is the expensive kind. For everything else, an ordinary review is fine.

It comes down to the same thing eval work always comes down to. Don't believe the safe path exists just because you wrote it. Make something try to break it, and watch what happens.
