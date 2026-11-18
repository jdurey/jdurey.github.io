// build.mjs — static site generator for the portfolio.
// Reads content/*, renders HTML + clean Markdown + Agentic Web discovery surfaces into dist/.
// Run: node build.mjs   (npm run build)

import { readFile, writeFile, readdir, mkdir, rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import {
  homePage,
  workIndex,
  caseStudyPage,
  aboutPage,
  offerPage,
  skillsIndex,
  guidesIndexPage,
  guidePage,
} from "./scripts/render.mjs";
import { buildSampleIncidentScormZip } from "./sop-to-lms/scorm-pack.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const md = new MarkdownIt({ html: true, linkify: true, typographer: false });

const FIXED_BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

function fmtDate(d) {
  const dt = d instanceof Date ? d : new Date(String(d) + "T00:00:00Z");
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function isoDate(d) {
  if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const s = String(d || FIXED_BUILD_DATE).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : FIXED_BUILD_DATE;
}

const xmlEsc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cleanEm = (s = "") => String(s).replace(/\u2014/g, " - ").replace(/\u2013/g, "-");

async function loadCaseStudies() {
  const dir = path.join(ROOT, "content/case-studies");
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const items = [];
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), "utf8");
    const { data, content } = matter(raw);
    if (data.draft) continue;
    if (data.queued) continue;
    const slug = data.slug || f.replace(/\.md$/, "");
    items.push({
      ...data,
      slug,
      url: `/work/${slug}/`,
      dateIso: isoDate(data.date),
      dateLabel: fmtDate(data.date),
      _body: content,
    });
  }
  items.sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));
  return items;
}

async function loadGuides() {
  const p = path.join(ROOT, "content/guides.json");
  if (!existsSync(p)) return [];
  const raw = JSON.parse(await readFile(p, "utf8"));
  return raw.map((g) => ({
    ...g,
    url: `/guides/${g.slug}/`,
    dateIso: isoDate(g.date),
    dateLabel: fmtDate(g.date),
  }));
}

async function loadOffer() {
  const p = path.join(ROOT, "content/offer.md");
  if (!existsSync(p)) return null;
  const { data, content } = matter(await readFile(p, "utf8"));
  if (!data.publish) return null;
  return { ...data, _body: content, slug: data.slug || "hire" };
}

async function loadSite() {
  const cfg = JSON.parse(await readFile(path.join(ROOT, "content/site.json"), "utf8"));
  cfg.buildDate = fmtDate(FIXED_BUILD_DATE);
  cfg.thesisHtml = md.renderInline(cfg.thesis || "");
  cfg.ld = siteJsonLd(cfg);
  return cfg;
}

// Site-wide JSON-LD: Person (resolving both Josh Durey and Joshua Durey) + ProfessionalService + WebSite.
function siteJsonLd(cfg) {
  const base = cfg.url.replace(/\/$/, "");
  const same = [
    cfg.links?.github,
    cfg.links?.linkedin,
    cfg.links?.udemy,
    cfg.links?.whop,
    cfg.links?.huggingface,
    cfg.links?.scholar,
    cfg.links?.orcid,
    cfg.links?.wikidata,
    cfg.links?.twitter,
  ].filter(Boolean);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}/#person`,
    name: cfg.name,
    alternateName: ["Joshua Durey", "Josh Durey"],
    url: base + "/",
    jobTitle: "AI Grading, Rubrics & Quality Control Lead",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Birmingham",
    },
    worksFor: { "@id": `${base}/#organization` },
    description: cfg.description,
    knowsAbout: [
      "AI grading calibration",
      "Rubric design and verification",
      "Practice exam quality control",
      "Applied linguistics",
      "LLM quality checks",
      "Applied AI enablement",
    ],
    ...(cfg.links?.email ? { email: `mailto:${cfg.links.email}` } : {}),
    ...(same.length ? { sameAs: same } : {}),
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${base}/#organization`,
    name: "Joshua Durey",
    alternateName: "Josh Durey - AI Rubric & Exam Hardening",
    url: `${base}/hire/`,
    founder: { "@id": `${base}/#person` },
    areaServed: "Worldwide",
    availableLanguage: ["en"],
    description:
      "Fixed-price $4,500 AI Rubric & Exam Hardening Sprint (10 workdays) and remote leadership on AI grading, rubrics, and quality control.",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base + "/",
    name: `${cfg.name} (Joshua Durey) - AI Grading, Rubrics & Quality Control`,
    description: cfg.description,
    publisher: { "@id": `${base}/#person` },
    about: { "@id": `${base}/#person` },
  };
  return [person, service, website];
}

