---
title: "A voice assistant that runs offline by default"
slug: local-voice-assistant
date: 2026-06-17
type: systems
summary: "An always-listening voice OS where the entire loop — wake, transcribe, reason, speak — runs locally, so sensitive conversations never have to leave the machine."
models: ["Whisper (local)", "Ollama / Llama 3.2", "Piper TTS", "Claude (fallback)"]
status: "Working build"
featured: true
---

I wanted a voice assistant I could actually talk to — say a name, have a conversation, stop — without piping every word I say to someone's cloud. So I built the whole pipeline to run locally by default, and made cloud egress the exception rather than the rule. The interesting engineering was almost all in the parts that are invisible when they work.

## The pipeline

**Always listening, without latching onto ambient talk.** Say the wake word and it converses; it auto-sleeps after a stretch of silence so it won't grab onto background conversation. Mid-conversation you don't need to repeat the wake word.

**Continuous pre-roll capture.** The first version kept clipping the wake word — it started recording *on* detecting onset, which physically cut off the front of the word. Fix: the mic records continuously into a rolling buffer, so the audio from *before* the trigger survives. Obvious in hindsight, invisible until you see the transcripts.

**Fuzzy wake matching on the phoneme core.** Local speech-to-text mangles the wake word in consistent ways — it comes out as several different near-homophones. Exact matching missed constantly. Matching on the stable core sound instead of the full word fixed the wake reliability without adding a cloud keyword spotter.

**Streaming local reasoning that talks as it thinks.** A small local model, kept warm in memory, streams its response; the output is chunked at sentence boundaries and sent to speech synthesis as it generates, so the assistant starts talking in well under a second instead of waiting for the full answer. Warm-local beats cold-cloud on latency by a wide margin here.

**A neural local voice.** The built-in OS voice was unusably robotic, so the speaking voice is a neural text-to-speech model running locally, with an optional premium cloud voice when I want it. Real local time gets injected into the model's context too — otherwise it confidently hallucinated the time.

## The control that mattered most

The reason to build this locally wasn't only latency — it was **egress control**. Sensitive contexts never reach a cloud model or a cloud voice. A sensitivity check on each turn can keep the entire exchange local: in that path the cloud is called *zero* times and no audio ever leaves the device. The only egress in normal operation is the optional cloud voice, and even that is gated. The system fails closed — when in doubt, it stays local.

## The unglamorous win

The first working version ran inside a full browser and ate close to six gigabytes of memory. Moving to a native shell brought it down to roughly 435 megabytes for the same behavior. Most of "make it good" was this kind of work: not new features, but removing the heavy thing that was technically optional.

## Why it's relevant to eval and safety work

Designing a system whose default is to *not* send data anywhere — and proving the no-egress path actually makes zero outbound calls — is the same muscle as building a guardrail you can trust. The habit it trained is the one I bring to evaluation work: don't assert the safe path exists, instrument it and watch it hold.
