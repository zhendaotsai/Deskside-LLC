# Deskside

Marketing site for Deskside LLC (desksidelabs.com): forward-deployed AI engineers for hedge funds and investment firms.

A static site with plain HTML, CSS, and a little JS. No build step.

```
index.html      Landing page
services.html   Services, engagement models, FAQ
about.html      Story, principles, experience
contact.html    Contact form (opens the visitor's email client)
assets/         styles.css, main.js (UI), scene.js (3D accents), favicon.svg
assets/vendor/  three.js r169 (MIT), self-hosted
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host works: Vercel, Netlify, Cloudflare Pages, or GitHub Pages (Settings → Pages → deploy from branch, root).

## Before launch

- [ ] Register `desksidelabs.com` and set up the `hello@desksidelabs.com` mailbox (Google Workspace, Fastmail, or a forwarder)
- [ ] Confirm the location ("New York, NY") in the footer and on the contact page
- [ ] Optional: send the contact form to Formspree or Basin instead of `mailto:`
- [ ] Optional: add analytics and a social share image (`og:image`)

The header and footer are repeated in each page. If you change one, change them all.

## Brand assets

| File | Use |
|---|---|
| `assets/favicon.svg` | Primary mark on a dark tile: favicon, light backgrounds, avatars |
| `assets/logo-mark.svg` | Mark only, for light backgrounds (no tile) |
| `assets/logo-mark-dark.svg` | Mark only, for dark backgrounds (no tile) |
| `assets/apple-touch-icon.png` | 180×180 home-screen icon |
| `assets/og-image.png` | 1200×630 social share card (LinkedIn, Slack, iMessage) |

The mark is a D-shaped enclave with a data point secured inside, standing for "your data stays inside your walls." Colors: ink `#0f1720`, paper `#f6f4ef`, green `#6fd3a7` / `#1f6f5c`, brass `#c8a24a`. Wordmark: Newsreader SemiBold.