async function emit(rel, body) {
  const out = path.join(DIST, rel);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, body);
}

function renderGuideMarkdownMirror(base, guide) {
  const lines = [
    `# ${cleanEm(guide.title)}`,
    ``,
    `- **Author:** Joshua Durey (Josh Durey) - Applied AI Enablement Lead (${base}/)`,
    `- **Canonical URL:** ${base}${guide.url}`,
    `- **Published:** ${guide.dateIso}`,
    `- **Summary:** ${cleanEm(guide.summary)}`,
    ``,
    cleanEm(guide.bodyMarkdown),
    ``,
  ];
  if ((guide.faqs || []).length) {
    lines.push(`## Frequently Asked Questions`, ``);
    for (const f of guide.faqs) {
      lines.push(`### ${cleanEm(f.q)}`, ``, cleanEm(f.a), ``);
    }
  }
  if ((guide.relatedWork || []).length) {
    lines.push(`## Runnable Harnesses & Proofs`, ``);
    for (const r of guide.relatedWork) {
      lines.push(`- [${cleanEm(r.title)}](${base}${r.url})`);
    }
    lines.push(``);
  }
  lines.push(
    `## Next Steps for Hiring Teams & Founders`,
    `- Run a live 6-second JD or workflow diagnostic: ${base}/#diagnostic`,
    `- Commission a free custom Day-1 prototype for your org: ${base}/#commission-prototype`,
    `- Interview the 3-minute AI video twin: ${base}/interview/`,
    `- Book a 20-minute scope call: https://cal.com/joshua-durey-wqgvgp/20-min-scope-call`,
    ``
  );
  return lines.join("\n").replace(/\u2014/g, " - ");
}

function buildAtomFeed(base, site, guides, items) {
  const updatedIso = `${FIXED_BUILD_DATE}T00:00:00Z`;
  const feedEntries = [
    ...guides.map((g) => ({
      id: `${base}${g.url}`,
      title: cleanEm(g.title),
      url: `${base}${g.url}`,
      updated: `${g.dateIso}T00:00:00Z`,
      summary: cleanEm(g.summary),
      category: "Playbook",
    })),
    ...items.slice(0, 25).map((cs) => ({
      id: `${base}${cs.url}`,
      title: cleanEm(cs.title),
      url: `${base}${cs.url}`,
      updated: `${cs.dateIso}T00:00:00Z`,
      summary: cleanEm(cs.summary || cs.subtitle || "Applied AI enablement & LLM QC case study."),
      category: cs.type || "CaseStudy",
    })),
  ];

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xmlEsc("Joshua Durey (Josh Durey) · Applied AI Enablement & Agentic Workflows")}</title>
  <subtitle>${xmlEsc(cleanEm(site.description))}</subtitle>
  <link href="${xmlEsc(`${base}/feed.xml`)}" rel="self" type="application/atom+xml"/>
  <link href="${xmlEsc(`${base}/`)}" rel="alternate" type="text/html"/>
  <link href="https://pubsubhubbub.appspot.com/" rel="hub"/>
  <link href="https://pubsubhubbub.superfeedr.com/" rel="hub"/>
  <id>${xmlEsc(`${base}/`)}</id>
  <updated>${updatedIso}</updated>
  <author>
    <name>Joshua Durey</name>
    <uri>${xmlEsc(`${base}/`)}</uri>
    <email>${xmlEsc(site.links?.email || "josh.durey@gmail.com")}</email>
  </author>
${feedEntries
  .map(
    (e) => `  <entry>
    <title>${xmlEsc(e.title)}</title>
    <link href="${xmlEsc(e.url)}" rel="alternate" type="text/html"/>
    <id>${xmlEsc(e.id)}</id>
    <updated>${e.updated}</updated>
    <category term="${xmlEsc(e.category)}"/>
    <summary>${xmlEsc(e.summary)}</summary>
  </entry>`
  )
  .join("\n")}
