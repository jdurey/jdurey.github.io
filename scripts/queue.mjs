#!/usr/bin/env node
// queue.mjs — see and manage the drip queue.
//   node scripts/queue.mjs              # status: live / queued / drafts + next release
//   node scripts/queue.mjs add <slug>   # hold a live piece for paced release (queued: true)
//   node scripts/queue.mjs now <slug>   # release a queued piece immediately (queued: false)
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "content/case-studies");
const STATE = path.join(ROOT, ".nightly-state.json");
const EVERY = parseInt(process.env.RELEASE_EVERY_DAYS || "3", 10);
const [cmd, slug] = process.argv.slice(2);

async function fileFor(slug) {
  const direct = path.join(DIR, `${slug}.md`);
  if (existsSync(direct)) return direct;
  for (const f of (await readdir(DIR)).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(await readFile(path.join(DIR, f), "utf8"));
    if (data.slug === slug) return path.join(DIR, f);
  }
  return null;
}

async function setQueued(slug, val) {
  const file = await fileFor(slug);
  if (!file) return console.error(`no case study with slug "${slug}"`);
  let raw = await readFile(file, "utf8");
  if (/^queued:\s*(true|false)\s*$/m.test(raw)) raw = raw.replace(/^queued:\s*(true|false)\s*$/m, `queued: ${val}`);
  else raw = raw.replace(/^---\n/, `---\nqueued: ${val}\n`); // insert into frontmatter
  await writeFile(file, raw);
  console.log(`${path.basename(file)} -> queued: ${val}`);
}

if (cmd === "add" && slug) await setQueued(slug, true);
else if (cmd === "now" && slug) await setQueued(slug, false);
else {
  const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
  const live = [], queued = [], drafts = [];
  for (const f of (await readdir(DIR)).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(await readFile(path.join(DIR, f), "utf8"));
    const tag = data.slug || f.replace(/\.md$/, "");
    if (data.draft) drafts.push(tag);
    else if (data.queued) queued.push(tag);
    else live.push(tag);
  }
  const last = state.lastReleaseDate;
  let nextNote = "ready to release one now";
  if (last) {
    const since = Math.round((new Date() - new Date(last + "T00:00:00Z")) / 86400000);
    nextNote = since >= EVERY ? "ready to release one now" : `next release in ${EVERY - since} day(s)`;
  }
  console.log(`LIVE (${live.length}):    ${live.join(", ") || "—"}`);
  console.log(`QUEUED (${queued.length}):  ${queued.join(", ") || "—"}`);
  console.log(`DRAFTS (${drafts.length}):  ${drafts.join(", ") || "—"}`);
  console.log(`\nCadence: 1 piece per ${EVERY} day(s). Last release: ${last || "never"}. ${queued.length ? nextNote : "queue empty"}.`);
}
