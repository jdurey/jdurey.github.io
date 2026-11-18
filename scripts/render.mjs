// render.mjs — HTML templates for the static portfolio.
// Dependency-light: plain template literals, no framework. Owned end-to-end so a
// nightly script can regenerate the whole site for years without version churn.

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TYPE_LABEL = {
  enablement: "AI Enablement & Workflow",
  eval: "LLM QC",
  "red-team": "Stress-Testing",
  systems: "Systems",
  method: "Method",
};

function nav(site, active) {
  const link = (href, label, key) =>
    `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<nav class="site-nav">
    <a class="brand" href="/">${esc(site.name)}<span class="brand-dot">.</span></a>
    <div class="nav-links">
      ${link("/hire/", "Hire ($4,500 Sprint)", "hire")}
      ${link("/work/", "Work", "work")}
      ${link("/guides/", "Playbooks", "guides")}
      ${link("/about/", "About", "about")}
      <a href="${esc(site.links.github)}" rel="me">GitHub</a>
    </div>
  </nav>`;
}

// JSON-LD blocks. NOTE (per GEO harden, 2026-06-24): structured data is crawl HYGIENE — it aids
// entity disambiguation, not a citation "lift" (Ahrefs causal study: no uplift; AI systems parse
// visible HTML). Ship once, keep NAP consistent, do NOT churn it on a loop. See the internal geo plan.
function jsonLdScripts(blocks = []) {
  return blocks
    .filter(Boolean)
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
}

