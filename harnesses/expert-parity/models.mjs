// models.mjs — pinned model runners shared by run.mjs (candidates) and judge.mjs (blind panel).
//
// Models are the DEPLOYED CLI surfaces (claude / codex / grok / agy) plus local Llama via
// ollama — no API keys, reproducible from a laptop. One definition so the audit trail records
// exactly one provenance per model. Each runner returns trimmed stdout text.

import { spawn } from "node:child_process";
import path from "node:path";
import { homedir } from "node:os";

export const TIMEOUT_MS = 180000;

export function runCmd(cmd, args, { input } = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let stdout = "", stderr = "", done = false;
    const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
    const timer = setTimeout(() => {
      if (!done) { done = true; child.kill("SIGKILL"); resolve({ stdout, stderr: stderr + "\n[timeout]", timedOut: true, ms: Date.now() - t0 }); }
    }, TIMEOUT_MS);
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (e) => { if (!done) { done = true; clearTimeout(timer); resolve({ stdout, stderr: stderr + e.message, error: true, ms: Date.now() - t0 }); } });
    child.on("close", (code) => { if (!done) { done = true; clearTimeout(timer); resolve({ stdout, stderr, code, ms: Date.now() - t0 }); } });
    if (input !== undefined) child.stdin.write(input);
    child.stdin.end();
  });
}

export const MODELS = {
  claude: {
    label: "Claude (Sonnet 4.6, Claude Code CLI)",
    version: "claude-code:sonnet",
    run: async (p) => (await runCmd("claude", ["-p", "--model", "sonnet", p])).stdout.trim(),
  },
  codex: {
    label: "GPT (OpenAI Codex CLI, default model)",
    version: "codex-cli:default",
    run: async (p) => (await runCmd("codex", ["exec", "--skip-git-repo-check", p], { input: "" })).stdout.trim(),
  },
  grok: {
    label: "Grok (xAI Grok CLI, default model)",
    version: "grok-cli:default",
    run: async (p) => (await runCmd(path.join(homedir(), ".grok/bin/grok"), ["-p", p, "--always-approve"])).stdout.trim(),
  },
  gemini: {
    label: "Gemini (agy print-mode)",
    version: "agy:print",
    run: async (p) => (await runCmd("agy", ["-p", p])).stdout.trim(),
  },
  ollama: {
    label: "Llama 3.2 3B (local, ollama)",
    version: "ollama:llama3.2:3b",
    run: async (p) => {
      const r = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        body: JSON.stringify({ model: "llama3.2:3b", messages: [{ role: "user", content: p }], stream: false, options: { temperature: 0, num_predict: 700 } }),
      });
      const j = await r.json();
      return (j.message?.content || "").trim();
    },
  },
};

// Extract the last JSON object from a model response (models wrap JSON in prose/markdown fences).
export function extractJSON(text) {
  if (!text) return null;
  const fenced = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1]);
  const candidates = fenced.length ? fenced : [text];
  for (const block of candidates.reverse()) {
    // scan for the last balanced {...}
    const starts = [];
    for (let i = 0; i < block.length; i++) {
      if (block[i] === "{") starts.push(i);
    }
    for (const s of starts.reverse()) {
      let depth = 0;
      for (let j = s; j < block.length; j++) {
        if (block[j] === "{") depth++;
        else if (block[j] === "}") { depth--; if (depth === 0) {
          try { return JSON.parse(block.slice(s, j + 1)); } catch { break; }
        } }
      }
    }
  }
  return null;
}

export function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
