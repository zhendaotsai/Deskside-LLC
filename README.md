# Deskside

Marketing site for Deskside (**https://desksidelabs.com**): private AI research agents for hedge funds and other buy-side firms, deployed inside the client's environment.

A static site: plain HTML, CSS and a little JS. No build step, no dependencies to install.

```
index.html          Landing page
services.html       Solutions, engagement models, FAQ
about.html          Story, principles, experience
contact.html        Contact form (opens the visitor's email client)
privacy.html        Privacy policy
terms.html          Website terms of use
assets/             styles.css, main.js (UI), scene.js (3D), charts.js (illustrative charts), fonts, logos
assets/vendor/      three.js r169 (MIT), self-hosted
legal/              Draft client contract and notes for counsel (not published on the site)
scripts/check.py    Pre-merge checks
```

**Start here:** `CLAUDE.md` (rules and context) and `CONTRIBUTING.md` (how we branch, review and merge).

## Run and check locally

```sh
python3 -m http.server 8000     # open http://localhost:8000
python3 scripts/check.py        # broken links, third-party loads, banned names, nav consistency
```

## Hosting

| What | Where |
|---|---|
| Site | Vercel project `deskside-llc`; deploys the production branch on every push; previews on every PR |
| Domain | `desksidelabs.com` registered on Cloudflare; DNS records set to **DNS only** (not proxied) |
| Email | `hello@desksidelabs.com` via Cloudflare Email Routing |

Vercel's Hobby plan is non-commercial; move to Pro before taking clients.

## Brand assets

| File | Use |
|---|---|
| `assets/favicon.svg` | Primary mark on a dark tile: favicon, light backgrounds, avatars |
| `assets/logo-mark.svg` | Mark only, for light backgrounds (no tile) |
| `assets/logo-mark-dark.svg` | Mark only, for dark backgrounds (no tile) |
| `assets/apple-touch-icon.png` | 180×180 home-screen icon |
| `assets/og-image.png` | 1200×630 social share card (LinkedIn, Slack, iMessage) |

The mark is a D-shaped enclave with a data point secured inside, standing for "your data stays inside your walls." Colors: ink `#0f1720`, paper `#f6f4ef`, green `#6fd3a7` / `#1f6f5c`, brass `#c8a24a`. Wordmark: Newsreader SemiBold.
