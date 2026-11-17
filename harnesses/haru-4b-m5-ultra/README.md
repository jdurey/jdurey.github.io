# Haru-4B Full-Duplex Speech Audit & Layer-31 Cached-Prefix LoRA Harness

Reproducible clean-room benchmark and acoustic-vs-text drift gate for evaluating `higurashi-ai/Haru-4B` (`7.5 Hz` continuous speech-to-speech on `Qwen3.5-4B` + 1-step `MeanFlow` head) on Apple Silicon (`MLX`).

## What This Harness Measures

A continuous full-duplex speech model emits two outputs from the same `133.3 ms` hidden state `h_t`:
1. **Text stream (`frame.text`)**: sampled from `lm.embed_tokens.as_linear(h_t)`.
2. **Continuous acoustic stream (`frame.audio`)**: generated in a single sampling step by a 4-layer `MeanFlow` MLP head (`head.sample(h_t)`), decoded to `24 kHz` waveform by causal `VibeVoice`.

Grading `frame.text` alone misses acoustic slurring inside the 1-step `MeanFlow` head. This harness pairs every full-duplex simulation with an independent ASR pass (`whisper-large-v3-turbo`) over the decoded `24 kHz` waveform and scores:

1. **Frame step latency (`p50` / `p95` ms vs. `133.3 ms` real-time budget)** across `int8` and `bfloat16` on Apple M5 Ultra.
2. **Acoustic-vs-Text Divergence (`text_vs_whisper_wer`)**: catches phrases where `frame.text` reads cleanly (`"checkpointed agentic workflows"`) while the 1-step `MeanFlow` waveform slurs consonant clusters (`"check-up-on-the-day"`), or `"Let's unpack"` slurs into `"Sipalpajak"`.
3. **Turn-Initiation Sensitivity (`speak_first` vs. `eop_bias`)**: quantifies why cold-starting mid-call technical prompts at `t = 0` stays silent on 3 of 5 turns (`speak_first=False, eop_bias=0.0`) until conditioned on a natural phone opening (`speak_first=True`).
4. **Hard Boundary Probes**: compensation deflection (`0` quoted dollar rates/salaries) and confidentiality / unshipped-tool honesty (`Palantir Foundry`).
5. **Cached-Prefix Layer-31 LoRA (`layer31_cached_lora.py`)**: avoids unrolling Python autodiff through 24 recurrent `GatedDeltaNet` layers (`21,360` sequential steps on `890`-frame calls, which trips macOS's `IOGPU` watchdog) by computing frozen Layers `0..30` once through compiled Metal kernels and training Rank-32 LoRA strictly on Layer `31` (the final global causal `Attention + SwiGLU` block).

## Files

- `audit_audio_text_drift.py` — Runs offline `7.5 Hz` full-duplex evaluation and compares `frame.text` against independent Whisper transcription + boundary rules.
- `layer31_cached_lora.py` — Zero-unroll cached-prefix Rank-32 MLX LoRA trainer for `Haru-4B`'s top global-attention block (`lm.layers.31`).
- `saved_verdicts.json` — Saved latency, memory, `frame.text`, independent Whisper transcripts, and guardrail verdicts from Apple M5 Ultra (`256 GB` unified memory).

## Quick Verification (No GPU Required to Re-Score Saved Verdicts)

```bash
python3 audit_audio_text_drift.py --verify-saved saved_verdicts.json
```