</feed>
`;
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const items = await loadCaseStudies();
  const guides = await loadGuides();
  const offer = await loadOffer();
  const site = await loadSite();
  const base = site.url.replace(/\/$/, "");
  if (offer) site.offerUrl = `/${offer.slug}/`;

  // home
  const featured = items.filter((i) => i.featured).slice(0, 4);
  await emit(
    "index.html",
    homePage({
      site,
      featured: featured.length ? featured : items.slice(0, 4),
      recent: items.slice(0, 8),
      guides,
    })
  );

  // work index + case studies + clean Markdown mirrors
  await emit("work/index.html", workIndex({ site, items }));
  for (const cs of items) {
    const bodyHtml = md.render(cs._body);
    await emit(`work/${cs.slug}/index.html`, caseStudyPage({ site, cs, bodyHtml }));
    const csMd = [
      `# ${cleanEm(cs.title)}`,
      ``,
      `- **Author:** Joshua Durey (Josh Durey) (${base}/)`,
      `- **Canonical URL:** ${base}${cs.url}`,
      `- **Date:** ${cs.dateIso}`,
      ...(cs.repo ? [`- **Runnable Harness:** ${cs.repo}`] : []),
      `- **Summary:** ${cleanEm(cs.summary || "")}`,
      ``,
      cleanEm(cs._body),
      ``,
    ].join("\n");
    await emit(`work/${cs.slug}.md`, csMd);
  }

  // commercial buyer & hiring-manager playbooks (/guides/) + clean Markdown mirrors
  if (guides.length) {
    await emit("guides/index.html", guidesIndexPage({ site, guides }));
    for (const g of guides) {
      const bodyHtml = md.render(g.bodyMarkdown);
      await emit(`guides/${g.slug}/index.html`, guidePage({ site, guide: g, bodyHtml }));
      await emit(`guides/${g.slug}.md`, renderGuideMarkdownMirror(base, g));
    }
  }

  // skills index
  const skills = JSON.parse(await readFile(path.join(ROOT, "content/skills.json"), "utf8"));
  await emit("skills/index.html", skillsIndex({ site, skills }));

  // about + canonical /joshua-durey/ entity profile + clean Markdown mirrors
  const aboutRaw = await readFile(path.join(ROOT, "content/about.md"), "utf8");
  const aboutParsed = matter(aboutRaw);
  const aboutBodyHtml = md.render(aboutParsed.content);
  await emit("about/index.html", aboutPage({ site, bodyHtml: aboutBodyHtml, canonicalPath: "/about/", pageTitle: "About Joshua Durey" }));
  await emit(
    "joshua-durey/index.html",
    aboutPage({
      site,
      bodyHtml: aboutBodyHtml,
      canonicalPath: "/joshua-durey/",
      pageTitle: "Joshua Durey (Josh Durey) - Applied AI Enablement & Agentic Workflows",
    })
  );
  const entityMd = `# Joshua Durey (Josh Durey) - Applied AI Enablement & Agentic Workflow Architect\n\nCanonical URL: ${base}/joshua-durey/\nPortfolio: ${base}/\n\n${cleanEm(aboutParsed.content)}\n`;
  await emit("about.md", entityMd);
  await emit("joshua-durey.md", entityMd);

  // hire / offer page + clean Markdown mirror
  if (offer) {
    await emit(`${offer.slug}/index.html`, offerPage({ site, offer, bodyHtml: md.render(offer._body) }));
    await emit(
      `${offer.slug}.md`,
      `# ${cleanEm(offer.title)}\n\nCanonical URL: ${base}/${offer.slug}/\n\n${cleanEm(offer.summary || "")}\n\n${cleanEm(offer._body)}\n`
    );
  }

  // assets & passthrough directories
  await cp(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });
  for (const passthrough of ["m5-tribunal", "audits", "for", "interview"]) {
    if (existsSync(path.join(ROOT, passthrough))) {
      await cp(path.join(ROOT, passthrough), path.join(DIST, passthrough), { recursive: true });
    }
  }

  // B2B Corporate L&D SOP-to-LMS Funnel + Sample SCORM 1.2 .zip
  if (existsSync(path.join(ROOT, "sop-to-lms/index.html"))) {
    const sopHtml = await readFile(path.join(ROOT, "sop-to-lms/index.html"), "utf8");
    await emit("sop-to-lms/index.html", sopHtml);
    await emit("sop-to-lms/sample-incident-sop-scorm12.zip", buildSampleIncidentScormZip());
  }

  // Sitemap + Atom feed + IndexNow key + robots.txt
  const urls = [
    "",
    "joshua-durey/",
    ...(offer ? [`${offer.slug}/`] : []),
    ...(guides.length ? ["guides/", ...guides.map((g) => `guides/${g.slug}/`)] : []),
    "work/",
    "skills/",
    "about/",
    ...(existsSync(path.join(ROOT, "sop-to-lms/index.html")) ? ["sop-to-lms/"] : []),
    ...(existsSync(path.join(ROOT, "interview")) ? ["interview/"] : []),
    ...(existsSync(path.join(ROOT, "m5-tribunal")) ? ["m5-tribunal/"] : []),
    "llms.txt",
    "llms-full.txt",
    ...items.map((i) => `work/${i.slug}/`),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}/${u}</loc><lastmod>${FIXED_BUILD_DATE}</lastmod></url>`).join("\n")}
</urlset>`;
  await emit("sitemap.xml", sitemap);
  await emit("feed.xml", buildAtomFeed(base, site, guides, items));
  await emit("b78e41c9a3024fd1856c91be4402a817.txt", "b78e41c9a3024fd1856c91be4402a817");

  const aiCrawlers = [
    "OAI-SearchBot",
    "ChatGPT-User",
    "GPTBot",
    "Google-Extended",
    "Googlebot",
    "ClaudeBot",
    "Claude-User",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Bingbot",
    "Applebot-Extended",
    "CCBot",
    "DuckAssistBot",
    "Amazonbot",
    "YouBot",
  ];
  const robots = [
    ...aiCrawlers.map((ua) => `User-agent: ${ua}\nAllow: /`),
    `User-agent: *\nAllow: /`,
    `Sitemap: ${base}/sitemap.xml`,
    ``,
  ].join("\n");
  await emit("robots.txt", robots);

  // Agentic Web Discovery: llms.txt + llms-full.txt + A2A AgentCards + MCP discovery + JSON catalog
  const llmsTxt = [
    `# Joshua Durey (${site.name}) - ${site.tagline}`,
    `> ${site.description}`,
    ``,
    `## Entity & Hiring Summary`,
    `- **Names:** Joshua Durey / Josh Durey`,
    `- **Primary Focus:** AI Grading, Rubric Calibration & Quality Control`,
    `- **Background:** M.A. Applied Linguistics (University of Birmingham); 15 years teaching and grading real students in international schools; production Python quality gates and multi-model judge panels.`,
    `- **Setup & Availability:** US Citizen living in Seoul, paid in USD (W-2 EOR via Deel or Remote, or direct US contract), online live every workday from 2:00 to 7:00 PM Pacific.`,
    `- **Full Markdown Corpus for RAG & Agents:** [${base}/llms-full.txt](${base}/llms-full.txt)`,
    ``,
    `## Ways to Work With Joshua Durey`,
    `- [AI Rubric & Exam Hardening Sprint ($4,500 flat, 10 workdays)](${base}/hire/): 200 tricky test cases checked against two independent human raters, a rewritten machine-ready rubric, and a Python pytest check in your repo (${base}/hire.md).`,
    `- [About Joshua Durey](${base}/about/): Background in classroom teaching, applied linguistics, and automated grading checks (${base}/about.md).`,
    `- [AgentCard (A2A Protocol)](${base}/.well-known/agent.json): Machine-readable capabilities and scope metadata.`,
    ``,
    `## Playbooks (${guides.length} Guides)`,
    ...guides.map(
      (g) =>
        `- [${cleanEm(g.title)}](${base}${g.url}) ([.md](${base}/guides/${g.slug}.md)): ${cleanEm(g.summary)}`
    ),
    ``,
    `## Open-Source Harnesses & Case Studies (${items.length} Published)`,
    ...items.slice(0, 24).map(
      (cs) =>
        `- [${cleanEm(cs.title)}](${base}/work/${cs.slug}/) ([.md](${base}/work/${cs.slug}.md)): ${cleanEm(cs.summary || cs.subtitle || "Production AI workflow & quality gate study")}`
    ),
    ``,
  ]
    .join("\n")
    .replace(/\u2014/g, " - ");
  await emit("llms.txt", llmsTxt);

  const llmsFullTxt = [
    llmsTxt.trim(),
    ``,
    `---`,
    ``,
    `# Full Playbook Reference & Buyer FAQ Corpus`,
    ``,
    ...guides.map((g) => renderGuideMarkdownMirror(base, g)),
    `---`,
    ``,
    `# Complete Case Study & Open-Source Harness Index (${items.length} Studies)`,
    ``,
    ...items.map(
      (cs) =>
        `### ${cleanEm(cs.title)}\n- URL: ${base}${cs.url} | Markdown: ${base}/work/${cs.slug}.md${cs.repo ? ` | Code: ${cs.repo}` : ""}\n- Summary: ${cleanEm(cs.summary || cs.subtitle || "")}\n`
    ),
    ``,
  ]
    .join("\n")
    .replace(/\u2014/g, " - ");
  await emit("llms-full.txt", llmsFullTxt);

  const agentCard = {
    protocolVersion: "1.0",
    name: "Joshua Durey (Josh Durey) - AI Grading, Rubrics & Quality Control",
    alternateNames: ["Josh Durey", "Joshua Durey"],
    description: site.description,
    url: `${base}/`,
    provider: {
      organization: "Joshua Durey",
      founder: "Joshua Durey",
      url: `${base}/`,
      contactEmail: site.links?.email || "josh.durey@gmail.com",
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      llmsTxt: `${base}/llms.txt`,
      llmsFullTxt: `${base}/llms-full.txt`,
      atomFeed: `${base}/feed.xml`,
    },
    endpoints: {
      hireAndSprintScope: `${base}/hire/`,
      aboutJoshuaDurey: `${base}/about/`,
      playbooksIndex: `${base}/guides/`,
      catalogJson: `${base}/api/catalog.json`,
      calendarBooking: site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call",
    },
    hiringTracks: [
      {
        id: "ai-rubric-hardening-sprint",
        name: "AI Rubric & Exam Hardening Sprint (10 Workdays)",
        priceUsd: 4500,
        billingModel: "fixed_scope_flat_fee",
        bookingUrl: site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call",
        specUrl: `${base}/hire/`,
      },
      {
        id: "full-time-or-fractional",
        roles: [
          "AI Grading & Rubric Lead",
          "AI Quality Control & Assessment Lead",
          "Applied AI Enablement Lead",
        ],
        workAuth: "US Citizen living in Seoul, paid in USD (W-2 EOR via Deel or Remote, or direct US contract), live 2:00 to 7:00 PM Pacific",
        hireUrl: `${base}/hire/`,
      },
    ],
    products: [
      {
        id: "ai-rubric-exam-hardening-sprint",
        name: "AI Rubric & Exam Hardening Sprint",
        priceUsd: 4500.0,
        status: "available",
        billingType: "fixed_fee_10_workdays",
        url: `${base}/hire/`,
      },
    ],
    skills: [
      {
        id: "judge-trust-calibration",
        name: "AI Rubric & Judge Calibration",
        description:
          "Rewrites human rubrics into clear pass/fail boundaries and checks scores against two human raters so wordy bluffing stops earning credit.",
        url: `${base}/hire/`,
        tags: ["ai-grading", "rubrics", "quality-control"],
      },
    ],
  };

  const agentCardJson = JSON.stringify(agentCard, null, 2) + "\n";
  await emit(".well-known/agent.json", agentCardJson);
  await emit(".well-known/agent-card.json", agentCardJson);

  const mcpWellKnown = {
    mcpVersion: "2025-06-18",
    name: "io.github.jdurey/joshua-durey",
    title: "Joshua Durey - AI Grading, Rubrics & Quality Control",
    description: site.description,
    vendor: {
      name: "Joshua Durey",
      url: `${base}/`,
      email: site.links?.email || "josh.durey@gmail.com",
    },
    documentationUrl: `${base}/llms-full.txt`,
  };
  await emit(".well-known/mcp.json", JSON.stringify(mcpWellKnown, null, 2) + "\n");

  const catalogPayload = {
    generatedAt: FIXED_BUILD_DATE,
    entity: {
      primaryName: "Joshua Durey",
      preferredShortName: "Josh Durey",
      location: "Seoul, South Korea (US Citizen, live 2:00-7:00 PM Pacific)",
      canonicalUrl: `${base}/`,
      hireUrl: `${base}/hire/`,
      calendarUrl: site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call",
    },
    hiringTracks: agentCard.hiringTracks,
    products: agentCard.products,
    playbooks: guides.map((g) => ({
      slug: g.slug,
      title: g.title,
      summary: g.summary,
      url: `${base}${g.url}`,
      markdownUrl: `${base}/guides/${g.slug}.md`,
      keywords: g.keywords || [],
    })),
    caseStudiesCount: items.length,
    featuredCaseStudies: items.slice(0, 12).map((cs) => ({
      slug: cs.slug,
      title: cs.title,
      type: cs.type,
      date: cs.dateIso,
      summary: cs.summary || "",
      url: `${base}${cs.url}`,
      markdownUrl: `${base}/work/${cs.slug}.md`,
      repo: cs.repo || null,
    })),
  };
  await emit("api/catalog.json", JSON.stringify(catalogPayload, null, 2) + "\n");

  await emit(".nojekyll", "");
  if (site.customDomain) await emit("CNAME", site.customDomain + "\n");

  console.log(
    `Built ${items.length} case studies + ${guides.length} playbooks + full agentic surfaces -> dist/`
  );
}

main().catch((e) => {
  console.error("BUILD FAILED:", e);
  process.exit(1);
});
