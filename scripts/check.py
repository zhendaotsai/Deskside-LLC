#!/usr/bin/env python3
"""Pre-merge checks for the Deskside site. Standard library only.

Run from the repo root:  python3 scripts/check.py

Fails (exit 1) if:
  - a page links to a local file that doesn't exist
  - anything loads from a third-party server (the privacy policy promises it doesn't)
  - a confidential or banned term appears in public site files
  - the header nav differs between pages
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = sorted(ROOT.glob("*.html"))
SITE_ASSETS = [p for p in (ROOT / "assets").rglob("*") if p.suffix in {".js", ".css"} and "vendor" not in p.parts]

# Names that must never appear on the public site: current/former employers, internal projects,
# and research vendors whose (licensed, confidential) reports informed our designs.
# Generic mentions of tools a client already uses (e.g. "Excel, Bloomberg, your OMS") are fine.
BANNED = [
    "citadel", "surveyor", "venator",
    "yipit", "m science", "mscience", "edgewater", "cleveland research",
]
# Absolute URLs that may be referenced by pages (our own domain, used for social share tags).
ALLOWED_HOSTS = {"desksidelabs.com", "www.desksidelabs.com"}

errors = []


def rel(p):
    return p.relative_to(ROOT).as_posix()


# 1. Local links resolve
for page in PAGES:
    html = page.read_text(encoding="utf-8")
    for attr, url in re.findall(r'\b(href|src)="([^"]+)"', html):
        if url.startswith(("#", "mailto:", "tel:", "http://", "https://", "data:")):
            continue
        target = (page.parent / url.split("#")[0].split("?")[0]).resolve()
        if not target.exists():
            errors.append(f"{rel(page)}: broken {attr} -> {url}")

# 2. No third-party loads (scripts, styles, fonts, images, fetches)
load_patterns = [
    r'<script[^>]+src="(https?://[^"]+)"',
    r'<link[^>]+href="(https?://[^"]+)"[^>]*rel="(?:stylesheet|preconnect|preload|icon|apple-touch-icon)"',
    r'<link[^>]+rel="(?:stylesheet|preconnect|preload|icon|apple-touch-icon)"[^>]*href="(https?://[^"]+)"',
    r'<(?:img|iframe|video|audio|source)[^>]+src="(https?://[^"]+)"',
    r'url\(["\']?(https?://[^)"\']+)',
    r'(?:import|fetch)\s*\(?\s*["\'](https?://[^"\']+)',
]
for f in PAGES + SITE_ASSETS:
    text = f.read_text(encoding="utf-8")
    for pat in load_patterns:
        for url in re.findall(pat, text):
            host = re.sub(r"^https?://", "", url).split("/")[0]
            if host not in ALLOWED_HOSTS:
                errors.append(f"{rel(f)}: loads third-party resource {url}")

# 3. Banned terms in public files
for f in PAGES + SITE_ASSETS:
    text = f.read_text(encoding="utf-8").lower()
    for term in BANNED:
        if re.search(r"\b" + re.escape(term) + r"\b", text):
            errors.append(f"{rel(f)}: contains banned term '{term}'")

# 4. Header nav is identical on every page (ignoring which item is marked current)
navs = {}
for page in PAGES:
    m = re.search(r'<ul class="nav-links"[^>]*>(.*?)</ul>', page.read_text(encoding="utf-8"), re.S)
    if m:
        navs[rel(page)] = re.sub(r'\s+aria-current="page"', "", re.sub(r"\s+", " ", m.group(1))).strip()
if len(set(navs.values())) > 1:
    base = navs.get("index.html")
    for name, nav in navs.items():
        if nav != base:
            errors.append(f"{name}: header nav differs from index.html")

if errors:
    print("Checks FAILED:")
    for e in errors:
        print("  - " + e)
    sys.exit(1)
print(f"All checks passed ({len(PAGES)} pages, {len(SITE_ASSETS)} assets).")
