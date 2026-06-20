---
title: "Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer"
slug: feedback-integrity
date: 2026-06-20
type: eval
summary: "When an AI writes the wrong-answer feedback for a quiz item, it tends to fail in three quiet ways. It teaches the key instead of the error, it invents a concept that isn't on the screen, or it explains a different option than the one it's attached to. A top-to-bottom read misses all three. So I built a measurement instrument that catches them, with a blind-solver at the center that turns 'is this feedback bad?' into 'can a student exploit it?' Then I gave it a golden set and a graduation test, so the human running it can measure when it's safe to stop checking by hand."
status: "Synthetic demo of a method used on a real K-8 curriculum program under NDA · runnable harness + saved raw responses"
draft: false
featured: true
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/feedback-integrity"
repoLabel: "harness + raw responses"
models: ["Llama 3.2 3B (local, ollama)"]
---

When you put an AI in charge of writing the feedback a student sees after they miss a question, you've created a grader that grades against its own explanation. And the failures don't look like failures. The grade comes back, the feedback reads fine, and the human reviewing it has no signal that anything went wrong. So I went looking for the cases where the feedback quietly betrays the item, and I built the thing that measures how often it happens.

I can't show you the program that made me build this. It's a real K-8 social studies curriculum, a large bank of AI-authored items, and it's under NDA. So I rebuilt the instrument around items I wrote from scratch, and everything below runs on those. You get the method and the machine. The client keeps the bank.

## Three ways AI feedback fails

The feedback that matters is the wrong-answer feedback. A student picks a distractor, gets it wrong, and the explanation is supposed to teach them out of *that specific mistake*. That's the job. Here are the three ways an AI author misses it, with synthetic items I made up to show each one.

**Answer-reveal (ARF).** The feedback for a wrong option teaches the key instead of the error. Take an item asking why early farming communities settled near rivers, where the correct answer is that rivers gave them water for crops and a way to travel. A student picks "mountains" and gets back: *"Not quite. Early communities settled near rivers because they needed water for crops and a way to travel."* That feedback just handed over the answer. If a retry is live, the student now passes without learning anything, and their mastery score is a lie. The clean version teaches against the chosen error: *"Mountains were steep and hard to farm, so early communities looked for flatter, wetter ground."*

**Ghost-distractor (GDF).** The feedback names a concept that appears in no option and isn't in the question. An item about the job of a town crier has a wrong option, and its feedback says *"Remember, the blacksmith shaped metal tools."* There's no blacksmith anywhere on the screen. The student reads a correction about something they were never asked. It teaches nothing because it answers a question that isn't there.

**Feedback-option mismatch (FOM).** The feedback is attached to one option but explains a different one. A student picks "they traded furs," and the feedback explains why growing tobacco was the wrong choice. The most extreme version is feedback that's byte-for-byte identical to the option text, which is a data defect, not a teaching one. Either way, the student gets a correction that doesn't match what they actually did.

None of these are exotic. They're the ordinary failure modes of asking a model to write four explanations at once and trusting that each one lands on its own option.

## Why a normal read misses them

All three of these live *horizontally*, and that's what made this worth building. You only catch them by reading across one item's options and feedback at once. You hold the key in your head while you check each distractor's explanation against the option it's tied to. A reviewer reading top to bottom, one cell after another, structurally cannot see them. The feedback reads fine on its own. It only breaks in relation to the rest of the row.

I learned this the hard way. The first automated pass I pointed at the bank was a straight read of each feedback cell, and it came back with zero answer-reveals. It found none at all, on a bank where I could find them by hand. That clean zero is the most dangerous output a QC tool can produce. It reads as "all good" when it really means "I wasn't looking at the right scale." So the whole instrument is built around not trusting that zero.

## The blind-solver

The hard question is "is this feedback bad?" That's a judgment call, and judgment calls don't run at volume and they don't audit. So I converted it into a question with an objective answer: *can a student exploit it?*

The blind-solver does exactly that. For each item, I hide the key, strip out the stem, and hand a model nothing but the three wrong options' feedback. Then I ask it to name the correct answer. If it can, the feedback leaked. On the rivers item, the solver reads *"they needed water for crops and a way to travel."* It names the river option right away, with no stem and no key in front of it. That's not my opinion that the feedback is bad. That's a measurement that a student with the same feedback could pass without knowing the material.

The same idea has a sibling. There's a test-wise giveaway where the longest option is always the key. That tell has an exact signature, so the deterministic screen catches it by measuring the option lengths, with no model in the loop at all. I tried a model-based version too. I handed a solver only the lengths and asked which was correct. On a small local model it sat at chance, reading position more than shape. The lesson held. A structural cue belongs to the exact rule, and the model earns its keep on the semantic leak that no rule can see.

The blind-solver runs on a cheap local model in bulk, so testing the whole bank costs almost nothing. It writes its guesses to disk, and a script scores them against the real keys. I only ever read the summary, never the raw output. That's the cost discipline that lets this run across every grade instead of a sample.

## The pipeline, cheapest rung first

The blind-solver is the center, but it sits inside a pipeline that spends the expensive model only where it has to.

1. **Deterministic screen.** A plain script flags the obvious tells: feedback that's identical to its option, a key that's always the longest, distractor feedback that reuses the key's distinctive words. This costs nothing and it's exact. But every flag it produces is a candidate, not a verdict.
2. **Blind-solver.** The exploitability test above. This is what catches the horizontal failures the screen and a naive read both miss.
3. **Semantic pass.** A cheap model reviews the candidates and proposes a class and a verbatim quote as evidence for each. Cheap models propose. They never adjudicate.
4. **Adjudication.** A strong model, or a human, makes the actual call on every candidate, citing the specific phrase and the key language it echoes. "It sounds like the key" is not evidence. The exact shared words are.

