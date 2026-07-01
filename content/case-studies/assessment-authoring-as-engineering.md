---
title: "Assessment authoring as engineering: build the items in code, prove them with a round-trip"
slug: assessment-authoring-as-engineering
date: 2026-07-01
type: method
summary: "Most people build test items by hand, in a web UI, one click at a time. That's the step where items get dropped silently, and a structural check that passes tells you nothing about whether you built the right test. So I treat authoring as software engineering. I build the items in code, drive the platform's own API, and prove the result with a round-trip check against the source, with the source bank as the oracle. Every rule in the method traces to a named principle: Boehm on verification versus validation, Weyuker on oracles, QuickCheck on property-based testing, Shingo on mistake-proofing, Bainbridge on automation, Saltzer and Schroeder on least privilege."
status: "Method from a real assessment-authoring engagement under NDA · re-authored on public substrate, each rule grounded in a named CS principle"
draft: false
featured: false
models: []
---

Most teams author test items the obvious way. Someone opens the platform, clicks "new item," and types the stem and the options into a form, hundreds of times. It feels safe because you can see each item as you make it. It's the least safe part of the whole job. Hand transcription is where items get dropped and mis-keyed with no error and no warning, and a bank that looks complete on screen can be wrong. So I stopped clicking. I build the items in code, drive the platform through the same API its own UI calls, and prove the build with a check that reads it back. The method is small. What makes it worth writing down is that every rule in it traces to a named principle someone published decades ago.

This is one piece in a series on whether you can trust an AI-driven learning system. The others check the graders: [feedback-integrity](/case-studies/feedback-integrity) checks the model that writes explanations, [judge-trust](/case-studies/judge-trust) checks the model that grades work, and [verdict-integrity](/case-studies/verdict-integrity) checks whether that grader is even stable. This one checks the build itself, the step before any of that. Did the test you shipped actually match the test you meant to ship, and will it render for a real student?

I can't show you the platform that made me build this. It's a real assessment tool, a real item bank, and it's under NDA. The method below is re-authored on neutral ground, and it runs on any single-page authoring tool with an API under it. You get the method and the reasoning. The client keeps the platform.

## The name is a one-way door

On many platforms, "delete" is a soft delete: the record gets tombstoned and the identifier lingers, so a retired name may not free up the way you'd expect. Unless the API guarantees a real purge or rename, I treat the name as permanent. I pick it once, up front, and I run a precheck before I create anything. The precheck compares the new item against the existing series and returns one of three answers: clean to proceed, exact duplicate so stop, or off-convention so surface it and wait for a person.

That precheck is the one place I deliberately stop the machine and ask a human to confirm. Shigeo Shingo called this poka-yoke, building the check into the process so the mistake can't happen, instead of inspecting for it after. The precheck is a poka-yoke aimed at the single action I can't take back.

## Build in code, and assert before you build

Trained staff miskey around 3.7% of values even on simple, high-stakes data. That figure comes from a study of point-of-care medical entry, and an item bank is a harder case, because a dropped option doesn't throw an error. It just vanishes. So I don't type items into a console. I read the source one cell at a time, assemble the whole set as a structured object in code, and assert the invariants before a single record gets created: the exact count, every required field present, exactly one correct answer per multiple-choice item, a real rubric on every written-response item. A malformed set fails at my desk, hours before a student would ever see it.

This is Lisanne Bainbridge's ironies of automation, read the right way round. Automate the rote, error-prone transcription. Keep the human for judgment. The common mistake is to do it backwards, automating the judgment and leaving a person to hand-key the data.

## Verification is not validation

Barry Boehm drew the line this whole method rests on, back in 1984. Verification asks "did I build the thing right." Validation asks "did I build the right thing." They are different questions, and passing the first tells you nothing about the second. My structural checks are verification: right count, one correct answer per item, a field where the answer box belongs. A bank can pass every one of those and still be the wrong bank.

For validation I use a round-trip. I author the item, read it back from the platform through the API, and compare the correct-answer text that comes out against the correct-answer text I put in. And I compare by content, never by position. Many authoring tools reassign the option identifiers on save, so the correct answer can land in a different slot than I sent. That's expected. If I checked by slot I'd get false failures on every item. Checking by text is the honest comparison.

That round-trip is a property check. It borrows the decode(encode(x)) == x idea QuickCheck made famous, John Hughes and Koen Claessen's round-trip property, and runs it over the real bank instead of generated inputs. I'm not spot-checking examples. I'm asserting one invariant that has to hold for every item: what I read back equals what I wrote.

## The one check no machine can do

There's one thing the round-trip can't prove. A text match tells me the item is shaped right. It says nothing about whether a student can actually use it. This is the oracle problem Elaine Weyuker wrote about: you need an oracle for the property you actually care about, and a form-check isn't one for "a student can use this." Part of it does automate, a headless browser can smoke-test that an answer field renders. But the final call on whether the finished item works for a student is a usability judgment, so the last check is a person opening the test in the real player and looking.

## When the platform's own output is broken, conform to the spec

Sometimes a platform's own generator emits something broken, say a written-response item whose auto-built markup has no usable answer field. The tempting fix is to fiddle with the tool's settings until it behaves. That's a losing game. The winning move is to hand-build the item to the actual published standard, which for assessment content is QTI, the public interoperability spec for assessment items. The closer my artifact sits to the real spec, the fewer surprises reach a student. When the default is broken, conformance is the workaround, because the spec is the contract the rest of the system already honors.

## Draft only, and secrets stay in the session

The last thing my process does is never "publish to students." Authoring produces unpublished drafts. A different role publishes them. That split is the design, and it has a name. Separation of privilege and least privilege, from Saltzer and Schroeder's 1975 paper on protecting information in computer systems, later written into standard access controls. The method never holds more power than the task needs. The missing publish button is a control I put there on purpose.

Auth tokens get minted in the page each run, and they never get hard-coded, pasted, or persisted outside the authenticated session. A hard-coded credential is a catalogued weakness with its own ID, and it's the first thing every secrets guide tells you to stop doing. Minting in-session costs nothing and removes a whole class of failure.

## The point of the whole thing

The one approval gate that can block the machine sits on the single irreversible action, choosing the name. Everything reversible in between is automated, and a person still runs the final usability check from earlier. That placement is deliberate, and it's Bainbridge again. If you automate everything and leave a person one rare button, they've lost the skill by the time they need it. So the human doesn't get the leftover scraps. The human keeps the calls that matter, the gate before the irreversible step and the final look, and the machine handles the rest.

Strung together, it's a stance more than a script. Treat content authoring as software engineering, and name the principle behind every rule. Build in code, because transcription fails silently. Validate with a round-trip, since a structural pass proves nothing about fidelity. Compare by content, because tools reorder the options on their own. Keep a human on the irreversible call and on the final look, and hold everything else to draft-only with in-session secrets. Once each move has a named reason, "how I build tests" becomes something I can teach and defend on any platform.

## Honest limits

- **The platform and the bank stay under NDA.** What's public is the method and the reasoning. I won't name the tool, quote its API, or share the item content, because those belong to the client.
- **This proves the build matched the source. It doesn't judge the items.** The round-trip confirms the test I shipped matches what I meant to ship. It says nothing about whether the items are any good. Item quality, things like distractor strength and cognitive demand, is a separate discipline with its own checks.
- **The method assumes an API under the UI.** If the tool server-renders every page with no internal API to drive, this doesn't apply. Most modern authoring tools are single-page apps over a REST API, so most of the time it does.
- **In-session auth is only a floor.** Minting the token in the page removes the hard-coded-credential failure. It doesn't replace the platform's own access controls, and it shouldn't.
