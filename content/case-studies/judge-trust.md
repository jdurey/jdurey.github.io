---
title: "Can you trust the model that grades your content? Measuring when an AI judge waves through broken work"
slug: judge-trust
date: 2026-06-21
type: eval
summary: "Teams now use an LLM to QC the content another LLM wrote. The quiet risk is that the judge passes work that's actually broken, and it gets more lenient when it grades its own output. So I built a fully-automated instrument that measures exactly that. It breaks items in known ways, with no model anywhere near the labels, then asks four different vendors' models to grade them blind. A single judge waved through 5 percent of the items I broke on purpose, and the rate ran higher when a model judged its own work. Making four independent vendors agree before a pass drove the miss rate to zero."
status: "Synthetic, fully-automated proof of concept · runnable harness + saved verdicts · built in a 3-day scope"
draft: false
featured: true
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/judge-trust"
repoLabel: "harness + saved verdicts"
models: ["Claude (Anthropic)", "GPT / Codex (OpenAI)", "Grok (xAI)", "Gemini (Google)"]
---

More and more, the thing checking AI-written content is another AI. You generate a bank of quiz items with one model, then you point a second model at them and ask "is this good enough to ship?" It's fast and cheap, and it runs at a scale no human reviewer can match. The problem is the failure you can't see. When that judge passes an item that's actually broken, nothing flags it. The verdict comes back clean and the dashboard goes green. A defective item ships to a student. So I built an instrument that measures how often that happens, and what it takes to stop it.

This is a companion to my [feedback-integrity harness](/case-studies/feedback-integrity). That one checks the author, the model writing the content. This one checks the checker, the model grading it. One asks whether the work is sound. The other asks whether you can trust the thing that told you it was sound.

## The trap in grading a grader

The hard part isn't running the judge. It's knowing whether the judge was right. To score a judge you need ground truth, a set of items you already know are good or broken. And the lazy way to get that is to ask another model to label them. That's a trap. Now you're validating a judge against labels that a judge produced, and you've measured nothing. The whole result rests on trust you never earned.

So I made one rule and built everything else around it. **No model ever touches the labels.** Ground truth comes from construction, and a model never produces it.

I start with clean items and break them with deterministic code. A function takes a clean question and performs one exact mutation, and the label is true because the operation made it true. To inject an answer-reveal, the code copies the correct option's text into a wrong option's feedback. That item is now broken, and I know it's broken because I'm the one who put the answer there. A matching detector confirms the clean items are actually clean before any of them count. A self-test proves the spine holds. Break an item, and its detector fires. Leave it clean, and the detector stays quiet. That test runs before every experiment. If it fails, nothing else runs.

The defects are the same family of structural flaws that show up in real item banks:

| Defect | What the code does | Why it's broken |
|---|---|---|
| **Answer-reveal** | copies the correct answer's text into a wrong option's feedback | the feedback hands over the key |
| **Ghost-distractor** | overwrites a wrong option with the correct answer's text | two options are now correct |
| **Feedback mismatch** | rotates the per-option feedback off its option | each blurb explains the wrong choice |
| **Length cue** | pads the correct option so it's the longest | a test-wise student picks it on shape |
| **Rubric leak** | concatenates a free-response rubric into the prompt | the prompt hands over the grading points |

## Why the content is invented

Every item lives in a made-up world. The countries are fake. So is the element, and the historical events never happened. That's load-bearing, and it's not decoration. A judge that knows real history can lean on what it already knows instead of reading the item in front of it. With invented content there's nothing to fall back on. The model has to reason about the item's structure, which is the thing I'm actually testing. The fiction is what keeps the measurement honest.

## What a single judge missed

I generated fifty items, broke twenty-five of them, and had four independent vendor families grade every one against the same plain rubric. The judges never saw the labels. They saw what a student would see.

A single judge passed **5 percent** of the items I'd deliberately broken. That's the number that matters, because a false pass is the dangerous error. It's a broken item the tool swore was fine. The rate ran from zero to 8 percent depending on the vendor, and the misses weren't random. The blatant defects got caught by everyone. A duplicated correct option is easy to catch. So is an answer quoted word for word in the wrong place. The subtle ones slipped through. A rubric leaked into a free-response prompt fooled one vendor on 40 percent of cases. A correct option that was merely the longest fooled two of them on a fifth of cases. The judges were good at the obvious and soft on the quiet.

## The judge is easier on its own work

Then I looked at who wrote the item each judge was grading, because all four vendors were also authors. This is the result I went in skeptical of and came out convinced by. A judge grading its own output passed broken items **10 percent** of the time. Grading another vendor's output, the same judges passed only **3 percent**. That's an 8-point swing toward leniency on a model's own work. One vendor waved through a quarter of its own broken items while catching almost everything from its peers.

The samples here are small, single digits per cell. So I read this as a direction, and I'm not claiming statistical significance. But the direction is exactly what you'd worry about. The most common setup in the wild is one vendor's model grading that same vendor's model. That's the diagonal, and the diagonal is where the instrument is softest.

## The fix is independence you can buy

If a model is lenient on its own work, the fix is to not let it grade alone. So I treated the four vendors as a panel and required agreement before a pass. I made it fail-closed. An item passes only if enough independent vendors vote to pass it, and any doubt fails it.

The sweep is the headline. Requiring just **two of the four** vendors to agree drove the false-pass rate to **zero**. It still cleared 96 percent of the genuinely clean items. The leniency doesn't survive contact with a second vendor that was trained by a different company on different data. Independence at the vendor level is the thing doing the work. It's the one kind you can't fake with a cleverer prompt.

The harness ends on a graduation verdict, a plain readiness call per judge and for the panel. It asks whether a setup is sensitive enough to catch the breaks while staying specific enough to leave clean items alone. Every single judge graduated on its own, and so did the two-of-four panel. But the panel got there with no false passes at all. That's the difference between a judge that's usually right and a setup you'd actually trust to run without you.

## What this is, and what it isn't

I want the line drawn clearly, because the honesty is the point. This measures false passes for **structurally defined** defects, where I can manufacture ground truth by construction and keep every model out of the labeling. That's what makes a fully-automated result trustworthy here. It doesn't mean the human golden set is solved in general. On real content, where the defects aren't known by construction, sourcing ground truth is still the open frontier. By-construction labels work precisely because the content is synthetic. I say so in the repo, and I'd say so to anyone who asked.

The whole thing runs from one command and writes a report. The judging needs the four vendor tools. But the verdicts are saved and the scoring is deterministic. So anyone can re-derive the numbers from the saved ballots, with no model access at all. The instrument is real, the content is invented, and the line between them is labeled everywhere.