function absoluteSiteUrl(site, path = "/") {
  const base = String(site.url || "").replace(/\/$/, "");
  if (!path) return base || "/";
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function layout({ site, title, description, body, active, ogType = "website", jsonLd = [], canonicalPath = "/" }) {
  const fullTitle = title ? `${title} · ${site.name}` : `Joshua Durey (${site.name}) · ${site.tagline} & Agentic Workflows`;
  const desc = description || site.description;
  const ld = jsonLdScripts([...(site.ld || []), ...jsonLd]);
  const canonicalUrl = absoluteSiteUrl(site, canonicalPath);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(site.name)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="${esc(canonicalUrl)}">
<link rel="alternate" type="application/atom+xml" title="${esc(site.name)} · Applied AI Enablement" href="/feed.xml">
<link rel="alternate" type="text/plain" title="LLMs.txt Agentic Index" href="/llms.txt">
<link rel="stylesheet" href="/assets/style.css">
<link rel="icon" href="/assets/favicon.svg">
${ld}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header>${nav(site, active)}</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div>${esc(site.name)} · AI Grading, Rubrics &amp; Quality Control</div>
  <div class="foot-links">
    <a href="mailto:${esc(site.links.email)}">Email</a>
    ${site.links.cal ? `<a href="${esc(site.links.cal)}" target="_blank" rel="noopener">Book a call</a>` : ""}
    <a href="/hire/">Hire ($4,500 Sprint)</a>
    <a href="/work/">Work</a>
    <a href="/about/">About</a>
    <a href="/llms.txt">LLMs.txt</a>
    <a href="/feed.xml">Atom</a>
    <a href="${esc(site.links.github)}" rel="me">GitHub</a>
    ${site.links.linkedin ? `<a href="${esc(site.links.linkedin)}" rel="me">LinkedIn</a>` : ""}
  </div>
  <div class="foot-meta">US Citizen in Seoul · Live 2:00-7:00 PM Pacific · Built ${esc(site.buildDate)}</div>
</footer>
<script type="module" src="/assets/site.js"></script>
<script type="module" src="/assets/funnel.js"></script>
</body>
</html>`;
}

function proofStrip() {
  return `<section class="proof-strip" aria-label="Experience and open-source verification metrics">
  <div class="proof-stat">
    <strong>15 yrs</strong>
    <span>Classroom teaching, real student grading, and an MA in Applied Linguistics.</span>
  </div>
  <div class="proof-stat">
    <strong>88,000</strong>
    <span>API calls audited in my open-source telemetry harness, catching 324 silent cutoffs.</span>
  </div>
  <div class="proof-stat">
    <strong>0.0%</strong>
    <span>False-pass rate on seeded rubric defects using cross-family judge panels.</span>
  </div>
  <div class="proof-stat">
    <strong>$4,500</strong>
    <span>Flat 10-workday sprint to test 200 cases, rewrite your rubric, and add CI checks.</span>
  </div>
</section>`;
}

function funnelWorkbench(site) {
  const calUrl = site.links.cal ? esc(site.links.cal) : `mailto:${esc(site.links.email)}`;
  return `<section id="diagnostic" class="funnel-workbench" aria-label="Interactive agentic workflow diagnostic and prototype request">
  <div class="diag-card" data-diagnostic-root>
    <p class="eyebrow">Live 3-Model Edge Pipeline · Try It On Your Stack</p>
    <h2>Test an open role or broken workflow right now.</h2>
    <p class="diag-sub">Paste a job description or a messy team process. Three separate model families on Cloudflare Edge AI decompose the friction, wire a 4-node self-checking workflow with human checkpoints, and audit single-judge blindspots in ~6 seconds.</p>

    <div class="diag-toolbar" role="group" aria-label="Diagnostic input mode">
      <button type="button" class="diag-mode-btn" data-diag-mode="jd" aria-pressed="true">Job Description / Role</button>
      <button type="button" class="diag-mode-btn" data-diag-mode="workflow" aria-pressed="false">Stalled Team Workflow</button>
    </div>

    <div class="preset-row">
      <span class="preset-label">1-Click Presets:</span>
      <button type="button" class="preset-chip" data-diag-preset="enablement_jd">AI Enablement Lead</button>
      <button type="button" class="preset-chip" data-diag-preset="ai_ops_jd">AI Ops &amp; Automation</button>
      <button type="button" class="preset-chip" data-diag-preset="support_workflow">Hallucinating Support Bot</button>
      <button type="button" class="preset-chip" data-diag-preset="learning_workflow">Grading &amp; Tutoring QC</button>
    </div>

    <div class="funnel-field">
      <label for="diag-org-input">Company or Team Name (Optional)</label>
      <input id="diag-org-input" class="funnel-input" type="text" data-diag-org placeholder="e.g. Notion, Zapier, Customer Operations">
    </div>

    <div class="funnel-field">
      <label for="diag-main-input">Job Description Snippet or Workflow Bottleneck</label>
      <textarea id="diag-main-input" class="funnel-textarea" data-diag-input placeholder="Paste an open role title, job description snippet, or team mandate (e.g. Applied AI Enablement Lead, AI Operations Strategist)..."></textarea>
    </div>

    <div class="diag-actions">
      <button type="button" class="btn btn-primary" data-diag-run>Run 3-Stage Agentic Diagnostic</button>
      <span class="mono-dim">Mistral 24B -&gt; Llama 3.3 70B || Qwen 2.5 32B</span>
    </div>

    <p class="diag-status" data-diag-status aria-live="polite"></p>
    <div class="diag-result" data-diag-result hidden></div>

    <noscript>
      <p class="muted">Enable JavaScript to run the live 3-model diagnostic in your browser, or email a JD or workflow directly to <a href="mailto:${esc(site.links.email)}">${esc(site.links.email)}</a>.</p>
    </noscript>
  </div>

  <aside id="commission-prototype" class="capture-card" aria-label="Commission a free custom Day-1 prototype">
    <p class="eyebrow">Autonomous Day-1 Proof · Free Work Sample</p>
    <h2>Get a runnable prototype built for your team.</h2>
    <p class="capture-sub">Not ready for a call yet? Drop your work email and role or workflow focus. My automated multi-agent pipeline runs a custom 4-stage workflow and 3-family evaluation jury for your company, publishes it to <code>jdurey.github.io/for/&lt;your-org&gt;/</code>, and emails it with my role-matched CV.</p>

    <form data-employer-capture-form>
      <div class="hp-trap" aria-hidden="true">
        <label for="cap-hp">Leave blank</label>
        <input id="cap-hp" type="text" name="website_hp" tabindex="-1" autocomplete="off">
      </div>
      <input type="hidden" name="diagnostic_sha" data-capture-sha value="">

      <div class="funnel-field">
        <label for="cap-email">Work Email *</label>
        <input id="cap-email" class="funnel-input" type="email" name="work_email" required placeholder="you@company.com">
      </div>

      <div class="cap-row-2">
        <div class="funnel-field">
          <label for="cap-company">Company *</label>
          <input id="cap-company" class="funnel-input" type="text" name="company" data-capture-company required placeholder="Acme AI">
        </div>
        <div class="funnel-field">
          <label for="cap-name">Your Name</label>
          <input id="cap-name" class="funnel-input" type="text" name="name" placeholder="Alex Rivera">
        </div>
      </div>

      <div class="funnel-field">
        <label for="cap-track">What Are You Hiring For?</label>
        <select id="cap-track" class="funnel-select" name="track">
          <option value="full_time">Full-Time Remote Role (AI Enablement / Ops / Workflow)</option>
          <option value="fractional">Fractional or Contract AI Systems Lead</option>
          <option value="sprint">Fixed-Scope Workflow Audit &amp; QC Sprint</option>
        </select>
      </div>

      <div class="funnel-field">
        <label for="cap-scope">Role Link, JD, or Workflow to Prototype</label>
        <textarea id="cap-scope" class="funnel-textarea" name="role_or_workflow" data-capture-scope placeholder="Paste a link to your open role or 1-2 sentences on the workflow you want modeled..."></textarea>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%">Commission Free Prototype + CV</button>
      <p class="cap-note">Zero sales spam. Built by my automated prototype pipeline, firewall-scanned, and delivered to your inbox. Ready to talk now? <a href="${calUrl}" target="_blank" rel="noopener">Grab 20 minutes on Cal.com</a>.</p>
    </form>

    <div data-capture-feedback hidden></div>
  </aside>
</section>`;
}

function singleStandOfferSection(site) {
  const calUrl = site.links.cal ? esc(site.links.cal) : `mailto:${esc(site.links.email)}`;
  return `<section id="offer-summary" class="b2b-kits-section" aria-label="Work with Joshua Durey">
  <div class="section-head">
    <div>
      <p class="eyebrow" style="margin-bottom:0.35rem">One Specialty · One Clear Price · Plain Terms</p>
      <h2 style="margin:0">Two ways to work with me</h2>
    </div>
    <a class="more" href="/hire/">Full scope &amp; terms -&gt;</a>
  </div>
  <p class="muted" style="max-width:74ch;margin-top:.35rem">US citizen living in Seoul, paid in USD (W-2 EOR through Deel or Remote, or direct US contract), online live every workday from 2:00 to 7:00 PM Pacific.</p>
  <div class="b2b-kits-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));">
    <article class="b2b-kit-card is-featured-kit">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-eval">Fixed-Price Project · 10 Workdays</span>
          <span class="b2b-kit-price">$4,500 Flat</span>
        </div>
        <h3>AI Rubric &amp; Exam Hardening Sprint</h3>
        <p>For adult certification, language testing, licensing, hiring, and training teams whose AI grader rewards wordy bluffing or misses simple right answers.</p>
        <ul class="b2b-kit-bullets">
          <li>200 tricky test cases checked against two independent human raters</li>
          <li>Machine-ready rubric rewrite with clear pass and fail rules</li>
          <li>Clean Python <code>pytest</code> check in your repo so old bugs stay fixed</li>
        </ul>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-primary" href="${calUrl}" target="_blank" rel="noopener">Book a 20-Min Call</a>
        <a class="btn btn-sm" href="/hire/">Read Full Sprint Details</a>
      </div>
    </article>

    <article class="b2b-kit-card">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-enablement">Full-Time or Part-Time</span>
          <span class="b2b-kit-price">Remote · US Overlap</span>
        </div>
        <h3>AI Grading, Rubric &amp; Quality Control Lead</h3>
        <p>Join your product, assessment, or learning team to own AI grading accuracy, practice-bank verification, and multi-model quality checks end to end.</p>
        <ul class="b2b-kit-bullets">
          <li>15 years teaching and grading real students + MA in Applied Linguistics</li>
          <li>Production Python quality gates and cross-family judge panels</li>
          <li>Live daily overlap from 2:00 to 7:00 PM Pacific (5:00 to 10:00 PM Eastern)</li>
        </ul>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-primary" href="mailto:${esc(site.links.email)}?subject=Role%20Inquiry%20-%20AI%20Grading%20%26%20Quality">Email ${esc(site.links.email)}</a>
        <a class="btn btn-sm" href="/about/">About Joshua Durey</a>
      </div>
    </article>
  </div>
</section>`;
}

function card(cs, index = 0) {
  const t = TYPE_LABEL[cs.type] || cs.type || "";
  return `<a class="card" href="${esc(cs.url)}" data-card-type="${esc(cs.type)}" style="--i:${index}">
    <div class="card-meta"><span class="tag tag-${esc(cs.type)}">${esc(t)}</span><time>${esc(cs.dateLabel)}</time>${cs.repo ? `<span class="chip">receipts</span>` : ""}</div>
    <h3>${esc(cs.title)}</h3>
    <p>${esc(cs.summary)}</p>
    ${cs.models?.length ? `<div class="models">${cs.models.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</div>` : ""}
  </a>`;
}

function omnistoreCatalogJsonLd(site) {
  const base = String(site.url || "https://jdurey.github.io").replace(/\/$/, "") + "/";
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "AI Rubric & Exam Hardening Sprint",
      description:
        "10-workday fixed-price audit and rubric rewrite testing 200 cases on your AI grader or practice bank against two human raters, with a Python pytest check in your repo.",
      provider: {
        "@type": "Person",
        name: "Joshua Durey",
        alternateName: "Josh Durey",
        url: base,
      },
      offers: {
        "@type": "Offer",
        price: "4500.00",
        priceCurrency: "USD",
        url: `${base}hire/`,
      },
    },
  ];
}

export function homePage({ site, featured, recent, guides = [] }) {
  const body = `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Joshua Durey · AI Grading, Rubrics &amp; Quality Control</p>
    <h1>${esc(site.heroHeadline)}</h1>
    <p class="lede">${site.thesisHtml}</p>
    <div class="cta">
      <a class="btn btn-primary" href="/hire/">See the $4,500 Rubric Sprint</a>
      ${site.links.cal ? `<a class="btn" href="${esc(site.links.cal)}" target="_blank" rel="noopener">Book a 20-min call</a>` : ""}
      <a class="btn" href="/about/">About Joshua Durey</a>
    </div>
  </div>
  <div class="hero-instrument" aria-hidden="true">
    <div class="instrument-head">
      <span>rubric check</span>
      <span>2-rater anchored</span>
    </div>
    <div class="instrument-scan">
      <span></span><span></span><span></span><span></span>
    </div>
    <div class="instrument-matrix">
      <span class="hot"></span><span></span><span></span><span class="cool"></span>
      <span></span><span class="risk"></span><span></span><span></span>
      <span></span><span></span><span class="hot"></span><span></span>
    </div>
    <div class="instrument-readout">
      <span>sprint scope</span>
      <strong>200 cases</strong>
      <span>bluff pass</span>
      <strong>0.0%</strong>
    </div>
  </div>
</section>

${proofStrip()}

${singleStandOfferSection(site)}

<section class="featured">
  <div class="section-head"><h2>Selected work</h2><a class="more" href="/work/">All work →</a></div>
  <div class="cards">
    ${featured.map((cs, i) => card(cs, i)).join("\n")}
  </div>
</section>

<section class="changelog">
  <h2>Recent notes &amp; harnesses</h2>
  <p class="muted">Open-source checks and experiments from my workbench.</p>
  <ul class="log">
    ${recent
      .map(
        (c) =>
          `<li><time>${esc(c.dateLabel)}</time><a href="${esc(c.url)}">${esc(c.title)}</a> <span class="tag tag-${esc(c.type)}">${esc(TYPE_LABEL[c.type] || c.type)}</span></li>`
      )
      .join("\n")}
  </ul>
</section>`;
  return layout({
    site,
    title: "",
    description: site.description,
    body,
    active: "home",
    canonicalPath: "/",
    jsonLd: omnistoreCatalogJsonLd(site),
  });
}

export function workIndex({ site, items }) {
  const groups = {};
  for (const it of items) (groups[it.type] ||= []).push(it);
  const order = ["enablement", "eval", "red-team", "systems", "method"];
  const filterControls = `<div class="work-filters" role="toolbar" aria-label="Filter work">
    <button type="button" data-filter="all" aria-pressed="true">All</button>
    ${order.map((k) => `<button type="button" data-filter="${esc(k)}" aria-pressed="false">${esc(TYPE_LABEL[k] || k)}</button>`).join("\n    ")}
  </div>`;
  const sections = order
    .filter((k) => groups[k]?.length)
    .map(
      (k) => `<section class="work-group" data-work-group="${esc(k)}">
      <h2>${esc(TYPE_LABEL[k] || k)}</h2>
      <div class="cards">${groups[k].map((it, i) => card(it, i)).join("\n")}</div>
    </section>`
    )
    .join("\n");
  const body = `
<section class="page-head">
  <h1>Work</h1>
  <p class="lede">Runnable proof of AI work that holds up: workflow audits, agentic systems, and the LLM quality control behind them. Every case study links to code and a result you can act on.</p>
</section>
${filterControls}
${sections}`;
  return layout({ site, title: "Work", description: "Applied AI enablement work: workflow audits, agentic systems, and LLM quality control. Reproducible case studies with runnable code.", body, active: "work", canonicalPath: "/work/" });
}

function skillCard(s, index = 0) {
  const t = TYPE_LABEL[s.type] || s.type || "Skill";
  return `<a class="card" href="${esc(s.repo)}" data-card-type="${esc(s.type)}" style="--i:${index}">
    <div class="card-meta"><span class="tag tag-${esc(s.type)}">${esc(t)}</span><span class="chip">GitHub →</span></div>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.summary)}</p>
  </a>`;
}

export function skillsIndex({ site, skills }) {
  const install = `curl -fsSL ${skills.repo.replace(/\/$/, "")}/tarball/main | tar -xz &amp;&amp; mv ${esc(skills.repoSlug)}-*/&lt;skill&gt; . &amp;&amp; rm -rf ${esc(skills.repoSlug)}-*`;
  const body = `
