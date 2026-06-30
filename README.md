# jdurey.github.io — portfolio

Static, dependency-light portfolio for **AI evaluation & red-team** work. Markdown in,
HTML out, regenerated nightly. Lives at <https://jdurey.github.io>.

## How it works

```
content/            source of truth
  site.json         site-level config (name, links, hero, thesis)
  about.md          about/hire-me page
  case-studies/*.md one markdown file per case study (frontmatter + body)
harnesses/          runnable eval/red-team code referenced by case studies
scripts/
  render.mjs            HTML templates
  firewall-scan.mjs     CLEAN-ROOM GATE — aborts on any employer/NDA marker
  firewall-denylist.json the denylist (edit deliberately)
  nightly.mjs           the unattended engine (discover → gate → build → gate → publish)
build.mjs           static site generator → dist/
tests/              firewall regression tests
```

## Commands

```bash
npm install
npm run build      # content → dist/
npm run gate       # full gate: scan source → build → scan dist
npm test           # firewall regression tests
node scripts/nightly.mjs   # one nightly cycle (dry-run unless PUBLISH=1)
```

## The clean-room gate (why this repo is safe to auto-publish)

Everything here is public by construction. The firewall scanner runs **three times**
around every publish — locally pre-commit, in GitHub Actions, and in Netlify's build —
and aborts the deploy on any employer name, internal codename, person, or NDA marker.
A leak is treated as catastrophic; a false block just skips one publish. Edit the
denylist deliberately; every removal is a reviewed decision.

## Publishing

Two targets, both building from this repo with the same gate:
- **GitHub Pages** via `.github/workflows/deploy.yml` (the `jdurey.github.io` user site).
- **Netlify** via `netlify.toml` (custom domain when ready — set `customDomain` in `site.json`).

The nightly engine commits + pushes when `PUBLISH=1`; the push triggers both deploys.
