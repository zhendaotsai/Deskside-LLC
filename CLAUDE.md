# Deskside — working notes for Claude (and humans)

Deskside builds private AI research agents for hedge funds and other buy-side firms, deployed inside the client's own environment by a small senior team. This repo is the marketing site at **https://desksidelabs.com** plus draft legal documents.

Read this before changing anything. If a request conflicts with a rule below, say so and ask.

## Repo map

```
index.html, services.html, security.html, about.html, contact.html, privacy.html, terms.html   pages (plain HTML)
assets/styles.css      all styles (one file, CSS custom properties on :root)
assets/main.js         nav, reveal-on-scroll, contact form, live-call demo, hero brief cycling
assets/scene.js        3D scenes: hero background field, coverage bars, research engine, cohort surface, enclave (three.js, self-hosted in assets/vendor/)
assets/glyphs.js       small frosted 3D objects in corner-bracket frames: any element with data-glyph="name" (one shared canvas)
assets/charts.js       illustrative SVG charts (synthetic data only)
assets/fonts/          self-hosted fonts (IBM Plex Sans, IBM Plex Mono, Newsreader)
legal/                 DRAFT client contract (MSA) + notes for counsel — not published
scripts/check.py       pre-merge checks (run before every PR)
```

No build step, no package manager. The header nav and footer are repeated in every page — change them everywhere (the check script enforces the nav).

## Run and check

```sh
python3 -m http.server 8000        # then open http://localhost:8000
python3 scripts/check.py           # must pass before merging
```

Also look at the change at desktop (~1440px) and phone (~390px) widths, and check the browser console for errors. Pages must not scroll sideways on a phone.

## Deploy

Vercel project `deskside-llc` (team "zhendaotsai's projects") auto-deploys the production branch on every push; every pull request gets a preview URL. DNS is on Cloudflare (records must be **DNS only**, not proxied). Email for `hello@desksidelabs.com` is Cloudflare Email Routing.

## Rules that must not be broken

**Confidentiality**
- Never name either founder's current or former employer, or internal project names, anywhere public. No founder names on the site for now.
- Never use or quote real positions, tickers from a real book, licensed vendor reports, or employer material. Do not name research vendors whose reports we studied privately (the check script has the list).
- All data in charts and demos is synthetic and labelled as such. Use generic names ("Company A", "Incumbent B").

**Privacy promise** (this is the core of the pitch)
- The site loads nothing from third parties: no Google Fonts, CDNs, analytics, pixels, embeds or form services. Self-host everything. If that ever changes, update `privacy.html` first.
- Every privacy claim on the site must match the contract (`legal/master-services-agreement.md`, Section 4): runs in the client's environment by default, never used to train models, never shared across clients, client owns what we build, returned/deleted with written certification at the end.

**Regulatory**
- Deskside is a technology vendor, not an investment adviser. No buy/sell recommendations or performance claims. No fake stats, testimonials or client logos.

## Voice and design

- Plain English for skeptical, busy finance readers. Specific over impressive. No hype words (unlock, empower, seamless, revolutionize, cutting-edge), no "not just X, it's Y", go easy on em dashes.
- Current headline: "Know what changed, and why it matters to your book." Lane: **forward-deployed engineers for buy-side research desks**. We connect the research a fund already pays for to its own notes, models and positions. Partner with data vendors, don't compete with them. Don't drift into ops, back-office or generic "AI for finance" copy.
- Meet analysts where they work: email briefs, their notes system, Excel. Never pitch a new platform.
- Demos are the proof: pre-open brief, transcript diff, redacted MNPI flag, sample deletion certificate. No case study or numbers from a client until a real, approved one exists.
- Brand: ink `#0f1720`, paper `#f6f4ef`, green `#6fd3a7` / `#1f6f5c`, brass `#c8a24a`; Newsreader (headings), IBM Plex Sans (body), IBM Plex Mono (labels). Logo is the "Enclave" mark in `assets/favicon.svg`.
- Charts: follow a validated, colorblind-safe palette; every chart has a legend, hover values, and a "View data table" option.
- 3D is part of the brand (founder decision, 2026-09-24): hero background field, coverage bars in the brief, research engine by the demos, cohort surface in alt data, enclave in security, plus small frosted "glyphs" in corner-bracket frames beside list items (see `assets/glyphs.js`; keep one meaning per object, e.g. lattice = research you license, orbit = your book, tray = delivery, stack = credit). Keep motion slow and subtle. New 3D should tie to something real where possible. All scenes pause off-screen, respect `prefers-reduced-motion`, and the page works without WebGL.
- Avoid the "AI template" look: at most one mono all-caps eyebrow (the hero), italic accent only in the hero H1, no three-dot window bars or symbol bullets, no fade-in on every block, no invented metrics (e.g. backtest accuracy), no "not X, it's Y" lines.

## Git workflow

See `CONTRIBUTING.md`. Short version: branch from `main`, open a pull request, check the Vercel preview, run `scripts/check.py`, merge. Never push directly to `main`.

## Open decisions (don't assume — ask)

- Entity: Delaware C-corp vs Canadian corporation (depends on where founders are resident).
- Vercel is on the Hobby plan, which is non-commercial; upgrade to Pro before selling.