<section class="page-head">
  <h1>Skills</h1>
  <p class="lede">${esc(skills.intro)}</p>
</section>
<section class="work-group">
  <div class="cards">${skills.items.map((s, i) => skillCard(s, i)).join("\n")}</div>
</section>
<section class="thesis">
  <h2>Install any of these</h2>
  <p class="muted">A skill is just a <code>SKILL.md</code>, which is YAML frontmatter plus markdown, so it works with any agent that loads skills. Run this from your agent's skills directory and swap in the skill name:</p>
  <pre><code>${install}</code></pre>
  <p><a class="more" href="${esc(skills.repo)}">All skills on GitHub →</a></p>
</section>`;
  return layout({ site, title: "Skills", description: "Open-source skills for AI coding agents, built by Josh Durey.", body, active: "skills", canonicalPath: "/skills/" });
}

export function caseStudyPage({ site, cs, bodyHtml }) {
  const meta = [
    cs.models?.length ? `<div><dt>Models</dt><dd>${cs.models.map((m) => esc(m)).join(", ")}</dd></div>` : "",
    cs.repo ? `<div><dt>Receipts</dt><dd><a href="${esc(cs.repo)}">${esc(cs.repoLabel || "harness")}</a></dd></div>` : "",
    cs.status ? `<div><dt>Status</dt><dd>${esc(cs.status)}</dd></div>` : "",
  ]
    .filter(Boolean)
    .join("");
  const body = `
