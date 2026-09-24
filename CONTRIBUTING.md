# How we work on this repo

Two founders, plus Claude sessions, all editing the same site. The goal: nothing reaches desksidelabs.com without a second pair of eyes and a passing check.

## The flow

1. **Start from `main`.** `git checkout main && git pull`
2. **Make a branch** named for the change: `site/faq-pricing`, `copy/hero-rewrite`, `legal/msa-v2`. Claude sessions use `claude/...` branches.
3. **Make the change, then run the checks:**
   ```sh
   python3 scripts/check.py
   python3 -m http.server 8000   # look at it on desktop and phone widths
   ```
4. **Open a pull request into `main`.** Fill in the checklist in the PR template. Vercel posts a preview link on the PR within a minute.
5. **The other founder reviews the preview**, not just the diff. Approve or comment.
6. **Merge.** `main` deploys to desksidelabs.com automatically.

Small typo fixes can be self-merged after the checks pass. Anything touching the privacy promise, legal pages, pricing, or claims about what we do needs the other founder's approval.

## Commit messages

One line saying what changed and why, in plain English: `Add pricing ranges to Services FAQ`, not `update`.

## Working with Claude

- Claude reads `CLAUDE.md` first. If you make a decision that should stick (a word we never use, a claim we won't make), add it there in the same PR.
- Ask Claude to open a PR rather than push to `main`.
- Review Claude's PRs the same way as each other's: open the preview, read the copy out loud.

## What does not go in this repo

- Anything from either founder's employer, or any licensed vendor data or reports.
- Client names, client data, or anything under NDA.
- Passwords, API keys, or tokens (use the shared password vault).

The repo may be public. Treat everything committed here as something a prospect could read.
