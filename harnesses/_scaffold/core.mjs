// _scaffold/core.mjs — shared runner + utilities for the synthetic-NDA harness family.
//
// Extracted at the THIRD harness (agent-boundary) from the common surface of expert-parity and
// feedback-integrity: a local model runner, a cross-model CLI runner, JSON extraction, arg parsing,
// a seeded RNG, and text tokenization. Each harness imports what it needs and adds its own rungs.
//
// Provenance discipline (kept from the prior two): the LOCAL model is the reproducible baseline so
// every number recomputes on a laptop with no API keys; the cross-model CLI subjects are saved as
// raw responses (the system of record) because their output is not bit-stable run to run.

import { execFile } from "node:child_process";

// ---- local model (ollama) — the reproducible baseline subject -----------------------------------
export const LOCAL = {
  key: "ollama",
  label: "Llama 3.2 3B (local, ollama)",
  version: "ollama:llama3.2:3b",
  model: "llama3.2:3b",
};

export async function runLocal(prompt, { num_predict = 400, temperature = 0 } = {}) {
  const r = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: LOCAL.model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { temperature, num_predict },
    }),
  });
  const j = await r.json();
  return (j.message?.content || "").trim();
}

// ---- cross-model CLI subjects (codex / grok / gemini) -------------------------------------------
// Each is a locally-installed CLI that takes a prompt and prints a completion to stdout. We invoke
// them in a single non-interactive shot, no tools, so the subject's whole behavior is the text it
// returns. Flags are kept here as the one place that knows each CLI's non-interactive surface.
export const CLI_SUBJECTS = {
  // sandbox_mode=read-only stops codex's agent from trying to ACT on the prompt (it would return
  // empty stdout); read-only makes it answer the decision as text, which is what the probe measures.
  codex:  { label: "OpenAI Codex CLI",   cmd: "codex", args: (p) => ["exec", "--skip-git-repo-check", "-c", "sandbox_mode=read-only", p] },
  grok:   { label: "xAI Grok CLI",       cmd: "grok",  args: (p) => ["-p", p] },
  // The standalone `gemini` CLI dropped free-tier support (UNSUPPORTED_CLIENT); the live Gemini path
  // on this machine is the `agy` wrapper in single-shot (-p) mode.
  gemini: { label: "Google Gemini (agy)", cmd: "agy",  args: (p) => ["-p", p] },
};

// Run a CLI subject once. Returns { ok, text, err }. Never throws — a dead/again CLI resolves to
// { ok:false } so the probe records the gap instead of aborting the whole run (fail-soft at the
// orchestration layer; the per-vector GUARD is the fail-CLOSED layer and lives elsewhere).
export function runCLI(subjectKey, prompt, { timeoutMs = 120000 } = {}) {
  const s = CLI_SUBJECTS[subjectKey];
  if (!s) return Promise.resolve({ ok: false, text: "", err: `unknown subject ${subjectKey}` });
  return new Promise((resolve) => {
    execFile(s.cmd, s.args(prompt), { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      const text = (stdout || "").trim();
      if (err && !text) resolve({ ok: false, text: "", err: String(stderr || err).slice(0, 500) });
      else resolve({ ok: true, text, err: err ? String(stderr || err).slice(0, 300) : "" });
    });
  });
}

// ---- generic helpers (verbatim from feedback-integrity, harness-agnostic) ------------------------

// Extract the last balanced JSON object from a model response (models wrap JSON in prose/fences).
export function extractJSON(text) {
  if (!text) return null;
  const fenced = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1]);
  const candidates = fenced.length ? fenced : [text];
  for (const block of candidates.reverse()) {
    const starts = [];
    for (let i = 0; i < block.length; i++) if (block[i] === "{") starts.push(i);
    for (const s of starts.reverse()) {
      let depth = 0;
      for (let j = s; j < block.length; j++) {
        if (block[j] === "{") depth++;
        else if (block[j] === "}") { depth--; if (depth === 0) { try { return JSON.parse(block.slice(s, j + 1)); } catch { break; } } }
      }
    }
  }
  return null;
}

export function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

// seeded RNG (mulberry32) so any shuffle/sample is reproducible run to run.
export function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function seededShuffle(arr, seed) {
  const r = rng(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function tokens(text) {
  return String(text || "").toLowerCase().match(/[a-z][a-z']+/g) || [];
}
export function norm(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