<article class="case">
  <div class="case-head">
    <div class="card-meta"><span class="tag tag-${esc(cs.type)}">${esc(TYPE_LABEL[cs.type] || cs.type)}</span><time>${esc(cs.dateLabel)}</time></div>
    <h1>${esc(cs.title)}</h1>
    <p class="lede">${esc(cs.summary)}</p>
    ${meta ? `<dl class="case-meta">${meta}</dl>` : ""}
  </div>
  <div class="prose">
${bodyHtml}
  </div>
  <aside class="case-cta-box" aria-label="Hiring and workflow prototype options">
    <p class="eyebrow">Hiring for Applied AI Enablement, AI Ops, or Workflow Automation?</p>
    <h2>Test this method against your own role or team workflow.</h2>
    <p>Run a 6-second multi-model diagnostic on your open job description, interview my 3-minute AI video twin, or have my automated workflow pipeline build a free runnable prototype for your team.</p>
    <div class="cta">
      <a class="btn btn-primary" href="/?utm_source=case_study&amp;utm_campaign=${esc(cs.slug)}#commission-prototype" data-funnel-cta="case_prototype_${esc(cs.slug)}">Get a Free Team Prototype</a>
      <a class="btn" href="/?utm_source=case_study&amp;utm_campaign=${esc(cs.slug)}#diagnostic" data-funnel-cta="case_diag_${esc(cs.slug)}">Run Live JD Diagnostic</a>
      <a class="btn" href="/interview/?utm_source=case_study&amp;utm_campaign=${esc(cs.slug)}">Interview AI Josh (3m)</a>
      ${site.links.cal ? `<a class="btn" href="${esc(site.links.cal)}" target="_blank" rel="noopener">Book 20-Min Call</a>` : ""}
    </div>
  </aside>
  <div class="case-foot"><a href="/work/">← All work</a></div>
