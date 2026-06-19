#!/usr/bin/env node
// firewall-scan.mjs — clean-room gate for the public portfolio.
//
// Scans the given files/dirs for Alpha / 2hr-Learning / NDA markers and aborts
// (exit 1) on ANY hit. This is the load-bearing control for unattended auto-publish:
// it runs locally pre-commit AND as a required CI check before deploy. Bias is
// deliberately toward blocking — a leak is catastrophic, a false block just skips
// one nightly publish and pings Josh.
//
// Usage: node scripts/firewall-scan.mjs <path> [<path> ...]
// Exit:  0 = clean, 1 = findings (do not publish), 2 = usage/internal error.

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DENYLIST_PATH = process.env.FIREWALL_DENYLIST || path.join(HERE, "firewall-denylist.json");

const TEXT_EXT = new Set([
  ".html", ".htm", ".md", ".markdown", ".txt", ".json", ".js", ".mjs", ".cjs",
  ".ts", ".tsx", ".jsx", ".css", ".xml", ".yml", ".yaml", ".py", ".sh", ".svg", ".csv", ".toml",
]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".github", "dist"]); // dist scanned explicitly by passing it as a path
const CONTEXT_WINDOW = 48;

function readDenylistFile(p) {
  if (!existsSync(p)) {
    console.error(`firewall-scan: denylist not found at ${p}`);
    process.exit(2);
  }
  return readFileSync(p, "utf8");
}

function loadDenylist() {
  const raw = JSON.parse(readDenylistFile(DENYLIST_PATH));
  const hardBlock = (raw.hardBlock || []).map((s) => s.toLowerCase());
  const hardBlockRegex = (raw.hardBlockRegex || []).map((r) => new RegExp(r, "gi"));
  const contextWords = (raw.contextWords || []).map(
    (w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
  );
  const contextAllow = (raw.contextAllow || []).map((s) => s.toLowerCase());
  return { hardBlock, hardBlockRegex, contextWords, contextAllow };
}

async function* walk(target) {
  let s;
  try {
    s = await stat(target);
  } catch {
    return;
  }
  if (s.isDirectory()) {
    for (const entry of await readdir(target)) {
      if (SKIP_DIRS.has(entry)) continue;
      yield* walk(path.join(target, entry));
    }
  } else if (s.isFile()) {
    if (TEXT_EXT.has(path.extname(target).toLowerCase())) yield target;
  }
}

function scanLine(line, dl) {
  const findings = [];
  const lower = line.toLowerCase();

  for (const term of dl.hardBlock) {
    let idx = lower.indexOf(term);
    while (idx !== -1) {
      findings.push({ rule: "hardBlock", term, col: idx });
      idx = lower.indexOf(term, idx + term.length);
    }
  }
  for (const re of dl.hardBlockRegex) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      findings.push({ rule: "hardBlockRegex", term: m[0], col: m.index });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  for (const re of dl.contextWords) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      const start = Math.max(0, m.index - CONTEXT_WINDOW);
      const window = lower.slice(start, m.index + m[0].length + CONTEXT_WINDOW);
      const allowed = dl.contextAllow.some((a) => window.includes(a));
      if (!allowed) findings.push({ rule: "contextWord", term: m[0], col: m.index });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return findings;
}

async function scanFile(file, dl) {
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    return [];
  }
  const out = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    for (const f of scanLine(lines[i], dl)) {
      out.push({ file, line: i + 1, ...f, snippet: lines[i].trim().slice(0, 140) });
    }
  }
  return out;
}

async function main() {
  const targets = process.argv.slice(2);
  if (!targets.length) {
    console.error("usage: firewall-scan.mjs <path> [<path> ...]");
    process.exit(2);
  }
  const dl = loadDenylist();
  const all = [];
  let scanned = 0;
  for (const t of targets) {
    for await (const file of walk(t)) {
      scanned++;
      all.push(...(await scanFile(file, dl)));
    }
  }

  if (all.length === 0) {
    console.log(`✓ firewall clean — ${scanned} files scanned, 0 findings. Safe to publish.`);
    process.exit(0);
  }

  console.error(`\n✖ FIREWALL BLOCK — ${all.length} finding(s) across ${scanned} files. PUBLISH ABORTED.\n`);
  for (const f of all) {
    const rel = path.relative(process.cwd(), f.file);
    console.error(`  ${rel}:${f.line}  [${f.rule}] "${f.term}"`);
    console.error(`      ${f.snippet}`);
  }
  console.error(`\nResolve every finding (rephrase content, or vet+adjust the denylist) before this can publish.`);
  process.exit(1);
}

// Run as CLI only when invoked directly; stay importable for tests.
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((e) => {
    console.error("firewall-scan internal error:", e);
    process.exit(2);
  });
}

export { scanLine, loadDenylist };
