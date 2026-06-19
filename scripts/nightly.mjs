#!/usr/bin/env node
// nightly.mjs — the unattended portfolio engine.
//
// Flow:  discover new lab artifacts → (optionally) draft case studies → FIREWALL
// GATE → build → FIREWALL GATE → publish (git push triggers deploy) → digest.
//
// Safety posture:
//   * Vetted content (draft:false) + cadence refresh PUBLISH automatically. (auto-publish)
//   * Newly GENERATED prose lands as draft:true and is only surfaced for review —
//     the firewall catches leaks, not fabrication, and accuracy is reputational.
//     Set AUTOPUBLISH_DRAFTS=1 to ship generated drafts immediately (not recommended).
//   * The firewall scan gates the only irreversible step. Any finding → abort, no push.
//
// Env:
//   FORGE_SOURCES   colon-separated dirs of lab artifacts to watch (optional)
//   GEN_ENABLED=1   enable LLM drafting of new artifacts (needs `claude` CLI)
//   PUBLISH=1       actually git commit+push (otherwise dry-run / build only)
//   AUTOPUBLISH_DRAFTS=1   publish generated drafts without review (default off)

import { readFile, writeFile, readdir, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".nightly-state.json");
const RUNLOG = path.join(ROOT, "RUNLOG.md");
const RUNS_DIR = path.join(ROOT, "runs");
const TODAY = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const NOW = new Date().toISOString();

const log = (m) => console.log(`[nightly ${NOW}] ${m}`);

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });
}
function tryGit(args) {
  try {
    return sh("git", args).trim();
  } catch (e) {
    return null;
  }
}

async function loadState() {
  if (!existsSync(STATE)) return { lastRun: null, seen: {} };
  try {
    return JSON.parse(await readFile(STATE, "utf8"));
  } catch {
    return { lastRun: null, seen: {} };
  }
}

async function discover(state) {
  const srcEnv = process.env.FORGE_SOURCES || "";
  const sources = srcEnv.split(":").map((s) => s.trim()).filter(Boolean);
  const fresh = [];
  for (const src of sources) {
    if (!existsSync(src)) {
      log(`source missing (skipped): ${src}`);
      continue;
    }
    const stack = [src];
    while (stack.length) {
      const cur = stack.pop();
      let s;
      try {
        s = await stat(cur);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        for (const e of await readdir(cur)) {
          if (e.startsWith(".")) continue;
          stack.push(path.join(cur, e));
        }
      } else if (s.isFile() && /\.(md|json)$/i.test(cur)) {
        const prev = state.seen[cur];
        if (!prev || prev < s.mtimeMs) fresh.push({ file: cur, mtimeMs: s.mtimeMs, isNew: !prev });
      }
    }
  }
  return fresh;
}

function scan(paths) {
  // returns true if clean, false if blocked
  try {
    const out = sh("node", [path.join(ROOT, "scripts/firewall-scan.mjs"), ...paths]);
    log(out.trim());
    return true;
  } catch (e) {
    log("FIREWALL BLOCK:\n" + (e.stdout || "") + (e.stderr || ""));
    return false;
  }
}

function build() {
  const out = sh("node", [path.join(ROOT, "build.mjs")], { env: { ...process.env, BUILD_DATE: TODAY } });
  log(out.trim());
}

