// build.mjs — static site generator for the portfolio.
// Reads content/*, renders HTML into dist/. No framework, no client JS.
// Run: node build.mjs   (npm run build)

import { readFile, writeFile, readdir, mkdir, rm, cp, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { homePage, workIndex, caseStudyPage, aboutPage } from "./scripts/render.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const FIXED_BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

function fmtDate(d) {
  // YAML parses unquoted ISO dates (date: 2026-06-19) into Date objects; build/env dates arrive as strings.
  const dt = d instanceof Date ? d : new Date(String(d) + "T00:00:00Z");
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

async function loadCaseStudies() {
  const dir = path.join(ROOT, "content/case-studies");
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const items = [];
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), "utf8");
    const { data, content } = matter(raw);
    if (data.draft) continue; // not ready / needs review
    if (data.queued) continue; // ready but held for paced release (the nightly drips one at a time)
    const slug = data.slug || f.replace(/\.md$/, "");
    items.push({
      ...data,
      slug,
      url: `/work/${slug}/`,
      dateLabel: fmtDate(data.date),
      _body: content,
    });
  }
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items;
}

async function loadSite(items) {
  const cfg = JSON.parse(await readFile(path.join(ROOT, "content/site.json"), "utf8"));
  cfg.buildDate = fmtDate(FIXED_BUILD_DATE);
  // thesisHtml / heroLede may contain inline markdown emphasis
  cfg.thesisHtml = md.renderInline(cfg.thesis || "");
  return cfg;
}

async function emit(rel, html) {
  const out = path.join(DIST, rel);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const items = await loadCaseStudies();
  const site = await loadSite(items);

  // home
  const featured = items.filter((i) => i.featured).slice(0, 4);
  await emit("index.html", homePage({ site, featured: featured.length ? featured : items.slice(0, 4), recent: items.slice(0, 8) }));

  // work index
  await emit("work/index.html", workIndex({ site, items }));

  // case studies
  for (const cs of items) {
    const bodyHtml = md.render(cs._body);
    await emit(`work/${cs.slug}/index.html`, caseStudyPage({ site, cs, bodyHtml }));
  }

  // about
  const aboutRaw = await readFile(path.join(ROOT, "content/about.md"), "utf8");
  await emit("about/index.html", aboutPage({ site, bodyHtml: md.render(matter(aboutRaw).content) }));

  // assets
  await cp(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });

  // SEO surface (findability = traction)
  const urls = ["", "work/", "about/", ...items.map((i) => `work/${i.slug}/`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.url.replace(/\/$/, "")}/${u}</loc></url>`).join("\n")}
</urlset>`;
  await emit("sitemap.xml", sitemap);
  await emit("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.url.replace(/\/$/, "")}/sitemap.xml\n`);

  // GitHub Pages: don't run Jekyll over our output
  await emit(".nojekyll", "");
  if (site.customDomain) await emit("CNAME", site.customDomain + "\n");

  console.log(`Built ${items.length} case studies + home/work/about → dist/`);
}

main().catch((e) => {
  console.error("BUILD FAILED:", e);
  process.exit(1);
});
