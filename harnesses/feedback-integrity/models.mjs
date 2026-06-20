// models.mjs — shared local model runner + small utilities for the feedback-integrity harness.
//
// The blind-solver (solve.mjs) and the cheap semantic pass (semantic.mjs) both run on a LOCAL
// model — Llama 3.2 3B via ollama, temperature 0 — so the whole instrument runs on a laptop with
// no API keys and the bulk rungs cost nothing. This is the same local surface expert-parity used,
// kept in one file so the audit trail records exactly one provenance per model.

export const LOCAL = {
  key: "ollama",
  label: "Llama 3.2 3B (local, ollama)",
  version: "ollama:llama3.2:3b",
  model: "llama3.2:3b",
};

export async function runLocal(prompt, { num_predict = 300 } = {}) {
  const r = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: LOCAL.model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { temperature: 0, num_predict },
    }),
  });
  const j = await r.json();
  return (j.message?.content || "").trim();
}

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

// seeded RNG (mulberry32) so option/feedback shuffles are reproducible run to run.
export function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function seededShuffle(arr, seed) {
  const r = rng(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// --- shared text tokenization (used by screen.mjs and score.mjs) ---
export const STOPWORDS = new Set(
  ("a an the of to and or for in on at by with from as is are was were be been being it its this that these those they them their there here you your we our he she his her them not no nor but so if then than that which who whom whose what when where why how all any each few more most other some such only own same too very can will just do does did done has have had having about into over under again further once".split(/\s+/))
);
// generic teaching / framing words that should never count as distinctive content.
export const TEACHING = new Set(
  ("remember think correct wrong answer choice option feedback instead because describes work job thing things place point made make makes making point first day every later long many much actual really right way ways look looked".split(/\s+/))
);

export function tokens(text) {
  return String(text || "").toLowerCase().match(/[a-z][a-z']+/g) || [];
}
export function contentTokens(text) {
  return tokens(text).filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}
export function norm(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
