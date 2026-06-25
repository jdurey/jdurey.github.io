---
queued: false
queueOrder: 2
title: "A voice assistant that runs offline by default"
slug: local-voice-assistant
date: 2026-06-17
type: systems
summary: "An always-listening voice OS where the whole loop, from wake to transcribe to reason to speak, runs locally. So sensitive conversations never have to leave the machine."
models: ["Whisper (local)", "Ollama / Llama 3.2", "Piper TTS", "Claude (fallback)"]
status: "Working build"
featured: true
---

I wanted a voice assistant I could actually talk to. Say a name, have a conversation, stop. And I wanted it without piping every word I say to someone's cloud. So I built the whole pipeline to run locally by default, and I made cloud egress the exception. The interesting engineering was almost all in the parts that are invisible when they work.

## The pipeline

**Always listening, without latching onto the room.** Say the wake word and it talks back. It auto-sleeps after a stretch of silence, so it won't grab onto background conversation. And mid-conversation, you don't have to repeat the wake word.

**Continuous pre-roll capture.** The first version kept clipping the wake word, because it started recording on detecting onset, which physically cut off the front of the word. So the fix was to record continuously into a rolling buffer. That way the audio from before the trigger survives. It's obvious in hindsight, and it was invisible until I read the transcripts.

**Fuzzy wake matching on the core sound.** Local speech-to-text mangles the wake word in consistent ways. It comes out as several near-homophones. Exact matching missed constantly. So matching on the stable core sound instead of the full word fixed the wake reliability, and it did it without adding a cloud keyword spotter.

**Streaming local reasoning that talks as it thinks.** A small local model, kept warm in memory, streams its response. The output gets chunked at sentence boundaries and sent to speech synthesis as it generates. So the assistant starts talking in well under a second instead of waiting for the full answer. Warm-and-local beats cold-and-cloud on latency by a wide margin here.

**A neural local voice.** The built-in OS voice was unusably robotic, so the speaking voice is a neural text-to-speech model running locally, with an optional premium cloud voice when I want it. And the real local time gets injected into the model's context, because otherwise it confidently hallucinated the time.

## The control that mattered most

The reason to build this locally wasn't only latency. It was egress control. Sensitive contexts never reach a cloud model or a cloud voice. A sensitivity check on each turn can keep the whole exchange local, and in that path the cloud gets called zero times and no audio ever leaves the device. The only egress in normal operation is the optional cloud voice, and even that is gated. The system fails closed. When in doubt, it stays local.

## The unglamorous win

The first working version ran inside a full browser and ate close to six gigabytes of memory. Moving to a native shell brought it down to roughly 435 megabytes for the same behavior. So most of "make it good" was this kind of work. Not new features. Removing the heavy thing that was technically optional.

## Why it's relevant to eval and safety work

Designing a system whose default is to not send data anywhere, and then proving the no-egress path actually makes zero outbound calls, is the same muscle as building a guardrail you can trust. So the habit it trained is the one I bring to evaluation work. Don't assert the safe path exists. Instrument it and watch it hold.
