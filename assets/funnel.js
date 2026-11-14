// funnel.js - Interactive 3-Stage Edge Diagnostic, Employer Prototype Capture & First-Party ABM Telemetry.
// Zero external dependencies. Progressively enhances static HTML surfaces across jdurey.github.io.

const FUNNEL_API = "https://josh-employer-funnel.josh-durey.workers.dev";
const UTM_STORAGE_KEY = "jd_funnel_utm_v1";

const PRESETS = {
  enablement_jd: {
    mode: "jd",
    org: "B2B SaaS Team",
    text: "Role: Applied AI Enablement Lead (Remote). We bought LLM seats across Support, RevOps, and Product, but adoption stalled after initial demos. You will audit how non-technical teams work today, identify high-friction manual workflows worth automating, build self-checking agentic workflows with clear human checkpoints, train managers to use them safely, and put quality gates in place so outputs stay accurate.",
  },
  ai_ops_jd: {
    mode: "jd",
    org: "Growth-Stage Ops Team",
    text: "Role: AI Operations & Workflow Automation Strategist. Own internal multi-agent workflow design across Customer Onboarding, Knowledge Ops, and Deal Desk. Replace brittle single-prompt automations with deterministic routing, schema validation, model cost tiers, and measurable QA rubrics.",
  },
  support_workflow: {
    mode: "workflow",
    org: "Customer Trust & Support Ops",
    text: "Workflow bottleneck: Our support team handles 1,400 complex billing, refund, and webhook troubleshooting tickets per week. Our current AI draft bot sounds confident, hallucinates policy exceptions ~8% of the time, and forces senior reps to re-read every ticket from scratch, wiping out time savings.",
  },
  learning_workflow: {
    mode: "workflow",
    org: "Learning & Enablement Product",
    text: "Workflow bottleneck: Instructional designers and SMEs build assessments and guided tutoring flows, but single-model LLM graders wave through flawed distractors, leak graded answers through hints, and flip verdicts on identical student submissions.",
  },
};

function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

function captureUtmContext() {
  try {
    const params = new URLSearchParams(window.location.search);
    const prev = JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) || "{}");
    const merged = {
      utm_source: params.get("utm_source") || prev.utm_source || "",
      utm_medium: params.get("utm_medium") || prev.utm_medium || "",
      utm_campaign: params.get("utm_campaign") || prev.utm_campaign || "",
      first_referrer: prev.first_referrer || document.referrer || "",
      landing_path: prev.landing_path || window.location.pathname,
    };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (_) {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      first_referrer: document.referrer || "",
      landing_path: window.location.pathname,
    };
  }
}