The ordering is the point. The free rungs do the filtering, the cheap rung does the bulk reasoning, and the expensive judgment only ever sees a short list. One thing I learned calibrating it, and I'll say it plainly: a cheap model's call is a candidate, never a verdict, in either direction. In the public harness I scored the cheap pass against the golden set and it agreed only about a fifth of the time. The small local model I gave it didn't discriminate at all. It collapsed onto a single label and flagged every clean item as broken. On the real bank the failure ran the other way, toward quietly waving bad items through as fine. The direction varies. The rule doesn't. I never take its "this one's clean" as a clean bill of health, and I never take its "this one's broken" as a finding. It only shortens the list that a human or a strong model then adjudicates. When a generator and a grader share the same blind spot, the pipeline fails quietly. That's why the adjudicator has to see the failures the author can't.

## Measuring when to stop checking by hand

A first-pass tool that runs forever isn't automation. It's permanent supervision with extra steps. The goal was always to move the human from *in* the loop, hand-checking everything, to *on* the loop, auditing samples. So the instrument scores itself.

Every run scores itself against a golden set of human-verified findings, and it reports four things per defect class. First is recall, which asks whether it caught the findings it should have. Then a noise tripwire, which fires when the tool flags far more than the golden count. A canary check confirms it caught the known-broken items I plant to test it. And the last output is the one that matters, a plain verdict on whether that class is ready to run without a human. Graduation is per class, not an average. An easy class catching everything can't be allowed to hide a class that collapsed. So answer-reveal can graduate to unsupervised while option-mismatch is still under review, and the human keeps checking only the class that hasn't earned its trust yet.

That's the design I'm proudest of. The human-verify step exists to make itself unnecessary. And the deepest version of it isn't detection at all. It's feeding every confirmed failure back into the authoring prompt, so the next grade's bank is written without the defect in the first place. The cheapest bug to catch is the one that never gets written.

## What the harness measures, on synthetic items

The whole method ships as a small harness you can run. One choice inside it is worth explaining. The examples above use familiar topics, rivers and town criers and tea in a harbor, because a leak is easy to see when you already know the answer. The runnable harness does the opposite. Its items live in an invented world, made-up peoples and places I wrote from scratch. That is not decoration. The blind-solver tries to name an item's answer from its wrong-answer feedback alone. If the items used real facts, a model would answer from what it already knows instead of from the leak. With invented content the only way to recover an arbitrary answer is if the feedback gave it away. The fiction is what makes the measurement honest.

One run scores the pipeline against a golden set of human-verified findings and reports a verdict for each class.

| Defect class | Result on the synthetic bank | Verdict |
|---|---|---|
| Answer-reveal | every planted leak caught, recall 1.0 | ready to run unsupervised |
| Length cue | caught | ready to run unsupervised |
| Ghost-distractor | no exact rule catches it | held for a human |
| Feedback-option mismatch | only the byte-identical case caught | held for a human |

The answer-reveal row is the one I care about. The deterministic screen caught the two leaks that reused the key's exact words, and it read clean on the one that leaked the same answer in different words. The blind-solver caught that one. That is the argument for the rung in a single result. The free exact pass finds the obvious leaks and goes quiet on the paraphrase, and the exploitability test catches what the clean read missed.

The other two rows stay held for a human on purpose. No exact rule catches a ghost concept or a subtle mismatch. The cheap semantic pass was supposed to. It's the same one that collapsed onto a single label and flagged every clean item as broken. So the instrument doesn't pretend. It graduates the two classes it can prove and keeps a person on the two it can't. That is the whole reason to score per class instead of reporting one number. An average would have buried it.

The harness lives in the [companion repo](https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/feedback-integrity), with the synthetic items, the golden set, and every raw model response saved next to it. Every number here recomputes.

## Honest limits

- **The numbers from the real bank stay under NDA.** What's public is the method, the synthetic items, and the machine. I won't quote the real catch rates or counts, because those belong to the program.
- **The blind-solver measures exploitability, not intent.** It tells you a student *could* pass on the feedback alone. It doesn't tell you a student *did*. That's the right thing to measure for an integrity gate, but I won't dress it up as a usage statistic.
- **The cheap rungs produce candidates, full stop.** Every verdict in a graduated class is still backed by the golden set and the canaries. If those drift out of date, the graduation claim drifts with them, and the honest move is to re-score before trusting the verdict again.
- **The public demo's cheap rung is deliberately weak.** It runs a 3B local model, and in the run above that model collapsed onto one label and false-flagged every clean item. That's the point. The instrument is built so the cheap pass can fail that badly and the graduation verdict still holds. The verdict leans on the trusted exact rungs and the blind-solver, never on the cheap model's say-so. On a real bank the cheap rung is a stronger small model, and even then it only proposes.
- **A clean run is a claim that has to survive its own zero.** The whole reason this exists is that a confident zero was wrong once. So a zero from this instrument means "the golden set says zero and the canaries were caught," not "nothing's there."

The point was never that AI writes bad feedback. Sometimes it writes good feedback. The point is that "good" and "bad" here can be measured, and you can build the rig that produces the number. It comes with a golden set, a canary battery, and a per-class verdict on whether it's earned the right to run without you. It runs on your bank, against your standard, and it tells you the one thing a reviewer reading top to bottom never can. The feedback that looks fine is the feedback most worth checking.