</article>`;
  const base = site.url.replace(/\/$/, "");
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${base}${cs.url}#article`,
    headline: cs.title,
    name: cs.title,
    description: cs.summary,
    url: `${base}${cs.url}`,
    ...(cs.date ? { datePublished: String(cs.date).slice(0, 10) } : {}),
    author: { "@id": `${base}/#person` },
    publisher: { "@id": `${base}/#person` },
    mainEntityOfPage: `${base}${cs.url}`,
    ...(cs.repo ? { isBasedOn: cs.repo, codeRepository: cs.repo } : {}),
    ...(cs.models?.length ? { keywords: cs.models.join(", ") } : {}),
    about: "Applied AI enablement",
  };
  return layout({ site, title: cs.title, description: cs.summary, body, active: "work", ogType: "article", jsonLd: [article], canonicalPath: cs.url });
}

export function aboutPage({ site, bodyHtml, canonicalPath = "/about/", pageTitle = "About Joshua Durey (Josh Durey)" }) {
  const base = site.url.replace(/\/$/, "");
  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${base}${canonicalPath}#profile`,
    url: `${base}${canonicalPath}`,
    name: pageTitle,
    mainEntity: { "@id": `${base}/#person` },
  };
  const entityFaqLd =
    canonicalPath === "/joshua-durey/"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Who is Joshua Durey (Josh Durey)?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Joshua Durey (Josh Durey) tests where AI graders and AI-made practice exams get scores wrong, and rewrites rubrics and quality checks so adult learning, certification, language testing, and hiring teams can trust the scores.",
              },
            },
            {
              "@type": "Question",
              name: "What is Joshua Durey's background?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Joshua Durey spent fifteen years teaching and grading students in schools across Asia and the US, earned an MA in Applied Linguistics from the University of Birmingham, and built Python quality gates, multi-model judge panels, and quiz checks on contract for an AI education company.",
              },
            },
            {
              "@type": "Question",
              name: "How can companies hire or work with Joshua Durey?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Joshua Durey is a US Citizen living in Seoul, paid in USD (W-2 EOR through Deel or Remote, or direct US contract), online live every workday from 2:00 to 7:00 PM Pacific, available for a $4,500 10-day AI Rubric & Exam Hardening Sprint or full-time/part-time leadership at jdurey.github.io/hire/.",
              },
            },
          ],
        }
      : null;
  const body = `
<section class="page-head">
  <p class="eyebrow">Joshua Durey · AI Grading, Rubrics &amp; Quality Control</p>
  <h1>${esc(pageTitle)}</h1>
</section>
<div class="prose about">${bodyHtml}</div>`;
  return layout({
    site,
    title: pageTitle,
    description:
      "Joshua Durey (Josh Durey) tests where AI graders and practice exams break, and rewrites rubrics and quality checks so teams can trust the scores.",
    body,
    active: "about",
    canonicalPath,
    jsonLd: [profileLd, entityFaqLd].filter(Boolean),
  });
}