export function trackFunnelEvent(eventName, extra = {}) {
  try {
    const utm = captureUtmContext();
    const path = window.location.pathname || "/";
    const forMatch = path.match(/^\/(?:for|audits)\/([^/]+)/);
    const inferredSlug = extra.slug || (forMatch ? forMatch[1] : "");
    const payload = JSON.stringify({
      event: eventName,
      path,
      slug: inferredSlug,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
      detail: extra.detail || "",
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(`${FUNNEL_API}/api/funnel/event`, blob);
    } else {
      fetch(`${FUNNEL_API}/api/funnel/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (_) {
    // Telemetry never blocks UI
  }
}

function installAbmAutoTracking() {
  captureUtmContext();
  const path = window.location.pathname || "/";
  if (/^\/(?:for|audits)\/[^/]+/.test(path)) {
    trackFunnelEvent("for_project_view");
  } else if (path.startsWith("/hire")) {
    trackFunnelEvent("hire_page_view");
  } else if (path.startsWith("/interview")) {
    trackFunnelEvent("interview_page_view");
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.includes("cal.com/joshua-durey")) {
      trackFunnelEvent("cal_booking_click", { detail: path });
    } else if (href.endsWith(".py") || href.includes("orchestrator_")) {
      trackFunnelEvent("orchestrator_download", { detail: href });
    } else if (href.includes("/interview")) {
      trackFunnelEvent("interview_cta_click", { detail: path });
    } else if (link.dataset.funnelCta) {
      trackFunnelEvent("funnel_cta_click", { detail: link.dataset.funnelCta });
    }
  });
}

function buildBlueprintMarkdown(data) {
  const b = data.blueprint || {};
  const inData = data.intake || {};
  const q = data.quality_gate || {};
  const t = data.telemetry || {};
  const lines = [
    `# ${b.workflow_title || "Agentic Workflow & Enablement Blueprint"}`,
    ``,
    `- **Generated via:** Josh Durey Live Multi-Agent Funnel (https://jdurey.github.io)`,
    `- **Trace SHA-256:** \`${data.trace_sha256}\``,
    `- **Edge Models:** \`${t.stage1_model}\` (${t.stage1_ms}ms) -> \`${t.stage2_model}\` (${t.stage2_ms}ms) || \`${t.stage3_model}\` (${t.stage3_ms}ms)`,
    `- **Capability Lane:** \`${inData.lane}\``,
    `- **Quality Gate Verdict:** \`${q.gate_verdict}\` (Readiness ${q.readiness_score}/100)`,
    ``,
    `## 1. Extracted Friction & Failure Risks`,
    ...(inData.manual_bottlenecks || []).map((x) => `- **Bottleneck:** ${x}`),
    ...(inData.silent_failure_modes || []).map((x) => `- **Unflagged Failure Risk:** ${x}`),
    `- **Human Checkpoint Boundary:** ${inData.human_checkpoint || ""}`,
    ``,
    `## 2. 4-Node Self-Checking Agentic Architecture`,
    ...(b.dag_nodes || []).map((n) => `- **${n.node}** (\`${n.tier}\`): ${n.spec}`),
    ``,
    `**Cost Routing Principle:** ${b.cost_routing_note || ""}`,
    ``,
    `## 3. Cross-Family Gate Audit`,
    `- **Why Naive Pilots Stall Here:** ${q.naive_pilot_trap || ""}`,
    `- **Guardrail Added:** ${q.guardrail_added || ""}`,
    ``,
    `## 4. First-30-Day Enablement Plan`,
    ...(b.first_30_days || []).map((d) => `- **${d.window}:** ${d.deliverable}`),
    ``,
    `## Next Step`,
    `- Book a 20-minute scope or hiring call: https://cal.com/joshua-durey-wqgvgp/20-min-scope-call`,
    `- Interview AI Josh (3-min live video twin): https://jdurey.github.io/interview/`,
    `- Full runnable portfolio: https://jdurey.github.io/work/`,
  ];
  return lines.join("\n");
}

function installDiagnosticWidget() {
  const rootEl = document.querySelector("[data-diagnostic-root]");
  if (!rootEl) return;

  const modeBtns = [...rootEl.querySelectorAll("[data-diag-mode]")];
  const presetBtns = [...rootEl.querySelectorAll("[data-diag-preset]")];
  const orgInput = rootEl.querySelector("[data-diag-org]");
  const textInput = rootEl.querySelector("[data-diag-input]");
  const runBtn = rootEl.querySelector("[data-diag-run]");
  const statusEl = rootEl.querySelector("[data-diag-status]");
  const resultEl = rootEl.querySelector("[data-diag-result]");

  let currentMode = "jd";
  let lastBlueprintMd = "";
  let lastSha = "";

  const setMode = (mode) => {
    currentMode = mode === "workflow" ? "workflow" : "jd";
    modeBtns.forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.diagMode === currentMode));
    });
    if (textInput) {
      textInput.placeholder =
        currentMode === "jd"
          ? "Paste an open role title, job description snippet, or team mandate (e.g. Applied AI Enablement Lead, AI Operations Strategist)..."
          : "Describe a manual team bottleneck or stalled AI pilot (e.g. Support drafts hallucinate refund rules, reps re-read every output)...";
    }
  };

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.diagMode));
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = PRESETS[btn.dataset.diagPreset];
      if (!p) return;
      setMode(p.mode);
      if (orgInput) orgInput.value = p.org;
      if (textInput) textInput.value = p.text;
      presetBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });

  if (!runBtn || !textInput) return;

  runBtn.addEventListener("click", async () => {
    const raw = textInput.value.trim();
    const orgHint = orgInput ? orgInput.value.trim() : "";
    if (raw.length < 20) {
      if (statusEl) {
        statusEl.textContent = "Paste at least one sentence (or click one of the 4 preset chips above) to run the 3-stage pipeline.";
        statusEl.dataset.state = "warn";
      }
      textInput.focus();
      return;
    }

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = "Running 3-Vendor Pipeline...";
    if (resultEl) resultEl.hidden = true;

    const steps = [
      "[Stage 1/3] Mistral Small 3.1 24B: extracting workflow friction & failure risks...",
      "[Stage 2/3] Meta Llama 3.3 70B: architecting 4-node self-checking DAG + 30-day plan...",
      "[Stage 3/3] Qwen 2.5 32B (Cross-Family Gate): auditing single-judge blindspots & SHA receipt...",
    ];
    let stepIdx = 0;
    if (statusEl) {
      statusEl.dataset.state = "running";
      statusEl.textContent = steps[0];
    }
    const timer = window.setInterval(() => {
      stepIdx = Math.min(steps.length - 1, stepIdx + 1);
      if (statusEl) statusEl.textContent = steps[stepIdx];
    }, 2100);

    try {
      const resp = await fetch(`${FUNNEL_API}/api/funnel/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: currentMode, org_hint: orgHint, input: raw }),
      });
      const data = await resp.json();
      window.clearInterval(timer);

      if (!resp.ok || !data.ok) {
        throw new Error(data.error || "Diagnostic service unavailable.");
      }

      lastSha = data.trace_sha256 || "";
      lastBlueprintMd = buildBlueprintMarkdown(data);
      trackFunnelEvent("diagnostic_completed", { detail: `${data.intake?.lane || ""}:${lastSha}` });

      // Pre-populate the Employer Prototype Capture form on the same page so conversion takes 10 seconds!
      const capCompany = document.querySelector("[data-capture-company]");
      const capScope = document.querySelector("[data-capture-scope]");
      const capSha = document.querySelector("[data-capture-sha]");
      if (capCompany && !capCompany.value && data.intake?.inferred_org && data.intake.inferred_org !== "Target Team") {
        capCompany.value = data.intake.inferred_org;
      }
      if (capScope && !capScope.value) {
        capScope.value = raw.slice(0, 600);
      }
      if (capSha) {
        capSha.value = lastSha;
      }

      if (statusEl) {
        statusEl.dataset.state = "done";
        statusEl.textContent = `Completed in ${(data.telemetry.total_ms / 1000).toFixed(1)}s across 3 model families · SHA-256 ${lastSha}`;
      }

      if (resultEl) {
        const dagHtml = (data.blueprint?.dag_nodes || [])
          .map(
            (n) => `<div class="dag-node">
              <div class="dag-tier">${escHtml(n.tier)}</div>
              <h4>${escHtml(n.node)}</h4>
              <p>${escHtml(n.spec)}</p>
            </div>`
          )
          .join("");

        const planHtml = (data.blueprint?.first_30_days || [])
          .map((d) => `<li><strong>${escHtml(d.window)}:</strong> ${escHtml(d.deliverable)}</li>`)
          .join("");

        const proofsHtml = (data.matched_proofs || [])
          .map(
            (p) => `<a class="proof-mini" href="${escHtml(p.url)}">
              <span class="tag tag-eval">${escHtml(p.tag)}</span>
              <strong>${escHtml(p.title)} -></strong>
              <span>${escHtml(p.why)}</span>
            </a>`
          )
          .join("");

        resultEl.innerHTML = `
          <div class="diag-receipt-bar">
            <div>
              <span class="tag tag-systems">${escHtml(data.quality_gate?.gate_verdict || "VERIFIED")}</span>
              <span class="mono-dim">Readiness ${escHtml(data.quality_gate?.readiness_score)}/100 · Stage 1 ${escHtml(data.telemetry?.stage1_ms)}ms · Stage 2 ${escHtml(data.telemetry?.stage2_ms)}ms · Gate ${escHtml(data.telemetry?.stage3_ms)}ms</span>
            </div>
            <div class="diag-receipt-actions">
              <button type="button" class="btn btn-sm" data-download-blueprint>Download Blueprint (.md)</button>
              <a class="btn btn-sm btn-primary" href="#commission-prototype" data-funnel-cta="diag_to_prototype">Build Live Prototype Free -></a>
            </div>
          </div>

          <h3 class="diag-out-title">${escHtml(data.blueprint?.workflow_title)}</h3>

          <div class="diag-gate-callout">
            <div><strong>Why standard pilots stall here:</strong> ${escHtml(data.quality_gate?.naive_pilot_trap)}</div>
            <div><strong>Cross-family guardrail wired in:</strong> ${escHtml(data.quality_gate?.guardrail_added)}</div>
          </div>

          <div class="dag-grid">${dagHtml}</div>

          <div class="diag-two-col">
            <div class="diag-subpanel">
              <h4>First-30-Day Rollout &amp; Adoption Plan</h4>
              <ul class="diag-list">${planHtml}</ul>
              <p class="diag-cost-note"><strong>6-Rung Cost Routing:</strong> ${escHtml(data.blueprint?.cost_routing_note)}</p>
            </div>
            <div class="diag-subpanel">
              <h4>Matched Runnable Receipts on This Site</h4>
              <div class="proof-mini-stack">${proofsHtml}</div>
            </div>
          </div>
        `;
        resultEl.hidden = false;

        const dlBtn = resultEl.querySelector("[data-download-blueprint]");
        if (dlBtn) {
          dlBtn.addEventListener("click", () => {
            const blob = new Blob([lastBlueprintMd], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `agentic-blueprint-${lastSha || "josh-durey"}.md`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            trackFunnelEvent("blueprint_downloaded", { detail: lastSha });
          });
        }
      }
    } catch (err) {
      window.clearInterval(timer);
      if (statusEl) {
        statusEl.dataset.state = "warn";
        statusEl.textContent = `${err.message || "Could not reach edge worker."} You can still request a custom Mac Studio prototype directly below.`;
      }
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  });
}

function installCaptureForms() {
  const forms = [...document.querySelectorAll("[data-employer-capture-form]")];
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const feedbackEl = form.parentElement.querySelector("[data-capture-feedback]");
      const utm = captureUtmContext();

      const fd = new FormData(form);
      const payload = {
        work_email: String(fd.get("work_email") || "").trim(),
        company: String(fd.get("company") || "").trim(),
        name: String(fd.get("name") || "").trim(),
        track: String(fd.get("track") || "full_time").trim(),
        role_or_workflow: String(fd.get("role_or_workflow") || "").trim(),
        diagnostic_sha: String(fd.get("diagnostic_sha") || "").trim(),
        website_hp: String(fd.get("website_hp") || "").trim(),
        page_path: window.location.pathname || "/",
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        referrer: utm.first_referrer,
      };

      if (!payload.work_email || !payload.work_email.includes("@")) {
        if (feedbackEl) {
          feedbackEl.hidden = false;
          feedbackEl.innerHTML = `<p class="cap-err">Please enter a valid work email so the Mac Studio runner can deliver your prototype and CV.</p>`;
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Dispatching to Edge Queue...";
      }

      try {
        const resp = await fetch(`${FUNNEL_API}/api/funnel/capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await resp.json();
        if (!resp.ok || !data.ok) {
          throw new Error(data.error || "Could not submit request.");
        }

        trackFunnelEvent("lead_captured", { detail: `${payload.track}:${data.receipt_id}` });
        form.hidden = true;

        if (feedbackEl) {
          const stepsHtml = (data.pipeline_steps || [])
            .map(
              (s) => `<li data-step-state="${escHtml(s.state)}">
                <strong>${escHtml(s.step)}</strong>
                <span>${escHtml(s.detail)}</span>
              </li>`
            )
            .join("");

          feedbackEl.hidden = false;
          feedbackEl.innerHTML = `
            <div class="cap-receipt" data-receipt-box="${escHtml(data.receipt_id)}">
              <div class="card-meta">
                <span class="tag tag-systems">Autonomous Pipeline Queued</span>
                <code class="mono-dim">${escHtml(data.receipt_id)}</code>
              </div>
              <h3>Custom Day-1 prototype queued for ${escHtml(data.company)}</h3>
              <p class="muted" data-live-stage-label>My Mac Studio M5 Ultra multi-agent runner picks up queued requests every 20 minutes, executes a 4-stage workflow + 3-family evaluation jury for your team, deploys to <code>${escHtml(data.expected_prototype_url)}</code>, and emails you the live link with my role-matched CV.</p>
              <ul class="cap-pipeline-list">${stepsHtml}</ul>
              <div class="cta" style="margin-top:1rem">
                <a class="btn btn-primary" href="${escHtml(data.cal_url)}" target="_blank" rel="noopener">Skip the Wait: Book 20-Min Call</a>
                <a class="btn" href="${escHtml(data.interview_url)}">Interview AI Josh Now (3m)</a>
              </div>
            </div>
          `;

          // Poll receipt status politely while tab stays open
          let polls = 0;
          const pollTimer = window.setInterval(async () => {
            polls += 1;
            if (polls > 40 || document.hidden) return;
            try {
              const stResp = await fetch(`${FUNNEL_API}/api/funnel/status/${encodeURIComponent(data.receipt_id)}`);
              if (!stResp.ok) return;
              const stData = await stResp.json();
              if (stData.status === "fulfilled" && stData.prototype_url) {
                window.clearInterval(pollTimer);
                const lbl = feedbackEl.querySelector("[data-live-stage-label]");
                if (lbl) {
                  lbl.innerHTML = `<strong>Live now:</strong> Your custom prototype is deployed at <a href="${escHtml(stData.prototype_url)}">${escHtml(stData.prototype_url)}</a> and has been emailed with my role-matched CV.`;
                }
              }
            } catch (_) {
              // ignore transient poll errors
            }
          }, 15000);
        }
      } catch (err) {
        if (feedbackEl) {
          feedbackEl.hidden = false;
          feedbackEl.innerHTML = `<p class="cap-err">${escHtml(err.message)} Or email <a href="mailto:josh.durey@gmail.com">josh.durey@gmail.com</a> directly.</p>`;
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Commission Free Prototype + CV";
        }
      }
    });
  });
}

installAbmAutoTracking();
installDiagnosticWidget();
installCaptureForms();
