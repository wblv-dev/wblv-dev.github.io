---
title: "wellbelove.org — Harry Wellbelove"
description: "Architecture and decision records for wellbelove.org — Eleventy site on GitHub Pages with DecapCMS for content editing."
summary: "This site. Eleventy on GitHub Pages with DecapCMS for content, a Cloudflare Worker for OAuth, and a scheduled rebuild for live GitHub stats."
genre: Software
order: 4
permalink: /wellbelove-org/
github_url: https://github.com/wblv-dev/wblv-dev.github.io
---

## Overview

*This site. An Eleventy-generated static site on GitHub Pages with DecapCMS for content editing and a Cloudflare Worker handling GitHub OAuth.*

wellbelove.org is my personal site — portfolio, blog, project docs, and everything else I want to put my name on. It's built with a small, deliberately boring stack: static generation, git-backed content, no database, no server-side code. The whole thing deploys on every push to `main`, plus once a day via a scheduled GitHub Action so the live GitHub stats on the homepage don't go stale.

<div class="callout">
<strong>Why this exists:</strong> I wanted somewhere I fully owned — no Medium, no Substack, no hosted CMS pricing model — where I could write, publish project docs, and demonstrate that I think about architecture decisions for my own work the same way I think about them for clients.
</div>

## Stack

- **[Eleventy](https://www.11ty.dev/) 3.x** — static site generator, Nunjucks templates, Markdown content
- **GitHub Pages** — hosting, free, single-repo deploys, HTTPS via custom domain
- **[DecapCMS](https://decapcms.org/)** — git-backed CMS, Blog + Docs collections, lives at `/admin/`
- **Cloudflare Worker** — GitHub OAuth proxy for DecapCMS (no server-side auth needed)
- **GitHub Actions** — build + deploy on push, daily cron rebuild for live stats
- **Vanilla CSS** — no framework, no Tailwind, one stylesheet

## Decision Records

### Static generation over a framework with runtime

I considered Next.js and Astro. Both are capable, both have features I don't need. Eleventy does one thing — turn templates and markdown into HTML — and does it without shipping JavaScript to the browser by default. For a portfolio site with a blog and a handful of project pages, runtime rendering adds complexity without benefit.

### GitHub Pages over Cloudflare Pages or Vercel

Cloudflare Pages has faster builds and edge functions. Vercel has better DX. I went with GitHub Pages because the site's content *lives* in a GitHub repo, the deploy target being the same platform removes a moving part, and the free tier is more than adequate. When I outgrow this — if I ever do — the static output is portable to either in minutes.

### DecapCMS + Cloudflare Worker for OAuth

DecapCMS edits content by committing to the repo, so there's no database and no hosted CMS to pay for or migrate off. Its only gap is auth: it needs an OAuth handshake with GitHub, and GitHub won't let you do that from a static site. The traditional answer is a small server (Netlify Identity, a Node service, etc.). Instead, the OAuth proxy runs as a single Cloudflare Worker — free tier, cold-start in milliseconds, one file of code.

### Single repo for site + project docs

Each of my public projects (`domain-security-toolkit`, `wblv-private-cloud-lab`, `ats-cvc`) is its own GitHub repo. Originally each had its own GitHub Pages deployment under a different path. That got messy — three deployments, three sources of truth for docs, and the URLs didn't line up. I consolidated everything under `wellbelove.org` and disabled Pages on the project repos. Now the canonical documentation for each project lives here, next to the portfolio and blog, and the project repos stay focused on code.

### Build-time GitHub data, daily cron for freshness

The homepage shows live GitHub stats — commits, active days, last push, most recent repo. I fetch that data at build time via GitHub's REST API and bake it into the static output. Client-side fetches would add a loading state, an API call per visitor, and a dependency on the API being reachable. Baking it in keeps the site fully static. To stop the data going stale between pushes, a GitHub Action rebuilds the site once a day at 06:00 UTC, which catches activity from the project repos too.

## Known Gaps

- The GitHub Events API is capped at 300 events over the last 90 days. Heavy activity in one repo (e.g. a day like the one where I built this site) fills the window and older events fall off. No workaround without a personal access token and GraphQL.
- No analytics yet. Will add something privacy-respecting (Plausible or self-hosted Umami) when there's a reason to look at traffic.
- No RSS feed. Worth adding once the blog has posts.

## Repo

The full source is on GitHub: [`wblv-dev/wblv-dev.github.io`](https://github.com/wblv-dev/wblv-dev.github.io). Pull requests welcome if you find something broken.
