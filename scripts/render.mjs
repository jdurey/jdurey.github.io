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
      ${link("/work/", "Work", "work")}
      ${link("/skills/", "Skills", "skills")}
      ${link("/about/", "About", "about")}
      ${site.offerUrl ? link(site.offerUrl, "Hire", "hire") + "\n      " : ""}<a href="${esc(site.links.github)}" rel="me">GitHub</a>
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
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
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
  <div>${esc(site.name)} · Applied AI Enablement</div>
  <div class="foot-links">
    <a href="mailto:${esc(site.links.email)}">Email</a>
    <a href="${esc(site.links.github)}">GitHub</a>
    ${site.links.linkedin ? `<a href="${esc(site.links.linkedin)}">LinkedIn</a>` : ""}
  </div>
  <div class="foot-meta">Built ${esc(site.buildDate)} · regenerated nightly · <a href="${esc(site.links.repo)}">source</a></div>
</footer>
<script type="module" src="/assets/site.js"></script>
</body>
</html>`;
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

export function homePage({ site, featured, recent }) {
  const body = `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Applied AI · Agentic Workflows · LLM QC</p>
    <h1>${esc(site.heroHeadline)}</h1>
    <p class="lede">${site.thesisHtml}</p>
    <div class="cta">
      <a class="btn btn-primary" href="/work/">See the work</a>
      <a class="btn" href="${site.offerUrl ? esc(site.offerUrl) : "mailto:" + esc(site.links.email)}">Hire me</a>
      ${site.links.cal ? `<a class="btn" href="${esc(site.links.cal)}" target="_blank" rel="noopener">Book a call</a>` : ""}
    </div>
  </div>
  <div class="hero-instrument" aria-hidden="true">
    <div class="instrument-head">
      <span>eval run</span>
      <span>fail-closed</span>
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
      <span>rubric leak</span>
      <strong>0.13</strong>
      <span>judge pass</span>
      <strong>blocked</strong>
    </div>
  </div>
</section>

<section class="featured">
  <div class="section-head"><h2>Selected work</h2><a class="more" href="/work/">All work →</a></div>
  <div class="cards">
    ${featured.map((cs, i) => card(cs, i)).join("\n")}
  </div>
</section>

<section class="changelog">
  <h2>Changelog</h2>
  <p class="muted">What I shipped recently. This page regenerates every night from the lab.</p>
  <ul class="log">
    ${recent
      .map(
        (c) =>
          `<li><time>${esc(c.dateLabel)}</time><a href="${esc(c.url)}">${esc(c.title)}</a> <span class="tag tag-${esc(c.type)}">${esc(TYPE_LABEL[c.type] || c.type)}</span></li>`
      )
      .join("\n")}
  </ul>
</section>`;
  return layout({ site, title: "", description: site.description, body, active: "home", canonicalPath: "/" });
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

export function aboutPage({ site, bodyHtml }) {
  const body = `
<section class="page-head"><h1>About</h1></section>
<div class="prose about">${bodyHtml}</div>`;
  return layout({ site, title: "About", description: site.description, body, active: "about", canonicalPath: "/about/" });
}

export function offerPage({ site, offer, bodyHtml }) {
  const mailto = `mailto:${esc(site.links.email)}?subject=${encodeURIComponent(offer.ctaSubject || "Eval sprint inquiry")}`;
  // Booking CTA: a Cal.com link when configured (handles cross-timezone scheduling from Seoul),
  // else fall back to email so nothing ships broken before the handle exists. Mirrors the
  // populate-to-activate idiom used for linkedin/twitter in site.json.
  const bookHref = site.links.cal ? esc(site.links.cal) : mailto;
  const bookAttrs = site.links.cal ? ` target="_blank" rel="noopener"` : "";
  const ctaLabel = esc(offer.ctaLabel || "Book a call");
  const body = `
<section class="hero offer-hero">
  <p class="eyebrow">Fixed-scope engagement · for teams putting AI into production</p>
  <h1>${esc(offer.title)}</h1>
  <p class="lede">${esc(offer.subtitle || offer.summary)}</p>
  <div class="cta">
    <a class="btn btn-primary" href="${bookHref}"${bookAttrs}>${ctaLabel}</a>
    <a class="btn" href="/work/">See the proof</a>
  </div>
</section>
<div class="prose offer-body">
${bodyHtml}
  <div class="cta cta-foot">
    <a class="btn btn-primary" href="${bookHref}"${bookAttrs}>${ctaLabel}</a>
  </div>
</div>`;
  return layout({ site, title: offer.title, description: offer.description || offer.summary, body, active: "hire", canonicalPath: site.offerUrl || "/hire/" });
}

export { esc };
