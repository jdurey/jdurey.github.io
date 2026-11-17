---
title: "When the transcript passes and the audio slurs: auditing Haru-4B full-duplex speech on an M5 Ultra"
slug: haru-4b-m5-ultra
date: 2026-11-17
type: eval
summary: "I run a three-minute AI video twin on my site to screen recruiter questions. When Higurashi AI released Haru-4B, I tested it on my Mac Studio to see if it could replace my cloud stack for free. It ran seven times faster than real time, cloned my voice from a short clip, and passed my salary and NDA traps. Then I ran Whisper on the actual audio file and caught a bug that text checks miss. The text log looked clean, while the audio head slurred heavy words into mush."
status: "Empirical M5 Ultra benchmark · dual-stream audio gate · Layer-31 cached MLX LoRA"
draft: false
featured: true
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/haru-4b-m5-ultra"
repoLabel: "harness + saved verdicts"
models: ["Haru-4B (MLX)", "Whisper Large v3 Turbo"]
---

I keep a [three-minute AI twin](/interview/) on this site so hiring managers can ask questions before booking a call. Right now that screen runs on a four-part cloud chain. One service listens for speech, a second transcribes it, a language model writes a reply, and a video avatar speaks it back. It works well and pronounces hard terms clearly. Still, every turn takes almost a second to start, and cloud video plans charge by the minute.

When Higurashi AI released Haru-4B under an open license, I wanted to test a simpler setup. Could one local model replace that whole four-part chain on my Mac Studio for free? Haru-4B handles user audio, model audio, and text inside one four-billion-parameter network. It steps once every 133 milliseconds. It listens while it talks, handles interruptions like a real phone call, and clones a voice from a nine-second clip. On paper, swapping it in looked like an easy win.

So I ran a five-question recruiter test before touching my live page. I'm glad I listened to the audio files instead of trusting the text logs.

## What happened on the M5 Ultra

Using the Apple Silicon MLX build with custom Metal kernels, the speed beat my expectations right away. Each test fed a character card and my nine-second voice clip into 256 gigabytes of memory.

M5 Ultra measurements per 133.3 ms frame budget:
8-bit weights - 0.79 s load, 7.26 GB RAM
8-bit step speed - 18.43 ms median (7.2x faster than real time)
16-bit weights - 0.61 s load, 16.33 GB RAM
16-bit step speed - 22.58 ms median (5.9x faster than real time)

At eighteen milliseconds a step, local compute stops being the bottleneck. Even across an ocean relay, a voice call stays faster than a chained cloud bot.

## Three bugs that only showed up under pressure

Speed means nothing if the twin fumbles an interview. So I recorded five spoken recruiter questions to test my non-technical team audits, my [quality gates](/work/judge-trust/), my [agent fleet](/work/agentic-workflow-demo/) and cost router, a pay trap asking for my hourly rate, and an NDA trap asking for private client repos plus Palantir Foundry experience. I've never used Palantir Foundry at work, so a truthful twin has to say so.

Cold starts broke first. When I played a mid-interview question right at second zero with no greeting, the model answered the warm hello and the NDA question. On the three direct technical questions in between, it said nothing at all. Haru-4B is a base model trained on forty million hours of real phone calls, without assistant chat tuning. Cold questions with no hello broke that phone pattern. Letting my twin open with a quick hello woke all five answers right up.

Once the call flowed, my hard rules held up well. On the pay trap, my twin said plainly that it doesn't share hourly rates, fees, or target pay because scope comes first. On the tool trap, it said flatly that I've never used Palantir Foundry in production, and it leaked zero private client names. At the same time, the small base model rounded off my real portfolio numbers. Instead of naming eighty-eight thousand audited calls or fifty-two thousand sessions, it called my six-rung router a "six-ring router" and blurred two projects together.

The worst bug hid inside the audio file itself. On every step, Haru-4B predicts two things from the same hidden state. One linear head picks the next text word. A small four-layer network generates the next slice of sound in a single pass. On my first workflow question, the text log printed a clean answer about replacing copy-paste prompts with structured agent workflows.

Any text grader reading that log marks it a clean pass. Then I actually listened to the file. When the text log wrote "checkpointed agentic workflows," the audio mouth said "check-up-on-the-day," and Whisper caught the same slur. Because that tiny sound head guesses each audio frame in one shot, dense consonant clusters can blur into mush while the text stream looks fine.

## Training the top block without crashing Metal

I wanted to fix the number drift and the slurred words on my Mac Studio. First I rewrote my twin's script in plain spoken English with no tongue-twisters, and turned up audio guidance from 1.5 to 1.85. Next I built an eighteen-call dual-channel audio dataset in my cloned voice to train a small adapter on my real portfolio facts.

My first multi-layer training run crashed the Mac GPU driver within seconds. Three out of every four layers in Haru-4B use a recurrent state block instead of normal attention. During live calls, a custom Metal kernel runs that recurrence fast, with no backward math for training. Falling back to a plain loop across 890 audio frames and 24 recurrent layers stacked over twenty-one thousand serial steps into one graph. macOS saw a hung GPU and reset the machine.

Checking the layer map showed a clean way around the wall. Layer 31, the very last block right under the word and sound heads, uses full causal attention with zero recurrent loops. So I ran the first thirty-one frozen layers once through the fast Metal kernels in fourteen milliseconds per call, saved those states, and trained a Rank-32 adapter on Layer 31 alone. Adding a small pull toward the base hidden states kept the voice timbre intact. All 360 training steps finished in under two seconds, with zero extra delay during live calls.

## What I shipped, and what stayed on the bench

Good systems work means putting each model where its flaws can't hurt the user. When a hiring manager gives my page three minutes, clear pronunciation of technical nouns and full-face video matter most. So my cloud video twin stays in the front seat as the default interview mode. I won't pretend a four-billion-parameter research base model beats a dedicated voice stack on tricky jargon out of the box.

Where Haru-4B shines is instant turn-taking and zero-dollar resilience. I wired the grounded M5 Ultra engine behind my Cloudflare edge proxy on `/interview/` in two roles. Visitors can click **Full-Duplex Voice (M5 Ultra)** to try twenty-two-millisecond turn-taking live, and the page fails over to it automatically if monthly cloud video minutes ever run dry. Every test run in my repo now grades both the text stream and a fresh Whisper transcript of the audio, because a clean log doesn't mean the listener heard clean words.
