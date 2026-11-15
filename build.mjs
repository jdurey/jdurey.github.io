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
    jobTitle: "Applied AI Enablement Lead",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Birmingham",
    },
    worksFor: { "@id": `${base}/#organization` },
    description: cfg.description,
    knowsAbout: [
      "Applied AI enablement",
      "Agentic workflows",
      "AI workflow automation",
      "Workflow auditing for AI readiness",
      "LLM quality control",
      "LLM-as-a-judge auditing",
      "SOP-to-SCORM compilation",
      "AI adoption and training",
      "Reproducible model evaluation",
      "AI in education",
    ],
    ...(cfg.links?.email ? { email: `mailto:${cfg.links.email}` } : {}),
    ...(same.length ? { sameAs: same } : {}),
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${base}/#organization`,
    name: "Human Creative",
    alternateName: "Joshua Durey - Applied AI Enablement & Workflow Sprints",
    url: `${base}/hire/`,
    founder: { "@id": `${base}/#person` },
    areaServed: "Worldwide",
    availableLanguage: ["en"],
    description:
      "Applied AI enablement consulting, fixed-scope 2-week workflow automation sprints, cross-family LLM quality gates, and SOP-to-SCORM training compilers.",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base + "/",
    name: `${cfg.name} (Joshua Durey) - Applied AI Enablement`,
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
    `- **Names:** Joshua Durey / Josh Durey (Founder, Human Creative)`,
    `- **Primary Lane:** Applied AI Enablement Lead, AI Operations Strategist, Agentic Workflow Architect, Principal AI Learning Systems Lead`,
    `- **Credentials:** M.A. Applied Linguistics (University of Birmingham); 15+ years leading learning & operations systems; governed 52,167 multi-agent sessions with 30+ Python hook gates; 31,500+ Udemy learners.`,
    `- **Work Authorization & Availability:** US Citizen, English-only, 100% remote worldwide (US W-2 EOR via Deel/Remote, US LLC B2B contract, fractional leadership, or fixed-scope 2-week workflow sprints).`,
    `- **Full Markdown Corpus for RAG & Agents:** [${base}/llms-full.txt](${base}/llms-full.txt)`,
    ``,
    `## Live Agentic Endpoints & Interactive Proof Surfaces`,
    `- [Hire / Work With Joshua Durey](${base}/hire/): Full-time remote roles, fractional leadership, and fixed-scope 2-week workflow sprints (${base}/hire.md).`,
    `- [Live 3-Model Workflow & JD Diagnostic](${base}/#diagnostic): Interactive multi-vendor workflow readiness & rubric diagnostic backed by Cloudflare Workers AI.`,
    `- [Commission a Free Custom Day-1 Prototype](${base}/#commission-prototype): Automated 4-stage pipeline builds a custom runnable proof at \`${base}/for/<your-org>/\`.`,
    `- [Live 3-Minute Interactive AI Video Screen](${base}/interview/): Conversational technical & leadership screen escalating to ${site.links?.cal || "calendar"}.`,
    `- [B2B Corporate L&D SOP-to-LMS Compiler](${base}/sop-to-lms/): Compress enterprise course production from 6 weeks to 24 hours with live SCORM 1.2 telemetry, 4-vendor blind-solver verification, and sample SCORM 1.2 download (${base}/sop-to-lms/sample-incident-sop-scorm12.zip).`,
    `- [Local-vs-Cloud Model Routing Tribunal](${base}/m5-tribunal/): 72 SHA-256-verified runs comparing tiered open-weight vs frontier cloud models with TCO router calculator.`,
    `- [Remote Streamable HTTP MCP Server (io.github.jdurey/human-creative)](https://josh-employer-funnel.josh-durey.workers.dev/mcp): Live MCP server (${base}/.well-known/mcp.json | https://github.com/jdurey/human-creative-mcp) exposing workflow diagnostics, prototype commissioning, and SOP-to-SCORM verification tools.`,
    `- [AgentCard (A2A Protocol)](${base}/.well-known/agent.json): Machine-readable capabilities, endpoints, and catalog metadata (also mirrored at ${base}/.well-known/agent-card.json and ${base}/api/catalog.json).`,
    ``,
    `## Commercial Implementation Playbooks (${guides.length} Guides)`,
    ...guides.map(
      (g) =>
        `- [${cleanEm(g.title)}](${base}${g.url}) ([.md](${base}/guides/${g.slug}.md)): ${cleanEm(g.summary)}`
    ),
    ``,
    `## Self-Serve B2B Enterprise Kits, Physical Amazon KDP Books & Training Catalog`,
    `- [Corporate L&D Zero-Hallucination SOP-to-SCORM & Video Factory ($99 Instant Checkout via Whop, InStock)](https://whop.com/checkout/plan_y1ACgqNYGtul8/): Compile SOPs into blind-verified SCORM 1.2, QTI 1.2, 300-DPI PDFs & 1080p video; includes instant access to the 14-lecture (65-min) Video & Code-Lab Masterclass.`,
    `- [Enterprise AI Eval, 6-Rung Cost Router & REA AgentEnv Pro Kit ($79 Instant Checkout via Whop, InStock)](https://whop.com/checkout/plan_lGsdWjQsePkvO/): Python harnesses for 4-vendor LLM judge evals, 6-rung cost routing & AgentEnv; includes instant access to the 14-lecture Production LLM Evals Masterclass & 40-question exam bank.`,
    `- [AI for Corporate Training & Instructional Design: The UbD Glass-Box Playbook ($24.99 Live on Amazon, InStock Paperback, ISBN 9798142559005, ASIN B0HRQFWFPR)](https://www.amazon.com/dp/B0HRQFWFPR): Physical 8.5x11 print reference playbook for zero-hallucination SOP-to-SCORM, QTI 1.2, and video pipelines.`,
    `- [Benchmark AP Precalculus Unit 3 Exam Prep Workbook ($16.99 Live on Amazon, InStock Paperback, ISBN 9798142561688, ASIN B0HRQJLPRZ)](https://www.amazon.com/dp/B0HRQJLPRZ): Companion 300-DPI physical curriculum workbook from Benchmark AP Prep (https://benchmark-ap.pages.dev).`,
    `- [Udemy Instructor Hub (31,500+ Learners)](https://www.udemy.com/user/joshuadurey/): Instructor profile for Joshua Durey; new AI Corporate Training & Production LLM Evals courses are completing Udemy's standard 2-3 day instructor identity verification (instant access available today via Whop).`,
    `- [Done-For-You B2B Async Pilot & Workflow Sprints ($2.5k-$10k Fixed-Scope)](${site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call"}): Book a 20-minute scope call or request a free custom prototype at ${base}/#commission-prototype.`,
    ``,
    `## Featured Greenfield Harnesses & Case Studies (${items.length} Published)`,
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
    name: "Joshua Durey (Josh Durey) - Applied AI Enablement & Workflow Systems",
    alternateNames: ["Josh Durey", "Joshua Durey", "Human Creative"],
    description: site.description,
    url: `${base}/`,
    provider: {
      organization: "Human Creative",
      founder: "Joshua Durey",
      url: `${base}/`,
      contactEmail: site.links?.email || "josh.durey@gmail.com",
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      mcpEndpoint: "https://josh-employer-funnel.josh-durey.workers.dev/mcp",
      mcpRegistryId: "io.github.jdurey/human-creative",
      llmsTxt: `${base}/llms.txt`,
      llmsFullTxt: `${base}/llms-full.txt`,
      atomFeed: `${base}/feed.xml`,
    },
    endpoints: {
      mcpServer: "https://josh-employer-funnel.josh-durey.workers.dev/mcp",
      mcpDiscovery: `${base}/.well-known/mcp.json`,
      diagnosticApi: "https://josh-employer-funnel.josh-durey.workers.dev/api/funnel/diagnose",
      prototypeCommissionApi: "https://josh-employer-funnel.josh-durey.workers.dev/api/funnel/capture",
      playbooksIndex: `${base}/guides/`,
      catalogJson: `${base}/api/catalog.json`,
      sopToLmsShowcase: `${base}/sop-to-lms/`,
      sampleScorm12Package: `${base}/sop-to-lms/sample-incident-sop-scorm12.zip`,
      whopStorefrontHub: "https://whop.com/human-creative-benchmark-studio/",
      corporateLdSopToScormCheckout99Usd: "https://whop.com/checkout/plan_y1ACgqNYGtul8/",
      corporateLdSopToScormStorefront: "https://whop.com/human-creative-benchmark-studio/corporate-ld-sop-to-scorm-factory",
      enterpriseAiEvalReaKitCheckout79Usd: "https://whop.com/checkout/plan_lGsdWjQsePkvO/",
      enterpriseAiEvalReaKitStorefront: "https://whop.com/human-creative-benchmark-studio/enterprise-ai-eval-rea-pro-kit",
      corporateLdAmazonPaperback2499Usd: "https://www.amazon.com/dp/B0HRQFWFPR",
      apPrecalcUnit3Paperback1699Usd: "https://www.amazon.com/dp/B0HRQJLPRZ",
      udemyInstructorProfile: "https://www.udemy.com/user/joshuadurey/",
      interactiveVideoTwin: `${base}/interview/`,
      calendarBooking: site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call",
    },
    hiringTracks: [
      {
        id: "full-time-remote",
        roles: [
          "Applied AI Enablement Lead",
          "Head of AI Adoption",
          "AI Operations Strategist",
          "Agentic Workflow Architect",
          "Principal AI Learning Systems Engineer",
        ],
        workAuth: "US Citizen (remote worldwide, English-only, US W-2 EOR or US LLC contract)",
        hireUrl: `${base}/hire/`,
        prototypeRequestUrl: `${base}/#commission-prototype`,
      },
      {
        id: "fixed-scope-b2b-sprint",
        name: "Two-Week AI Workflow Audit & QC Sprint",
        priceRangeUsd: "2500-10000",
        billingModel: "fixed_scope_flat_fee",
        bookingUrl: site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call",
        specUrl: `${base}/guides/fixed-scope-ai-workflow-sprint/`,
      },
    ],
    products: [
      {
        id: "corporate-ld-sop-to-scorm-factory",
        name: "Corporate L&D Zero-Hallucination SOP-to-SCORM & Video Factory (Includes 65m Video Masterclass)",
        priceUsd: 99.0,
        status: "live_in_stock",
        billingType: "one_time_instant_download",
        checkoutUrl: "https://whop.com/checkout/plan_y1ACgqNYGtul8/",
        storefrontUrl: "https://whop.com/human-creative-benchmark-studio/corporate-ld-sop-to-scorm-factory",
        demoUrl: `${base}/sop-to-lms/`,
      },
      {
        id: "enterprise-ai-eval-rea-pro-kit",
        name: "Enterprise AI Eval, 6-Rung Cost Router & REA AgentEnv Pro Kit (Includes 64m Video Masterclass + 40Q Bank)",
        priceUsd: 79.0,
        status: "live_in_stock",
        billingType: "one_time_instant_download",
        checkoutUrl: "https://whop.com/checkout/plan_lGsdWjQsePkvO/",
        storefrontUrl: "https://whop.com/human-creative-benchmark-studio/enterprise-ai-eval-rea-pro-kit",
      },
      {
        id: "amazon-kdp-corporate-ld-playbook",
        name: "AI for Corporate Training & Instructional Design: The UbD Glass-Box Playbook for Zero-Hallucination SOP-to-SCORM, QTI & Video Pipelines",
        asin: "B0HRQFWFPR",
        isbn13: "9798142559005",
        priceUsd: 24.99,
        status: "live_in_stock",
        platform: "Amazon KDP Paperback",
        url: "https://www.amazon.com/dp/B0HRQFWFPR",
      },
      {
        id: "udemy-ai-cohort-pending-identity-verification",
        name: "AI Corporate Training & Production LLM Evals Udemy Cohort (31,500+ Instructor Learners)",
        status: "awaiting_udemy_instructor_identity_verification_2_to_3_days",
        platform: "Udemy (Instant Access Live Today via Whop)",
        instructorProfileUrl: "https://www.udemy.com/user/joshuadurey/",
        instantWhopHubUrl: "https://whop.com/human-creative-benchmark-studio/",
      },
    ],
    skills: [
      {
        id: "ai-workflow-audit",
        name: "AI Workflow & Agentic Readiness Diagnostic",
        description:
          "Audits operational workflows, ranks high-payoff automation candidates, and designs human decision packets and cross-family LLM quality gates.",
        url: `${base}/guides/ai-workflow-audit-checklist/`,
        tags: ["ai-enablement", "agentic-workflows", "llm-qc", "cost-routing"],
      },
      {
        id: "judge-trust-calibration",
        name: "Cross-Family LLM Rubric & Judge Calibration",
        description:
          "Calibrates multi-vendor LLM-as-a-Judge panels to eliminate self-bias, verdict flips, and silent HTTP 200 truncations.",
        url: `${base}/guides/llm-judge-calibration-and-qc/`,
        tags: ["llm-as-a-judge", "rubrics", "evaluation", "quality-gates"],
      },
      {
        id: "scorm-qti-curriculum-compiler",
        name: "SOP & Documentation to Interactive Training & Assessment Compiler",
        description:
          "Compiles team SOPs and compliance policies into blind-solver-verified QTI 1.2 assessments, ADL SCORM 1.2 modules, and 1080p narrated lessons.",
        url: `${base}/sop-to-lms/`,
        tags: ["scorm", "assessments", "enablement", "instructional-systems"],
      },
      {
        id: "six-rung-model-router",
        name: "6-Rung Model Cost & Latency Router Architecture",
        description:
          "Routes high-volume agent workloads across zero-token Python hooks, fast mid-tier models, and frontier tie-breakers.",
        url: `${base}/guides/llm-cost-and-latency-routing/`,
        tags: ["model-routing", "token-economics", "telemetry-gates"],
      },
    ],
  };

  const agentCardJson = JSON.stringify(agentCard, null, 2) + "\n";
  await emit(".well-known/agent.json", agentCardJson);
  await emit(".well-known/agent-card.json", agentCardJson);

  const mcpWellKnown = {
    mcpVersion: "2025-06-18",
    name: "io.github.jdurey/human-creative",
    title: "Joshua Durey (Human Creative) - Applied AI Enablement, Workflow Audit & SOP-to-SCORM MCP Server",
    description:
      "Streamable HTTP Model Context Protocol server for testing open job descriptions or broken team workflows across 3 model families, commissioning free custom org prototypes, and inspecting verified SOP-to-SCORM & LLM QC kits.",
    vendor: {
      name: "Joshua Durey (Human Creative)",
      url: `${base}/`,
      email: site.links?.email || "josh.durey@gmail.com",
    },
    endpoints: [
      {
        transport: "streamable-http",
        url: "https://josh-employer-funnel.josh-durey.workers.dev/mcp",
      },
    ],
    repository: "https://github.com/jdurey/human-creative-mcp",
    documentationUrl: `${base}/llms-full.txt`,
  };
  await emit(".well-known/mcp.json", JSON.stringify(mcpWellKnown, null, 2) + "\n");

  const catalogPayload = {
    generatedAt: FIXED_BUILD_DATE,
    entity: {
      primaryName: "Joshua Durey",
      preferredShortName: "Josh Durey",
      brand: "Human Creative",
      canonicalUrl: `${base}/`,
      hireUrl: `${base}/hire/`,
      interviewTwinUrl: `${base}/interview/`,
      calendarUrl: site.links?.cal || "https://cal.com/joshua-durey-wqgvgp/20-min-scope-call",
      mcpEndpoint: "https://josh-employer-funnel.josh-durey.workers.dev/mcp",
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