async function generateDrafts(fresh) {
  // Best-effort. Only NEW artifacts, only if enabled and `claude` is present.
  if (process.env.GEN_ENABLED !== "1") return [];
  const have = (() => {
    try {
      execFileSync("command", ["-v", "claude"], { shell: "/bin/zsh" });
      return true;
    } catch {
      return false;
    }
  })();
  if (!have) {
    log("GEN_ENABLED but `claude` CLI not found — skipping generation.");
    return [];
  }
  const draftDir = path.join(ROOT, "content/case-studies");
  const made = [];
  for (const a of fresh.filter((f) => f.isNew && f.file.endsWith(".md")).slice(0, 3)) {
    const slug = "draft-" + path.basename(a.file).replace(/\.md$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const dest = path.join(draftDir, slug + ".md");
    if (existsSync(dest)) continue;
    try {
      const source = await readFile(a.file, "utf8");
      const prompt = DRAFT_PROMPT + "\n\n--- SOURCE ARTIFACT ---\n" + source.slice(0, 8000);
      const body = execFileSync("claude", ["-p", prompt], { cwd: ROOT, encoding: "utf8", timeout: 180000 });
      const fm = `---\ntitle: "DRAFT — review before publish"\nslug: ${slug}\ndate: ${TODAY}\ntype: eval\nsummary: "Auto-drafted from a new lab artifact. Review, edit, set draft:false to publish."\ndraft: true\n---\n\n`;
      await writeFile(dest, fm + body.trim() + "\n");
      made.push(dest);
      log(`drafted: ${path.relative(ROOT, dest)}`);
    } catch (e) {
      log(`draft generation failed for ${a.file}: ${e.message}`);
    }
  }
  return made;
}

const DRAFT_PROMPT = `You are drafting a clean-room case study for a PUBLIC AI-evaluation portfolio.
HARD RULES: Never mention any employer name, internal project codename, person's name,
client, NDA, or confidential system. Describe capability as method only, on public
substrate. Output ONLY the markdown body (no frontmatter, no preamble). Be specific and
technical; no fabricated numbers — only use figures present in the source artifact.`;

function publish(changedSummary) {
  if (process.env.PUBLISH !== "1") {
    log("PUBLISH not set — build verified, not pushing (dry run).");
    return { pushed: false, reason: "dry-run" };
  }
  const status = tryGit(["status", "--porcelain"]);
  if (status === null) return { pushed: false, reason: "not a git repo" };
  if (!status) return { pushed: false, reason: "no changes" };
  tryGit(["add", "-A"]);
  tryGit(["commit", "-m", `nightly: ${changedSummary} (${TODAY})`]);
  const pushed = tryGit(["push", "origin", "HEAD"]);
  return { pushed: pushed !== null, reason: pushed === null ? "push failed" : "pushed" };
}

async function main() {
  await mkdir(RUNS_DIR, { recursive: true });
  const state = await loadState();
  const fresh = await discover(state);
  log(`discovered ${fresh.length} new/changed artifact(s)`);

  const drafts = await generateDrafts(fresh);

  // GATE 1 — source must be clean before we build anything
  if (!scan([path.join(ROOT, "content"), path.join(ROOT, "harnesses")])) {
    await finish(state, fresh, { aborted: "source firewall block", drafts, publishResult: null });
    process.exit(1);
  }

  build();

  // GATE 2 — built output must be clean before it can publish
  if (!scan([path.join(ROOT, "dist")])) {
    await finish(state, fresh, { aborted: "dist firewall block", drafts, publishResult: null });
    process.exit(1);
  }

  const summary = drafts.length ? `${drafts.length} draft(s), site refresh` : "site refresh";
  const publishResult = publish(summary);
  log(`publish: ${publishResult.reason}`);

  await finish(state, fresh, { aborted: null, drafts, publishResult });
}

async function finish(state, fresh, { aborted, drafts, publishResult }) {
  // Only mark artifacts seen if we did NOT abort (so a blocked run re-tries them).
  if (!aborted) {
    for (const a of fresh) state.seen[a.file] = a.mtimeMs;
    state.lastRun = NOW;
    await writeFile(STATE, JSON.stringify(state, null, 2));
  }
  const digest = [
    `# Nightly digest — ${TODAY}`,
    ``,
    aborted ? `**ABORTED:** ${aborted} — nothing published. Resolve and re-run.` : `**Status:** ${publishResult?.reason || "ok"}`,
    ``,
    `- New/changed artifacts seen: ${fresh.length}`,
    `- Drafts generated (need review): ${drafts.length}`,
    drafts.length ? `  > Each draft MUST get the voice-profile + ai-proof pass before publishing (hard rule). Then set draft:false.` : ``,
    ...drafts.map((d) => `  - ${path.relative(ROOT, d)}: voice-profile + ai-proof, then set draft:false`),
    ``,
    fresh.length ? `## Artifacts` : ``,
    ...fresh.map((f) => `- ${f.isNew ? "NEW" : "changed"}: ${f.file}`),
  ].join("\n");
  await writeFile(path.join(RUNS_DIR, `digest-${TODAY}.md`), digest + "\n");
  const logline = `${NOW} | artifacts=${fresh.length} drafts=${drafts.length} | ${aborted ? "ABORT:" + aborted : publishResult?.reason}\n`;
  await writeFile(RUNLOG, (existsSync(RUNLOG) ? await readFile(RUNLOG, "utf8") : "# Nightly RUNLOG\n\n") + logline);
  log("digest + runlog written.");
}

main().catch((e) => {
  console.error("nightly fatal:", e);
  process.exit(1);
});
