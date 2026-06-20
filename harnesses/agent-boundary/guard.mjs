#!/usr/bin/env node
// guard.mjs — RUNG 1: the deterministic path-guard regression gate. The precision-critical core.
//
// A data-boundary guard decides, for a requested path, ALLOW (inside the allowed zone) or DENY
// (anywhere else). The whole EscapeRoute class (CVE-2025-53109 / -53110) is guards that look correct
// on obvious paths and leak on a structural bypass: a symlink out of the allowed zone, or a sibling
// directory whose name shares the allowed prefix. So we ship TWO guards and run the same vector
// battery through both — a NAIVE guard (lexical normalize + prefix string check, no symlink
// resolution) and a HARDENED guard (real-path resolution + separator-bounded containment, fail
// closed). A "leak" is objective: the guard allowed a request whose read returns a sealed canary.
//
// This rung is pure and deterministic — no model, no network — so its numbers recompute exactly.

import { writeFile, readFile, realpath as realpathAsync } from "node:fs/promises";
import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWorkspace } from "./domain/world.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "results");

// ---- the two guards -----------------------------------------------------------------------------

// NAIVE: normalize the requested path lexically, then check it starts with the allowed root as a
// string. Does NOT resolve symlinks, and the prefix test has no separator boundary. This is the
// EscapeRoute bug shape: '..' traversal is caught by normalization, but a same-prefix sibling and an
// in-zone symlink both slip through.
function naiveGuard(requested, ctx) {
  try {
    const resolved = path.resolve(ctx.root, requested);
    return resolved.startsWith(ctx.allowedRoot) ? "allow" : "deny";
  } catch { return "deny"; }
}

// HARDENED: resolve the requested path to a REAL path (following symlinks on every existing segment),
// resolve the allowed root the same way, then require containment with an explicit separator
// boundary. Any error -> DENY (fail closed). This closes both the symlink and the prefix-confusion
// holes without over-blocking ordinary in-zone reads.
function realpathBoundary(p) {
  // realpath the deepest existing ancestor, then re-attach the missing tail, so non-existent paths
  // are still resolved through any symlinked parents instead of throwing.
  let cur = p;
  const tail = [];
  for (;;) {
    try { return path.join(realpathSync(cur), ...tail.reverse()); }
    catch {
      const parent = path.dirname(cur);
      if (parent === cur) throw new Error("no real ancestor");
      tail.push(path.basename(cur));
      cur = parent;
    }
  }
}
function contains(baseReal, targetReal) {
  return targetReal === baseReal || targetReal.startsWith(baseReal + path.sep);
}
function hardenedGuard(requested, ctx) {
  try {
    if (typeof requested !== "string" || requested.includes("\0")) return "deny";
    const real = realpathBoundary(path.resolve(ctx.root, requested));
    const allowedReal = realpathSync(ctx.allowedRoot);
    return contains(allowedReal, real) ? "allow" : "deny";
  } catch { return "deny"; }
}

// ---- objective leak detection -------------------------------------------------------------------
// A guard's decision is only half the story; the harm is a sealed canary reaching the agent. So when
// a guard ALLOWS, we perform the read it authorised and check the bytes for any sealed token.
async function readLeak(requested, ctx) {
  try {
    const abs = path.resolve(ctx.root, requested);
    const body = await readFile(abs, "utf8");
    for (const tok of ctx.sealedTokens) if (body.includes(tok)) return { read: true, leaked: true, token: tok };
    return { read: true, leaked: false, token: null };
  } catch { return { read: false, leaked: false, token: null }; }
}

async function main() {
  const ctx = await buildWorkspace();
  const { vectors } = ctx.policy;

  const rows = [];
  for (const v of vectors) {
    const nDec = naiveGuard(v.requested, ctx);
    const hDec = hardenedGuard(v.requested, ctx);
    const nLeak = nDec === "allow" ? await readLeak(v.requested, ctx) : { read: false, leaked: false, token: null };
    const hLeak = hDec === "allow" ? await readLeak(v.requested, ctx) : { read: false, leaked: false, token: null };
    rows.push({
      id: v.id, class: v.class, requested: v.requested, expect: v.expect, note: v.note,
      naive: { decision: nDec, correct: nDec === v.expect, leaked: nLeak.leaked, token: nLeak.token },
      hardened: { decision: hDec, correct: hDec === v.expect, leaked: hLeak.leaked, token: hLeak.token },
    });
  }

  const denyVectors = rows.filter((r) => r.expect === "deny");
  const summarise = (g) => ({
    correct: rows.filter((r) => r[g].correct).length,
    total: rows.length,
    leaks: rows.filter((r) => r[g].leaked).length,
    denyRecall: denyVectors.length ? denyVectors.filter((r) => r[g].decision === "deny").length / denyVectors.length : 1,
  });

  const out = {
    generatedNote: "Layer 1: deterministic path-guard battery. naive = lexical normalize + prefix string check (no symlink resolution); hardened = realpath + separator-bounded containment, fail closed. 'leaked' means the guard allowed a request whose read returned a sealed canary. Pure function of policy.json — recompute with `node guard.mjs`.",
    canaries: ctx.canaries,
    naive: summarise("naive"),
    hardened: summarise("hardened"),
    rows,
  };
  await writeFile(path.join(OUT, "guard.json"), JSON.stringify(out, null, 2));

  // console report
  console.log(`\n=== RUNG 1: PATH-GUARD BATTERY (${rows.length} vectors; ${denyVectors.length} must DENY) ===`);
  console.log("vec  class            expect  naive       hardened    requested");
  for (const r of rows) {
    const f = (g) => `${r[g].decision}${r[g].leaked ? "·LEAK" : r[g].correct ? "·ok" : "·MISS"}`.padEnd(11);
    console.log(`${r.id}  ${r.class.padEnd(16)} ${r.expect.padEnd(6)} ${f("naive")} ${f("hardened")} ${r.requested}`);
  }
  console.log(`\nnaive:    deny-recall ${out.naive.denyRecall.toFixed(2)}  · ${out.naive.leaks} canary leak(s)`);
  console.log(`hardened: deny-recall ${out.hardened.denyRecall.toFixed(2)}  · ${out.hardened.leaks} canary leak(s)`);
  console.log(`\nWrote results/guard.json`);
}

main().catch((e) => { console.error("guard failed:", e); process.exit(1); });
