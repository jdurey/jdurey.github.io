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
      ${link("/guides/", "Playbooks", "guides")}
      ${link("/sop-to-lms/", "SOP-to-LMS", "sop-to-lms")}
      ${link("/skills/", "Skills", "skills")}
      ${link("/interview/", "Interview", "interview")}
      ${link("/about/", "About", "about")}
      ${site.offerUrl ? link(site.offerUrl, "Hire", "hire") + "\n      " : ""}<a href="https://whop.com/human-creative-benchmark-studio/" target="_blank" rel="noopener" data-funnel-cta="nav_whop_hub">B2B Kits</a>
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
  <div>${esc(site.name)} · Applied AI Enablement</div>
  <div class="foot-links">
    <a href="mailto:${esc(site.links.email)}">Email</a>
    ${site.links.cal ? `<a href="${esc(site.links.cal)}" target="_blank" rel="noopener">Book a call</a>` : ""}
    <a href="/guides/">Playbooks</a>
    <a href="/sop-to-lms/">SOP-to-LMS</a>
    <a href="https://whop.com/human-creative-benchmark-studio/" target="_blank" rel="noopener">B2B Storefront</a>
    <a href="/interview/">AI Twin</a>
    <a href="/llms.txt">LLMs.txt</a>
    <a href="/feed.xml">Atom</a>
    <a href="${esc(site.links.github)}" rel="me">GitHub</a>
    ${site.links.linkedin ? `<a href="${esc(site.links.linkedin)}" rel="me">LinkedIn</a>` : ""}
  </div>
  <div class="foot-meta">Built ${esc(site.buildDate)} · regenerated nightly · <a href="${esc(site.links.repo)}">source</a></div>
</footer>
<script type="module" src="/assets/site.js"></script>
<script type="module" src="/assets/funnel.js"></script>
</body>
</html>`;
}

function proofStrip() {
  return `<section class="proof-strip" aria-label="Verified production telemetry">
  <div class="proof-stat">
    <strong>52,167</strong>
    <span>Multi-agent .jsonl sessions governed with 30+ Python hook gates and 2s SHA merge receipts.</span>
  </div>
  <div class="proof-stat">
    <strong>88,000</strong>
    <span>Production API calls audited across 12 models, catching 324 unflagged length truncations.</span>
  </div>
  <div class="proof-stat">
    <strong>$17</strong>
    <span>Total spend across 23,740 calls via a 6-rung policy and cost router at 0% false-pass.</span>
  </div>
  <div class="proof-stat">
    <strong>56</strong>
    <span>Open-source workflow, quality-gate, and rubric harnesses published with runnable receipts.</span>
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

