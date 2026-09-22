# Deskside

Marketing site for Deskside LLC: forward-deployed AI engineers for hedge funds and investment firms.

A static site with plain HTML, CSS, and a little JS. No build step.

```
index.html      Landing page
services.html   Services, engagement models, FAQ
about.html      Story, principles, founders
contact.html    Contact form (opens the visitor's email client)
assets/         styles.css, main.js, favicon.svg
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host works: Vercel, Netlify, Cloudflare Pages, or GitHub Pages (Settings → Pages → deploy from branch, root).

## Before launch

- [ ] Replace `hello@deskside.ai` with your real address (all pages, plus `data-to` on the contact form)
- [ ] Confirm the location ("New York, NY") in the footer and on the contact page
- [ ] Add founder names, photos, and bios in `about.html` (look for the `TODO`)
- [ ] Optional: send the contact form to Formspree or Basin instead of `mailto:`
- [ ] Optional: add analytics and a social share image (`og:image`)

The header and footer are repeated in each page. If you change one, change them all.