export function offerPage({ site, offer, bodyHtml }) {
  const mailto = `mailto:${esc(site.links.email)}?subject=${encodeURIComponent(offer.ctaSubject || "AI Rubric & Exam Hardening Inquiry")}`;
  const bookHref = site.links.cal ? esc(site.links.cal) : mailto;
  const bookAttrs = site.links.cal ? ` target="_blank" rel="noopener"` : "";
  const ctaLabel = esc(offer.ctaLabel || "Book a 20-minute call");
  const body = `
<section class="hero offer-hero">
  <div class="hero-copy">
    <p class="eyebrow">$4,500 Fixed-Price Sprint · Full-Time or Part-Time Leadership</p>
    <h1>${esc(offer.title)}</h1>
    <p class="lede">${esc(offer.subtitle || offer.summary)}</p>
    <div class="cta">
      <a class="btn btn-primary" href="${bookHref}"${bookAttrs}>${ctaLabel}</a>
      <a class="btn" href="${mailto}">Email ${esc(site.links.email)}</a>
      <a class="btn" href="/about/">About Joshua Durey</a>
    </div>
  </div>
</section>
${proofStrip()}
<div class="prose offer-body">
${bodyHtml}
  <div class="cta cta-foot">
    <a class="btn btn-primary" href="${bookHref}"${bookAttrs}>${ctaLabel}</a>
    <a class="btn" href="${mailto}">Email ${esc(site.links.email)}</a>
  </div>
</div>`;
  return layout({ site, title: offer.title, description: offer.description || offer.summary, body, active: "hire", canonicalPath: site.offerUrl || "/hire/" });
}