function selfServeB2bKitsSection(site) {
  const calUrl = site.links.cal ? esc(site.links.cal) : `mailto:${esc(site.links.email)}`;
  return `<section id="b2b-kits" class="b2b-kits-section" aria-label="Self-Serve B2B Enterprise Source Kits, Amazon Paperback, Video Masterclasses, and Async Founder Sprints">
  <div class="section-head">
    <div>
      <p class="eyebrow" style="margin-bottom:0.35rem">Instant Self-Serve Source Kits · Live Amazon Paperback · Fixed-Scope Founder Sprints</p>
      <h2 style="margin:0">Run the production harnesses in your own VPC or certify your team today</h2>
    </div>
    <a class="more" href="https://whop.com/human-creative-benchmark-studio/" target="_blank" rel="noopener" data-funnel-cta="home_whop_storefront_hub">Storefront Hub (Human Creative &amp; Benchmark Studio) -&gt;</a>
  </div>
  <p class="muted" style="max-width:78ch;margin-top:.35rem">Download clean-room Python source kits and full 14-lecture video &amp; code-lab masterclasses instantly via Whop, order the physical corporate L&amp;D playbook on Amazon ($24.99), or book a 20-minute scope call for a turnkey fixed-scope sprint. (Companion Udemy storefront releases are completing standard 2-3 day instructor identity verification.)</p>
  <div class="b2b-kits-grid">
    <article class="b2b-kit-card is-featured-kit">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-systems">Corporate L&amp;D Kit · LIVE</span>
          <span class="b2b-kit-price">$99 · Instant Download</span>
        </div>
        <h3>Corporate L&amp;D Zero-Hallucination SOP-to-SCORM &amp; Video Factory</h3>
        <p>Compile SOPs, SOC-2 runbooks, and help docs into blind-verified SCORM 1.2, QTI 1.2, 300-DPI PDFs, and 1080p video inside your own environment.</p>
        <ul class="b2b-kit-bullets">
          <li>4-vendor blind-solver verification gate (0% policy drift)</li>
          <li>ADL SCORM 1.2 + QTI 1.2 + 1080p caption pipeline source</li>
          <li>Includes instant access to the <strong>14-lecture (65-min) Video &amp; Code-Lab Masterclass</strong> + pairs with the $24.99 Amazon Paperback</li>
        </ul>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-checkout" href="https://whop.com/checkout/plan_y1ACgqNYGtul8/" target="_blank" rel="noopener" data-funnel-cta="home_whop_sop_99">Instant Kit + 65m Video ($99) -&gt;</a>
        <a class="btn btn-sm btn-primary" href="https://www.amazon.com/dp/B0HRQFWFPR" target="_blank" rel="noopener" data-funnel-cta="home_amazon_kdp_corp_2499">Amazon Paperback ($24.99 LIVE) -&gt;</a>
        <a class="btn btn-sm" href="/sop-to-lms/" data-funnel-cta="home_sop_demo">Live SCORM Demo</a>
        <a class="btn btn-sm" href="/guides/sop-to-scorm-ai-pipeline/">Architecture Playbook</a>
      </div>
    </article>

    <article class="b2b-kit-card is-featured-kit">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-eval">AI Eval &amp; Routing Kit · LIVE</span>
          <span class="b2b-kit-price">$79 · Instant Download</span>
        </div>
        <h3>Enterprise AI Eval, 6-Rung Cost Router &amp; REA AgentEnv Pro Kit</h3>
        <p>Production Python harnesses for 4-vendor cross-family LLM judge evals, deterministic 6-rung model routing, and reproducible AgentEnv stress-testing.</p>
        <ul class="b2b-kit-bullets">
          <li>Eliminates single-judge self-bias and silent truncations</li>
          <li>6-rung policy and cost router with SHA-256 audit receipts</li>
          <li>Includes instant access to the <strong>14-lecture (64+ min) Production LLM Evals &amp; Cost Routing Masterclass</strong> + 40-question exam bank</li>
        </ul>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-checkout" href="https://whop.com/checkout/plan_lGsdWjQsePkvO/" target="_blank" rel="noopener" data-funnel-cta="home_whop_eval_79">Instant Eval &amp; Router Kit ($79) -&gt;</a>
        <a class="btn btn-sm" href="https://whop.com/human-creative-benchmark-studio/enterprise-ai-eval-rea-pro-kit" target="_blank" rel="noopener" data-funnel-cta="home_whop_eval_spec">Vault Spec</a>
        <a class="btn btn-sm" href="/guides/llm-judge-calibration-and-qc/">Judge QC Playbook</a>
      </div>
    </article>

    <article class="b2b-kit-card">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-enablement">Done-For-You B2B Pilot</span>
          <span class="b2b-kit-price">$2.5k-$10k · Fixed Scope</span>
        </div>
        <h3>Async Founder &amp; Enterprise Enablement Sprints</h3>
        <p>Want turnkey delivery instead of self-serve code? Commission a fixed-scope workflow audit, multi-vendor eval gate, or multi-SOP LMS catalog buildout.</p>
        <ul class="b2b-kit-bullets">
          <li>Custom Day-1 prototype at <code>/for/&lt;your-org&gt;/</code> before kickoff</li>
          <li>Runnable QC harness + non-technical team playbooks</li>
          <li>Fixed scope and price with zero open-ended hourly billing</li>
        </ul>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-primary" href="${calUrl}" target="_blank" rel="noopener" data-funnel-cta="home_b2b_sprint_cal">Book 20-Min Scope Call</a>
        <a class="btn btn-sm" href="/guides/fixed-scope-ai-workflow-sprint/">2-Week Sprint Spec</a>
      </div>
    </article>
  </div>

  <div class="b2b-kits-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-top:0.95rem">
    <article class="b2b-kit-card is-featured-kit">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-enablement">Amazon KDP Paperback · LIVE</span>
          <span class="b2b-kit-price">$24.99 · ISBN 9798142559005</span>
        </div>
        <h3>AI for Corporate Training &amp; Instructional Design Playbook</h3>
        <p>Physical print reference (<em>The UbD Glass-Box Playbook for Zero-Hallucination SOP-to-SCORM, QTI &amp; Video Pipelines</em>, ASIN <code>B0HRQFWFPR</code>) covering deterministic SOP-to-LMS compilation and 4-vendor blind-solver QA.</p>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-primary" href="https://www.amazon.com/dp/B0HRQFWFPR" target="_blank" rel="noopener" data-funnel-cta="amazon_card_corp_ld_2499">Buy on Amazon ($24.99 LIVE) -&gt;</a>
        <a class="btn btn-sm" href="/sop-to-lms/" data-funnel-cta="amazon_card_sop_demo">Interactive SCORM Demo</a>
      </div>
    </article>

    <article class="b2b-kit-card">
      <div>
        <div class="b2b-kit-head">
          <span class="tag tag-systems">Udemy Instructor Hub · 31,500+ Learners</span>
          <span class="b2b-kit-price">2-3 Day ID Check · Instant Access via Whop</span>
        </div>
        <h3>AI Corporate Training &amp; Production LLM Evals Cohort</h3>
        <p>Taught to 31,500+ learners worldwide on Udemy. Our new 14-lecture <em>SOP-to-SCORM Video Factory</em>, <em>Production LLM Evals</em> masterclass, and 40-question certification exams are completing Udemy's standard 2-3 day instructor identity verification, with full instant access available today inside the Whop Vaults.</p>
      </div>
      <div class="b2b-kit-actions">
        <a class="btn btn-sm btn-primary" href="https://whop.com/human-creative-benchmark-studio/" target="_blank" rel="noopener" data-funnel-cta="udemy_card_instant_whop">Instant Video + Code Access (Whop) -&gt;</a>
        <a class="btn btn-sm" href="https://www.udemy.com/user/joshuadurey/" target="_blank" rel="noopener" data-funnel-cta="udemy_instructor_profile">Udemy Instructor Profile</a>
      </div>
    </article>
  </div>
</section>`;
}

