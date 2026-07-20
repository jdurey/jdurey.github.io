---
title: "Red-teaming my own publish gate"
slug: red-teaming-my-publish-gate
date: 2026-06-19
type: red-team
summary: "This site publishes itself unattended, so its clean-room firewall is the only thing between a leak and the open internet. I had two other model families try to break it. They found 14 ways past it in one pass."
status: "Complete · 65 regression tests"
featured: true
queued: false
queueOrder: 3
repo: "https://github.com/jdurey/jdurey.github.io/blob/main/tests/firewall-scan.test.mjs"
repoLabel: "scanner + regression suite"
---

This site publishes itself every night with no human in the loop. A clean-room firewall scans every page first and blocks anything confidential, like an employer name, an internal codename, or a private file path, before it can go live. Since nobody is watching at publish time, that scanner is the only thing standing between a leak and the open internet. So I treated it like what it is. A security control that has to survive an attacker.

## The move

I wrote the scanner, which makes me the worst person to review it. I see what I meant, not what I missed. So I handed it to two other model families and told them to break it. I used a different family from the one that wrote it on purpose, because a same-family reviewer shares the author's blind spots. And I made them prove it empirically. Run the scanner against a crafted input and show me the payload that gets through, not a hunch about one.

## What they found

Fourteen ways past it in a single pass. The ones that stung:

- **Unicode homoglyphs.** Swap one Latin letter in the marker for a Greek or Cyrillic look-alike and the match never fires. The page reads identically to a human.
- **Zero-width characters.** Drop an invisible joiner inside the marker and it splits into two harmless-looking fragments.
- **Encoding.** Write the marker as HTML entities or percent-encoding and the raw scan reads the encoded form, never the decoded one. One payload tucked a confidential email inside a link's href, which my own tag-stripping then deleted before the scan could even see it.
- **Base64.** Encode the marker and the scanner reads gibberish.
- **Leetspeak, full-width digits, spacing and hyphen variants.** Every one of them walked a marker past an exact-match list.

And the other direction, which matters just as much when nobody is watching: false positives that would have quietly bricked the whole thing. The scanner blocked "single source of truth" because an internal filename happened to share those words. It blocked the statistical term for significance. It blocked a common three-letter acronym. Each of those would have stopped a perfectly clean page from ever publishing, and I'd have found out only when the site went stale.

## The fix

A canonicalization layer that runs before any matching. Normalize the unicode, fold the homoglyphs back to Latin, strip the zero-width characters, decode the entities and percent-encoding, strip tags without rejoining a split marker, fold the leetspeak, collapse the spacing. Then match. On top of that, a tuned denylist that can tell an internal filename apart from an ordinary English phrase. And a regression test for every single bypass, so none of them can come back. The suite sits at 65 tests now. Both are public in this site's repo — [the scanner](https://github.com/jdurey/jdurey.github.io/blob/main/scripts/firewall-scan.mjs) and [every regression case](https://github.com/jdurey/jdurey.github.io/blob/main/tests/firewall-scan.test.mjs) — and CI runs the suite on every deploy, so a regression can't publish.

## The honest part

My own review caught none of the fourteen. I'd convinced myself the list was thorough, and it wasn't even close. An independent attacker from a different model family found in one pass what I couldn't see at all. That isn't a knock on reviewing your work. It's the reason the reviewer can't be the author.

This is the same instinct I bring to eval work. A guardrail you've only read is a guess. You instrument it, you point an adversary at it, and you watch it hold.
