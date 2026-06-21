// render.mjs — HTML templates for the static portfolio.
// Dependency-light: plain template literals, no framework. Owned end-to-end so a
// nightly script can regenerate the whole site for years without version churn.

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TYPE_LABEL = {
  eval: "Eval",
  "red-team": "Red-Team",
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
      ${link("/about/", "About", "about")}
      ${site.offerUrl ? link(site.offerUrl, "Hire", "hire") + "\n      " : ""}<a href="${esc(site.links.github)}" rel="me">GitHub</a>
    </div>
  </nav>`;
}

export function layout({ site, title, description, body, active, ogType = "website" }) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
  const desc = description || site.description;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(site.name)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="${esc(site.url)}">
<link rel="stylesheet" href="/assets/style.css">
<link rel="icon" href="/assets/favicon.svg">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header>${nav(site, active)}</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div>${esc(site.name)} · AI Evaluation &amp; Red-Team</div>
  <div class="foot-links">
    <a href="mailto:${esc(site.links.email)}">Email</a>
    <a href="${esc(site.links.github)}">GitHub</a>
    ${site.links.linkedin ? `<a href="${esc(site.links.linkedin)}">LinkedIn</a>` : ""}
  </div>
  <div class="foot-meta">Built ${esc(site.buildDate)} · regenerated nightly · <a href="${esc(site.links.repo)}">source</a></div>
</footer>
</body>
</html>`;
}

function card(cs) {
  const t = TYPE_LABEL[cs.type] || cs.type || "";
  return `<a class="card" href="${esc(cs.url)}">
    <div class="card-meta"><span class="tag tag-${esc(cs.type)}">${esc(t)}</span><time>${esc(cs.dateLabel)}</time></div>
    <h3>${esc(cs.title)}</h3>
    <p>${esc(cs.summary)}</p>
    ${cs.models?.length ? `<div class="models">${cs.models.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</div>` : ""}
  </a>`;
}

export function homePage({ site, featured, recent }) {
  const body = `
<section class="hero">
  <p class="eyebrow">AI Evaluation · LLM Quality · Red-Team</p>
  <h1>${esc(site.heroHeadline)}</h1>
  <p class="lede">${esc(site.heroLede)}</p>
  <div class="cta">
    <a class="btn btn-primary" href="/work/">See the work</a>
    <a class="btn" href="${site.offerUrl ? esc(site.offerUrl) : "mailto:" + esc(site.links.email)}">Hire me</a>
  </div>
</section>

<section class="thesis">
  <h2>The bet I'm making</h2>
  <p>${site.thesisHtml}</p>
</section>

<section class="featured">
  <div class="section-head"><h2>Selected work</h2><a class="more" href="/work/">All work →</a></div>
  <div class="cards">
    ${featured.map(card).join("\n")}
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
  return layout({ site, title: "", description: site.description, body, active: "home" });
}

export function workIndex({ site, items }) {
  const groups = {};
  for (const it of items) (groups[it.type] ||= []).push(it);
  const order = ["eval", "red-team", "systems", "method"];
  const sections = order
    .filter((k) => groups[k]?.length)
    .map(
      (k) => `<section class="work-group">
      <h2>${esc(TYPE_LABEL[k] || k)}</h2>
      <div class="cards">${groups[k].map(card).join("\n")}</div>
    </section>`
    )
    .join("\n");
  const body = `
<section class="page-head">
  <h1>Work</h1>
  <p class="lede">Reproducible evals, red-team audits, and the systems behind them. Every case study links to runnable code.</p>
</section>
${sections}`;
  return layout({ site, title: "Work", description: "Reproducible LLM evals, red-team audits, and systems.", body, active: "work" });
}

export function caseStudyPage({ site, cs, bodyHtml }) {
  const meta = [
    cs.models?.length ? `<div><dt>Models</dt><dd>${cs.models.map((m) => esc(m)).join(", ")}</dd></div>` : "",
    cs.repo ? `<div><dt>Code</dt><dd><a href="${esc(cs.repo)}">${esc(cs.repoLabel || "harness")}</a></dd></div>` : "",
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
  return layout({ site, title: cs.title, description: cs.summary, body, active: "work", ogType: "article" });
}

export function aboutPage({ site, bodyHtml }) {
  const body = `
<section class="page-head"><h1>About</h1></section>
<div class="prose about">${bodyHtml}</div>`;
  return layout({ site, title: "About", description: site.description, body, active: "about" });
}

export function offerPage({ site, offer, bodyHtml }) {
  const mailto = `mailto:${esc(site.links.email)}?subject=${encodeURIComponent(offer.ctaSubject || "Eval sprint inquiry")}`;
  const ctaLabel = esc(offer.ctaLabel || "Book a call");
  const body = `
<section class="hero offer-hero">
  <p class="eyebrow">Fixed-fee eval sprint · for AI-in-education teams</p>
  <h1>${esc(offer.title)}</h1>
  <p class="lede">${esc(offer.subtitle || offer.summary)}</p>
  <div class="cta">
    <a class="btn btn-primary" href="${mailto}">${ctaLabel}</a>
    <a class="btn" href="/work/">See the proof</a>
  </div>
</section>
<div class="prose offer-body">
${bodyHtml}
  <div class="cta cta-foot">
    <a class="btn btn-primary" href="${mailto}">${ctaLabel}</a>
  </div>
</div>`;
  return layout({ site, title: offer.title, description: offer.description || offer.summary, body, active: "hire" });
}

export { esc };