function funnelArchitectureSection() {
  return `<section class="funnel-arch" aria-label="How this agentic hiring funnel works">
  <div class="section-head">
    <h2>How this hiring funnel runs itself</h2>
    <span class="mono-dim">The funnel is a live work sample</span>
  </div>
  <p class="muted" style="max-width:74ch;margin-top:.2rem">Most candidates claim they build multi-agent workflows on a static PDF resume. Every step on this site runs on the same checkpointed automation architecture I build for teams.</p>
  <div class="arch-steps">
    <div class="arch-step">
      <div class="arch-num">Stage 01 · Edge AI</div>
      <h3>3-Vendor Triage</h3>
      <p>Mistral 24B, Llama 3.3 70B, and Qwen 2.5 32B decompose your JD or workflow at the edge with zero exposed API keys.</p>
    </div>
    <div class="arch-step">
      <div class="arch-num">Stage 02 · KV Queue</div>
      <h3>Intent &amp; Attribution</h3>
      <p>Cloudflare KV logs structured intake, UTM source, honeypot bot checks, and first-party prototype engagement.</p>
    </div>
    <div class="arch-step">
      <div class="arch-num">Stage 03 · Orchestrator</div>
      <h3>Autonomous Dispatch</h3>
      <p>A scheduled Python worker polls queued leads, verifies DNS MX records, and compiles a role-matched build spec.</p>
    </div>
    <div class="arch-step">
      <div class="arch-num">Stage 04 · Agent Build</div>
      <h3>4-Stage DAG + Jury</h3>
      <p>An automated runner executes realistic cases across 3 judge families and passes a 65-test CI publish firewall.</p>
    </div>
    <div class="arch-step">
      <div class="arch-num">Stage 05 · Human Gate</div>
      <h3>Prototype + Live Call</h3>
      <p>Delivers your live <code>/for/&lt;org&gt;/</code> kit and role-matched CV automatically. I step in when you book a live call.</p>
    </div>
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
  const authorPerson = {
    "@type": "Person",
    name: site.name || "Josh Durey",
    alternateName: "Joshua Durey",
    url: base,
  };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      name: "AI for Corporate Training & Instructional Design: The UbD Glass-Box Playbook for Zero-Hallucination SOP-to-SCORM, QTI & Video Pipelines",
      description:
        "Enterprise L&D architecture paperback covering deterministic SOP-to-SCORM 1.2 compilation, multi-model verification rubrics, and audit-ready LMS rollouts.",
      isbn: "9798142559005",
      gtin13: "9798142559005",
      sku: "B0HRQFWFPR",
      bookFormat: "https://schema.org/Paperback",
      author: authorPerson,
      url: "https://www.amazon.com/dp/B0HRQFWFPR",
      offers: {
        "@type": "Offer",
        price: "24.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.amazon.com/dp/B0HRQFWFPR",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Corporate L&D Zero-Hallucination SOP-to-SCORM & Video Factory",
      description:
        "Self-serve enterprise compiler and 14-lecture video masterclass turning SOPs and compliance policies into blind-verified SCORM 1.2 packages, QTI 1.2 banks, 300-DPI PDFs, and 1080p modules.",
      sku: "plan_y1ACgqNYGtul8",
      brand: {
        "@type": "Brand",
        name: "Human Creative",
      },
      url: "https://whop.com/checkout/plan_y1ACgqNYGtul8/",
      offers: {
        "@type": "Offer",
        price: "99.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://whop.com/checkout/plan_y1ACgqNYGtul8/",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Enterprise AI Eval, 6-Rung Cost Router & REA AgentEnv Pro Kit",
      description:
        "Production Python harnesses and 14-lecture masterclass for 4-vendor cross-family LLM judge evaluation, deterministic 6-rung cost routing, and reproducible AgentEnv stress-testing.",
      sku: "plan_lGsdWjQsePkvO",
      brand: {
        "@type": "Brand",
        name: "Human Creative",
      },
      url: "https://whop.com/checkout/plan_lGsdWjQsePkvO/",
      offers: {
        "@type": "Offer",
        price: "79.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://whop.com/checkout/plan_lGsdWjQsePkvO/",
      },
    },
  ];
}

export function homePage({ site, featured, recent, guides = [] }) {
  const body = `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Applied AI · Agentic Workflows · LLM QC</p>
    <h1>${esc(site.heroHeadline)}</h1>
    <p class="lede">${site.thesisHtml}</p>
    <div class="cta">
      <a class="btn btn-primary" href="#diagnostic" data-funnel-cta="hero_diagnostic">Test your JD or workflow</a>
      <a class="btn" href="/interview/" data-funnel-cta="hero_interview">Interview AI Josh (3m)</a>
      <a class="btn" href="${site.offerUrl ? esc(site.offerUrl) : "#commission-prototype"}" data-funnel-cta="hero_hire">For hiring teams</a>
      ${site.links.cal ? `<a class="btn" href="${esc(site.links.cal)}" target="_blank" rel="noopener" data-funnel-cta="hero_cal">Book 20-min call</a>` : ""}
    </div>
  </div>
  <div class="hero-instrument" aria-hidden="true">
    <div class="instrument-head">
      <span>3-vendor gate</span>
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
      <span>agent runs</span>
      <strong>52,167</strong>
      <span>false-pass</span>
      <strong>0.0%</strong>
    </div>
  </div>
</section>

${proofStrip()}

${funnelWorkbench(site)}

${selfServeB2bKitsSection(site)}

${funnelArchitectureSection()}

${guides.length ? `<section class="featured">
  <div class="section-head"><h2>Executive playbooks &amp; hiring guides</h2><a class="more" href="/guides/">All 8 playbooks →</a></div>
  <div class="cards">
    ${guides.slice(0, 4).map((g, i) => card(g, i)).join("\n")}
  </div>
</section>` : ""}

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
                text: "Joshua Durey (Josh Durey) is an Applied AI Enablement Lead, Agentic Workflow Architect, and founder of Human Creative. He audits operational workflows for AI readiness, orchestrates self-checking multi-agent pipelines with deterministic Python hook gates, builds SOP-to-SCORM 1.2 enterprise training compilers, and runs cross-family LLM quality control.",
              },
            },
            {
              "@type": "Question",
              name: "How did Joshua Durey transition from international education into agentic AI orchestration?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "After fifteen years in international schools and curriculum leadership and earning an MA in Applied Linguistics from the University of Birmingham, Joshua Durey governed 52,167 multi-agent sessions, 30+ Python hook gates, and multi-vendor LLM evaluation rubrics on contract for an AI-education company before launching Human Creative to build horizontal agentic workflows for operations, support, compliance, and L&D teams.",
              },
            },
            {
              "@type": "Question",
              name: "How can companies hire or work with Joshua Durey?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Joshua Durey is a US Citizen working 100% remotely in English with US and APAC overlap via full-time remote roles (W-2 EOR or US LLC contract), fractional AI leadership, or fixed-scope two-week workflow sprints at jdurey.github.io/hire/.",
              },
            },
          ],
        }
      : null;
  const body = `
<section class="page-head">
  <p class="eyebrow">Applied AI Enablement · Agentic Workflow Orchestration · LLM QC</p>
  <h1>${esc(pageTitle)}</h1>
</section>
<div class="prose about">${bodyHtml}</div>`;
  return layout({
    site,
    title: pageTitle,
    description:
      "Joshua Durey (Josh Durey) - Applied AI Enablement Lead & Agentic Workflow Architect. 52,167 governed multi-agent runs, 30+ Python hook gates, cross-family LLM quality control, and SOP-to-SCORM compilers.",
    body,
    active: "about",
    canonicalPath,
    jsonLd: [profileLd, entityFaqLd].filter(Boolean),
  });
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
  <div class="hero-copy">
    <p class="eyebrow">Full-Time Remote · Fractional Lead · Fixed-Scope Sprint</p>
    <h1>${esc(offer.title)}</h1>
    <p class="lede">${esc(offer.subtitle || offer.summary)}</p>
    <div class="cta">
      <a class="btn btn-primary" href="#commission-prototype" data-funnel-cta="hire_prototype">Get a Free Day-1 Prototype</a>
      <a class="btn" href="${bookHref}"${bookAttrs} data-funnel-cta="hire_cal">${ctaLabel}</a>
      <a class="btn" href="/interview/" data-funnel-cta="hire_interview">Interview AI Josh (3m)</a>
      <a class="btn" href="/work/">See 56 Case Studies</a>
    </div>
  </div>
</section>
${proofStrip()}
${funnelWorkbench(site)}
${selfServeB2bKitsSection(site)}
<div class="prose offer-body">
${bodyHtml}
  <div class="cta cta-foot">
    <a class="btn btn-primary" href="${bookHref}"${bookAttrs}>${ctaLabel}</a>
    <a class="btn" href="#commission-prototype">Request Free Team Prototype</a>
  </div>
</div>
${funnelArchitectureSection()}`;
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