export function guidesIndexPage({ site, guides }) {
  const body = `
<section class="page-head">
  <p class="eyebrow">Applied AI Enablement · Buyer &amp; Hiring Playbooks</p>
  <h1>Playbooks</h1>
  <p class="lede">Plain-language implementation guides for founders, operations leaders, L&amp;D directors, and hiring managers putting agentic workflows and LLM quality gates into daily production.</p>
</section>
<section class="work-group">
  <div class="cards">${guides.map((g, i) => card(g, i)).join("\n")}</div>
</section>
${funnelWorkbench(site)}`;
  const base = site.url.replace(/\/$/, "");
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Applied AI Enablement & Workflow Automation Playbooks by Joshua Durey",
    itemListElement: guides.map((g, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: g.title,
      url: `${base}${g.url}`,
    })),
  };
  return layout({
    site,
    title: "Applied AI Enablement & Workflow Playbooks",
    description: "Practical playbooks by Joshua Durey (Josh Durey) on hiring Applied AI Enablement Leads, running enterprise AI workflow audits, calibrating cross-family LLM judges, and compiling SOPs into SCORM 1.2.",
    body,
    active: "guides",
    canonicalPath: "/guides/",
    jsonLd: [itemList],
  });
}

export function guidePage({ site, guide, bodyHtml }) {
  const faqsHtml = (guide.faqs || []).length
    ? `<section class="prose" style="margin-top:2.4rem" aria-label="Frequently asked questions">
  <h2>Frequently asked questions</h2>
  ${guide.faqs
    .map(
      (f) => `<div style="margin-bottom:1.25rem">
    <h3 style="margin-bottom:0.3rem">${esc(f.q)}</h3>
    <p style="margin-top:0">${esc(f.a)}</p>
  </div>`
    )
    .join("\n  ")}
</section>`
    : "";

  const relatedHtml = (guide.relatedWork || []).length
    ? `<section class="prose" style="margin-top:1.8rem" aria-label="Related runnable harnesses">
  <h2>Runnable harnesses &amp; proofs</h2>
  <ul>
    ${guide.relatedWork.map((r) => `<li><a href="${esc(r.url)}">${esc(r.title)}</a></li>`).join("\n    ")}
  </ul>
</section>`
    : "";

  const body = `
<article class="case">
  <div class="case-head">
    <div class="card-meta"><span class="tag tag-${esc(guide.type)}">${esc(TYPE_LABEL[guide.type] || "Playbook")}</span><time>${esc(guide.dateLabel)}</time><span class="chip">Playbook</span></div>
    <h1>${esc(guide.title)}</h1>
    <p class="lede">${esc(guide.summary)}</p>
  </div>
  <div class="prose">
${bodyHtml}
  </div>
  ${faqsHtml}
  ${relatedHtml}
  <aside class="case-cta-box" aria-label="Hiring and workflow prototype options">
    <p class="eyebrow">Hiring for Applied AI Enablement, AI Ops, or Scoping a 2-Week Sprint?</p>
    <h2>Run this architecture on your own role or team bottleneck.</h2>
    <p>Test your open job description in the 6-second multi-model diagnostic, interview my 3-minute AI video twin, or have my automated workflow pipeline build a free runnable prototype for your company.</p>
    <div class="cta">
      <a class="btn btn-primary" href="/?utm_source=guide&amp;utm_campaign=${esc(guide.slug)}#commission-prototype" data-funnel-cta="guide_prototype_${esc(guide.slug)}">Commission Free Prototype</a>
      <a class="btn" href="/?utm_source=guide&amp;utm_campaign=${esc(guide.slug)}#diagnostic" data-funnel-cta="guide_diag_${esc(guide.slug)}">Run Live JD Diagnostic</a>
      <a class="btn" href="/interview/?utm_source=guide&amp;utm_campaign=${esc(guide.slug)}">Interview AI Josh (3m)</a>
      ${site.links.cal ? `<a class="btn" href="${esc(site.links.cal)}" target="_blank" rel="noopener">Book 20-Min Call</a>` : ""}
    </div>
  </aside>
  <div class="case-foot"><a href="/guides/">← All playbooks</a> · <a href="/guides/${esc(guide.slug)}.md">Clean Markdown (.md)</a></div>
</article>`;

  const base = site.url.replace(/\/$/, "");
  const jsonLdBlocks = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "@id": `${base}${guide.url}#article`,
      headline: guide.title,
      name: guide.title,
      description: guide.summary,
      url: `${base}${guide.url}`,
      datePublished: String(guide.date || "2026-11-15").slice(0, 10),
      author: { "@id": `${base}/#person` },
      publisher: { "@id": `${base}/#person` },
      mainEntityOfPage: `${base}${guide.url}`,
      ...(guide.keywords?.length ? { keywords: guide.keywords.join(", ") } : {}),
      about: "Applied AI enablement",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Josh Durey", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Playbooks", item: `${base}/guides/` },
        { "@type": "ListItem", position: 3, name: guide.shortTitle || guide.title, item: `${base}${guide.url}` },
      ],
    },
  ];
  if ((guide.faqs || []).length) {
    jsonLdBlocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    });
  }

  return layout({
    site,
    title: guide.title,
    description: guide.summary,
    body,
    active: "guides",
    ogType: "article",
    jsonLd: jsonLdBlocks,
    canonicalPath: guide.url,
  });
}

export { esc };
