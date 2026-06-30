#!/usr/bin/env node
// firewall-scan.mjs — clean-room gate for the public portfolio.
//
// Scans files/dirs for Alpha / 2hr-Learning / NDA markers and aborts (exit 1) on ANY
// hit. This is the load-bearing control for unattended auto-publish: it runs locally
// pre-commit, in GitHub Actions, and in Netlify's build. Bias is toward blocking — a
// leak is catastrophic; a false block just skips one nightly publish and pings Josh.
//
// Hardened 2026-06-19 against an adversarial pass (Grok + Codex, different model
// families per the standing rule). Matching runs over CANONICAL variants of each line
// so obfuscations don't slip through: NFKC, homoglyph fold, zero-width strip, HTML
// entity + percent decode, tag strip, leetspeak fold, spacing/hyphen collapse, plus a
// base64-decode pass and a cross-line flattened pass. Every fix has a regression test.
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
const SKIP_DIRS = new Set(["node_modules", ".git", ".github", "dist"]); // dist scanned explicitly
const SKIP_FILES = new Set(["firewall-scan.mjs", "firewall-denylist.json", "firewall-denylist.public.json"]);
const CONTEXT_WINDOW = 48;

// ---- canonicalization ------------------------------------------------------

// Common Greek/Cyrillic homoglyphs → Latin. (NFKC already folds fullwidth/ligatures.)
const CONFUSABLES = {
  "Α": "a", "α": "a", "А": "a", "а": "a",
  "Β": "b", "β": "b", "В": "b", "в": "b",
  "С": "c", "с": "c",
  "Ε": "e", "ε": "e", "Е": "e", "е": "e",
  "Н": "h", "н": "h",
  "Ι": "i", "ι": "i", "І": "i", "і": "i",
  "Κ": "k", "κ": "k", "К": "k", "к": "k",
  "Μ": "m", "μ": "m", "М": "m", "м": "m",
  "Ο": "o", "ο": "o", "О": "o", "о": "o",
  "Ρ": "p", "ρ": "p", "Р": "p", "р": "p",
  "Τ": "t", "τ": "t", "Т": "t", "т": "t",
  "Χ": "x", "χ": "x", "Х": "x", "х": "x",
  "Υ": "y", "У": "y", "у": "y",
};
const LEET = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t" };

