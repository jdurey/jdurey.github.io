// build.mjs — static site generator for the portfolio.
// Reads content/*, renders HTML into dist/. No framework, no client JS.
// Run: node build.mjs   (npm run build)

import { readFile, writeFile, readdir, mkdir, rm, cp, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { homePage, workIndex, caseStudyPage, aboutPage, offerPage, skillsIndex } from "./scripts/render.mjs";

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

// The hire/offer page. Gated like a draft case study: built + linked + in the sitemap
// ONLY when its frontmatter says `publish: true`. publish:false → not emitted, not linked,
// no sitemap entry → the nightly auto-push can't take it live. Flipping the flag is the fire.
async function loadOffer() {
  const p = path.join(ROOT, "content/offer.md");
  if (!existsSync(p)) return null;
  const { data, content } = matter(await readFile(p, "utf8"));
  if (!data.publish) return null;
  return { ...data, _body: content, slug: data.slug || "hire" };
}

async function loadSite(items) {
  const cfg = JSON.parse(await readFile(path.join(ROOT, "content/site.json"), "utf8"));
  cfg.buildDate = fmtDate(FIXED_BUILD_DATE);
  // thesisHtml / heroLede may contain inline markdown emphasis
  cfg.thesisHtml = md.renderInline(cfg.thesis || "");
  cfg.ld = siteJsonLd(cfg);
  return cfg;
}

// Site-wide JSON-LD: a Person entity (for name/topic disambiguation across AI engines) + a WebSite.
// sameAs = AUTHORITATIVE external profiles only. Per GEO harden (2026-06-24): X is intentionally
// OMITTED until the eval-specialist handle is confirmed — linking a wrong/teacher-positioned handle
// poisons entity resolution. linkedin auto-included once site.json.links.linkedin is populated.
function siteJsonLd(cfg) {
  const base = cfg.url.replace(/\/$/, "");
  const same = [
    cfg.links?.github,
    cfg.links?.huggingface,
    cfg.links?.linkedin,
    cfg.links?.scholar,
    cfg.links?.orcid,
    cfg.links?.wikidata,
    cfg.links?.twitter, // stays empty until the eval handle is confirmed (harden gate)
  ].filter(Boolean);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}/#person`,
    name: cfg.name,
    url: base + "/",
    jobTitle: "Education AI Evaluation Specialist",
    description: cfg.description,
    knowsAbout: [
      "AI in education",
      "K-12 curriculum and assessment",
      "AI evaluation",
      "LLM quality assurance",
      "LLM-as-a-judge auditing",
      "Adversarial evaluation",
      "Reproducible cross-model audits",
    ],
    ...(cfg.links?.email ? { email: `mailto:${cfg.links.email}` } : {}),
    ...(same.length ? { sameAs: same } : {}),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base + "/",
    name: cfg.name,
    description: cfg.description,
    publisher: { "@id": `${base}/#person` },
    about: { "@id": `${base}/#person` },
  };
  return [person, website];
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
  const offer = await loadOffer();
  const site = await loadSite(items);
  if (offer) site.offerUrl = `/${offer.slug}/`;

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

  // skills index (links out to the public skills repo; each skill's source lives on GitHub)
  const skills = JSON.parse(await readFile(path.join(ROOT, "content/skills.json"), "utf8"));
  await emit("skills/index.html", skillsIndex({ site, skills }));

  // about
  const aboutRaw = await readFile(path.join(ROOT, "content/about.md"), "utf8");
  await emit("about/index.html", aboutPage({ site, bodyHtml: md.render(matter(aboutRaw).content) }));

  // hire / offer page (gated: only when publish:true)
  if (offer) await emit(`${offer.slug}/index.html`, offerPage({ site, offer, bodyHtml: md.render(offer._body) }));

  // assets
  await cp(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });

  // SEO surface (findability = traction)
  const urls = ["", "work/", "skills/", "about/", ...(offer ? [`${offer.slug}/`] : []), ...items.map((i) => `work/${i.slug}/`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.url.replace(/\/$/, "")}/${u}</loc></url>`).join("\n")}
</urlset>`;
  await emit("sitemap.xml", sitemap);
  // robots: explicitly welcome the AI retrieval + training crawlers (the retrieval-inclusion gate).
  // Allowlisting only helps if access would otherwise be ambiguous — harmless and best-practice here.
  const aiCrawlers = [
    "OAI-SearchBot", "ChatGPT-User", "GPTBot",       // OpenAI (search surface + user-fetch + training)
    "Google-Extended", "Googlebot",                   // Google AI / Gemini grounding + index
    "ClaudeBot", "Claude-User", "anthropic-ai",       // Anthropic / Claude
    "PerplexityBot", "Perplexity-User",               // Perplexity
    "Bingbot",                                         // Bing (secondary ChatGPT proxy)
    "Applebot-Extended",                               // Apple Intelligence
    "CCBot",                                           // Common Crawl (feeds many training sets)
  ];
  const robots = [
    ...aiCrawlers.map((ua) => `User-agent: ${ua}\nAllow: /`),
    `User-agent: *\nAllow: /`,
    `Sitemap: ${site.url.replace(/\/$/, "")}/sitemap.xml`,
    ``,
  ].join("\n");
  await emit("robots.txt", robots);

  // GitHub Pages: don't run Jekyll over our output
  await emit(".nojekyll", "");
  if (site.customDomain) await emit("CNAME", site.customDomain + "\n");

  console.log(`Built ${items.length} case studies + home/work/about → dist/`);
}

main().catch((e) => {
  console.error("BUILD FAILED:", e);
  process.exit(1);
});
