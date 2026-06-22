---
title: "Same answer, different grade: measuring when an AI grader can't hold a verdict"
slug: verdict-integrity
date: 2026-06-22
type: eval
summary: "Most teams treat an AI grader like a function: same answer in, same grade out. I built a tiny instrument that checks, by submitting one fixed answer to a grader many times and counting how often the verdict flips. On a fictional item, a correct answer whose service was even on the accepted-examples list got graded pass 19 times and fail 11 on byte-identical input. The obvious-right and obvious-wrong controls stayed flat the whole time. An answer that named no service at all passed almost half the time. Single-shot QC can't see this, because the instability only shows up when you repeat the call."
status: "Synthetic demo of a method from real AI-grading QC under NDA · runnable harness + saved verdicts"
draft: false
queued: true
queueOrder: 5
featured: true
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/verdict-integrity"
repoLabel: "harness + saved verdicts"
models: ["Llama 3.2 3B (local, ollama)"]
---

Most teams treat an AI grader like a function. The same answer goes in, the same grade comes out. That assumption does a lot of quiet work, and it's wrong often enough to matter. An LLM grader is a sample from a distribution, not a fixed verdict. Submit the same answer twice and you can get a pass the first time and a fail the second. The student did nothing different. The grader just drew a different sample. So I built a small instrument that measures how often that happens, and the result on a single fictional item was worse than I expected.

This is one piece in a series on whether you can trust an AI grader. My [feedback-integrity harness](/case-studies/feedback-integrity) checks the author, the model that writes the content. [Judge-trust](/case-studies/judge-trust) checks the checker for bias, how often it waves genuinely broken work through. [Grading against nothing](/case-studies/grading-against-nothing) checks the harness, the code that assembles the prompt. This one checks the checker for something more basic. Before you ask whether a grader is fair or accurate, you have to ask whether it's stable. A verdict that changes on identical input was never a measurement in the first place.

## The method is almost too simple

Hold the input fixed. Repeat the call. Count how often the verdict flips. That's the whole instrument.

It works because single-shot QC is structurally blind to this failure. You run the grader once, read one verdict, and it looks fine. The instability only shows up when you submit the same thing again, which is the one thing a one-shot review never does. A grader can be 60 percent likely to pass a given answer, and you'd never know, because you only ever saw one roll of the die.

## Why the item is invented

The whole thing runs on a made-up country. Vendari has three tiers of government, a Hearth, a Province, and a Crown, and the question asks a student to name a tier and a service it provides. None of it is real, and that's deliberate. A grader that knows real civics can lean on what it already knows instead of reading the rubric in front of it. With an invented world there's nothing to recall, so the only thing the grader can do is apply the criteria. That's the behavior I want to measure. It's the same discipline the other harnesses in this family use.

## No model ever labels the answers

I wrote the items, so I know which answers a sound grader has to pass. A correct answer names a real tier and a plausible service for it. Those labels come from construction, and no model produces them. The scorer compares the grader's verdicts to my labels, and the scoring stage has no model in it at all. That matters here for the same reason it matters in judge-trust. The moment you let a model decide what the right answer is, you're grading a judge against a judge, and you've measured nothing.

## What one fictional item showed

I ran a local model as the grader, the same Llama 3.2 3B the rest of this family uses as its reproducible baseline. I submitted five answers, thirty times each, byte for byte identical on every repeat.

| Answer | Valid by rubric | Pass | Fail | Pass-rate | Flipped on identical input |
|---|---|---|---|---|---|
| obvious-correct (a verbatim accepted example) | yes | 30 | 0 | 100% | no |
| off-task gibberish | no | 0 | 30 | 0% | no |
| "The Crown mints the realm's coin" | yes | 19 | 11 | 63% | yes |
| "The Hearth keeps the wells" | yes | 20 | 10 | 67% | yes |
| "I would choose the Crown" | no | 13 | 17 | 43% | yes |

The two controls behave. The obvious-correct answer passed all thirty times. The off-task gibberish failed all thirty. So the grader can tell a right answer from nonsense, which means the rest of the table is signal and not a broken setup.

Then comes the part that matters. I submitted "The Crown mints the realm's coin" thirty times. It's a correct answer. Minting the coin is a Crown service, and it's written into the accepted examples. The grader passed it nineteen times and failed it eleven. Nothing about the input changed, and the verdict still went both ways. A correct student would pass or fail on this item depending on nothing but which sample the model happened to draw. A second valid answer flipped the same way, twenty to ten. This is not one unlucky phrasing. The grader cannot hold a verdict.

## The accept-list is not the fix

There's an obvious instinct when a grader rejects a correct answer. Add the answer to the list of accepted examples so it gets recognized next time. That instinct aims at the wrong layer, and this item proves it. The answer that flipped nineteen to eleven already had its service on the accepted list. It was as list-aligned as an answer can be, and it still flipped on more than a third of submissions. You can't stabilize a verdict that moves on identical, list-aligned input by adding more examples. The problem isn't in the rubric. It's in the call.

That's the distinction worth keeping. Grader defects come in two kinds. Some are deterministic and live in the rubric or the prompt, like a valid answer that fails for not being on the list. You fix those by editing text. Others are stochastic and live in the model call, like a verdict that changes run to run, a pass-rate that drifts over an hour, or feedback that invents a fresh reason to fit whichever verdict landed. You can't edit your way out of those. The dangerous move is to treat the second kind like the first, to keep enriching the rubric while the real problem is that the grader rerolls every time you call it.

## It fails good answers and passes bad ones

The same instability runs in the other direction. I submitted "I would choose the Crown," which names a tier and then stops. It describes no service, so the rubric says fail it. The grader passed it thirteen times out of thirty. An answer that does half the task gets full credit nearly half the time, on identical input. A grader this unstable doesn't only punish students who are right. It rewards students who are wrong, and it does both at random.

## What this is, and what it isn't

I want the limits stated plainly, because that's the whole point of the series.

- The numbers are from a small local model at a set temperature. They are not a claim about any particular production grader, and a 3B model is not a stand-in for a frontier one. The flip rate depends on the model, the temperature, and the item. What transfers is the instrument, not these specific percentages.
- The temperature is set on purpose. Many production graders never pin it to zero, and even at zero a hosted model isn't bit-deterministic, because batching and routing shift underneath you. The probe runs at a temperature a real deployment might use, and the README says which. A grader you trust should survive repetition at its own settings.
- This measures nondeterminism, the verdict that flips on identical input. The sibling failure is drift, where the pass-rate moves over minutes or hours on the same input. Drift needs a hosted endpoint watched over time, so I name it but I don't claim it from a single local run. The harness is built to measure it when you point it at a live grader.
- The method came from real grading work I can't show, on a program under NDA. What's public is the machine and the invented item. The real numbers stay with the program.

The point was never that AI graders are useless. A grader that's right 95 percent of the time is genuinely useful. But "right 95 percent of the time" and "returns the same verdict twice" are different properties. Most QC only tests the first, and it tests it by accident, with a single run. So before you trust a number a grader produced, submit the same answer again. If the verdict moves, you don't have a grade. You have a sample.