function mapConfusables(s) {
  let out = "";
  for (const ch of s) out += CONFUSABLES[ch] || ch;
  return out;
}
function stripZeroWidth(s) {
  return s.replace(/[­​‌‍⁠﻿]/g, "");
}
function decodeHtmlEntities(s) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => cp(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => cp(parseInt(d, 10)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, n) => named[n.toLowerCase()] ?? `&${n};`);
}
function cp(n) {
  try {
    if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return "";
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}
function decodePercent(s) {
  return s.replace(/(?:%[0-9a-fA-F]{2})+/g, (m) => {
    try {
      return decodeURIComponent(m);
    } catch {
      return m;
    }
  });
}
function stripTags(s) {
  return s.replace(/<[^>]*>/g, ""); // no space inserted — re-joins tag-split markers
}
function leetFold(s) {
  return s.replace(/[a-z0-9@$]+/g, (tok) => {
    if (!/[a-z]/.test(tok)) return tok; // leave pure numbers (4.05, 404) alone
    return tok.replace(/[013457]/g, (c) => LEET[c] || c).replace(/@/g, "a").replace(/\$/g, "s");
  });
}

// Produce the canonical variants every matcher runs against.
// "rendered" = tag-stripped (what a reader sees — catches tag-split markers).
// "source"   = tags/attributes preserved (catches markers hidden in href/alt/title).
function canonicalVariants(line) {
  const base = decodePercent(decodeHtmlEntities(stripZeroWidth(mapConfusables(line.normalize("NFKC")))));
  const rendered = stripTags(base).toLowerCase();
  const source = base.toLowerCase();
  const collapsed = rendered.replace(/[\s_-]+/g, " ");
  const leetCollapsed = leetFold(rendered).replace(/[\s_-]+/g, " ");
  const sourceCollapsed = source.replace(/[\s_-]+/g, " ");
  return { rendered, source, collapsed, leetCollapsed, sourceCollapsed };
}

// ---- denylist --------------------------------------------------------------

function readDenylistFile(p) {
  if (!existsSync(p)) {
    console.error(`firewall-scan: denylist not found at ${p}`);
    process.exit(2);
  }
  return readFileSync(p, "utf8");
}
function collapse(s) {
  return s.toLowerCase().replace(/[\s_-]+/g, " ");
}
function loadDenylist() {
  const raw = JSON.parse(readDenylistFile(DENYLIST_PATH));
  // Defense-in-depth: merge a PRIVATE denylist (personal names, internal codenames) kept
  // OUTSIDE any public repo and pointed to by FIREWALL_DENYLIST_EXTRA. Public repos ship only
  // generic secret/path patterns + already-public product names; the sensitive roster never
  // gets committed. Absent env / missing file => public-safe rules only (e.g. in CI).
  const extra = process.env.FIREWALL_DENYLIST_EXTRA;
  if (extra && existsSync(extra)) {
    try {
      const ex = JSON.parse(readFileSync(extra, "utf8"));
      for (const k of ["hardBlock", "hardBlockRegex", "contextWords", "contextAllow", "contextGated"]) {
        if (Array.isArray(ex[k])) raw[k] = [...(raw[k] || []), ...ex[k]];
      }
    } catch (e) {
      console.error(`firewall-scan: could not read FIREWALL_DENYLIST_EXTRA (${extra}): ${e.message}`);
      process.exit(2);
    }
  }
  return {
    hardBlock: (raw.hardBlock || []).map((s) => s.toLowerCase()),
    hardBlockCollapsed: (raw.hardBlock || []).map(collapse),
    hardBlockRegex: (raw.hardBlockRegex || []).map((r) => new RegExp(r, "gi")),
    contextGated: (raw.contextGated || []).map((g) => ({
      window: g.window || 45,
      near: (g.near || []).map((s) => s.toLowerCase()),
      re: new RegExp(`\\b(${(g.words || []).map(esc).join("|")})\\b`, "gi"),
    })),
    contextWords: (raw.contextWords || []).map((w) => new RegExp(`\\b${esc(w)}\\b`, "gi")),
    contextAllow: (raw.contextAllow || []).map((s) => s.toLowerCase()),
  };
}
function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---- matching --------------------------------------------------------------

function findSubstr(hay, needle, rule, out) {
  if (!needle) return;
  let i = hay.indexOf(needle);
  while (i !== -1) {
    out.push({ rule, term: needle.trim() });
    i = hay.indexOf(needle, i + needle.length);
  }
}

function allowedAt(variant, idx, end, allowPhrases) {
  for (const a of allowPhrases) {
    let i = variant.indexOf(a);
    while (i !== -1) {
      const aEnd = i + a.length;
      const beforeOk = i === 0 || !/[a-z0-9]/.test(variant[i - 1]);
      const afterOk = aEnd >= variant.length || !/[a-z0-9]/.test(variant[aEnd]);
      if (beforeOk && afterOk && i <= idx && end <= aEnd) return true;
      i = variant.indexOf(a, i + 1);
    }
  }
  return false;
}

function dedupe(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const k = `${f.rule}|${f.term.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Scan one raw line. Returns findings (deduped by rule+term).
function scanLine(line, dl, depth = 0) {
  const out = [];
  const { rendered, source, collapsed, leetCollapsed, sourceCollapsed } = canonicalVariants(line);

  // hardBlock substrings — collapsed catches spacing/hyphen; leet catches leetspeak;
  // sourceCollapsed catches markers hidden inside tag attributes (alt/title/href).
  for (const term of dl.hardBlockCollapsed) {
    for (const v of new Set([collapsed, leetCollapsed, sourceCollapsed])) findSubstr(v, term, "hardBlock", out);
  }

  // hardBlock regex — rendered + source (preserves @ . / in emails/paths/attrs) + collapsed forms.
  for (const re of dl.hardBlockRegex) {
    for (const v of new Set([rendered, source, collapsed, sourceCollapsed])) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(v)) !== null) {
        out.push({ rule: "hardBlockRegex", term: m[0] });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  }

  // context-gated acronyms — block only when a domain word is near.
  for (const g of dl.contextGated) {
    for (const v of [collapsed, leetCollapsed]) {
      g.re.lastIndex = 0;
      let m;
      while ((m = g.re.exec(v)) !== null) {
        const s = Math.max(0, m.index - g.window);
        const w = v.slice(s, m.index + m[0].length + g.window);
        if (g.near.some((n) => w.includes(n))) out.push({ rule: "contextGated", term: m[0] });
        if (m.index === g.re.lastIndex) g.re.lastIndex++;
      }
    }
  }

  // context words — block unless the specific occurrence sits inside an allow phrase.
  for (const re of dl.contextWords) {
    for (const v of [collapsed, leetCollapsed]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(v)) !== null) {
        if (!allowedAt(v, m.index, m.index + m[0].length, dl.contextAllow)) {
          out.push({ rule: "contextWord", term: m[0] });
        }
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  }

  // base64 — decode plausible blobs once and scan the decoded text.
  if (depth === 0) {
    const toks = line.match(/[A-Za-z0-9+/]{16,}={0,2}/g) || [];
    for (const t of toks) {
      let decoded;
      try {
        decoded = Buffer.from(t, "base64").toString("utf8");
      } catch {
        continue;
      }
      if (decoded && /^[\x09\x0a\x0d\x20-\x7e]+$/.test(decoded) && /[a-z]/i.test(decoded)) {
        for (const f of scanLine(decoded, dl, 1)) out.push({ ...f, rule: f.rule + "(base64)" });
      }
    }
  }

  return dedupe(out);
}

// ---- file walking ----------------------------------------------------------

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
    const base = path.basename(target);
    if (SKIP_FILES.has(base) || base.endsWith(".test.mjs")) return;
    if (TEXT_EXT.has(path.extname(target).toLowerCase())) yield target;
  }
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
    for (const f of scanLine(lines[i], dl)) out.push({ file, line: i + 1, ...f, snippet: lines[i].trim().slice(0, 140) });
  }
  // cross-line pass: catch multi-word markers split across newlines.
  const seenTerms = new Set(out.map((f) => `${f.rule}|${f.term.toLowerCase()}`));
  const flat = text.replace(/\s+/g, " ");
  for (const f of scanLine(flat, dl)) {
    const k = `${f.rule}|${f.term.toLowerCase()}`;
    if (!seenTerms.has(k)) {
      seenTerms.add(k);
      out.push({ file, line: 0, ...f, snippet: "(spans multiple lines)" });
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

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((e) => {
    console.error("firewall-scan internal error:", e);
    process.exit(2);
  });
}

export { scanLine, loadDenylist, canonicalVariants };
