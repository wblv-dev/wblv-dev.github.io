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
- **Cloudflare DNS + Proxy** — domain + CDN in front of GitHub Pages
- **GitHub Actions** — build + deploy on push, daily 06:00 UTC cron rebuild for live stats
- **[Formspree](https://formspree.io/)** — contact form backend, no server required
- **Vanilla CSS** — no framework, no Tailwind, two stylesheets (site + docs layout)

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

### Per-repo `/commits` endpoint instead of public events

I originally used GitHub's public events API for the commit count, but it's capped at 300 events over 90 days and strips commit-count fields from push events. That produced inaccurate totals — active days where the homepage still said "0 commits". I switched to calling `/repos/{owner}/{repo}/commits?author={user}&since=...` per public repo and aggregating the results. One extra API call per repo, but the counts are real.

### Per-project docs sidebars, not a unified one

Each project's docs page has its own sidebar listing the H2 and H3 headings of that page, populated at runtime by JavaScript. I considered a shared sidebar listing every project's sections — the Cloudflare-docs model — but it would have required users to scroll through unrelated projects to find what they wanted. The per-project sidebar matches how people actually read docs: pick a project, then navigate within it. A "← All projects" link lives at the top of each sidebar for wayfinding.

## Frontend Architecture

### CSS approach

Two stylesheets — `style.css` for the main site and `docs.css` for the docs layout. No framework, no Tailwind, no preprocessor. CSS custom properties hold the design tokens (colours, font stacks, spacing scale) so the theme can change from one file.

Inline styles are used liberally on one-off elements (page-specific layouts, hero sections) and factored into classes only when a pattern repeats. It's a deliberate trade-off — a little duplication in exchange for not having to maintain a large class vocabulary for a small site.

### Responsive grids

The homepage and projects page use `grid-template-columns: repeat(auto-fit, minmax(min(100%, Npx), 1fr))` with `min-width: 0` on every grid item. Two deliberate choices:

- **`min(100%, Npx)`** lets a column collapse to 100% of its parent when there isn't room for even one full-width cell. Plain `minmax(Npx, 1fr)` would blow out the grid on very narrow viewports.
- **`min-width: 0`** on grid items is the escape hatch for content with `white-space: nowrap`. Without it, grid items default to `min-width: auto` (their content size), and any un-wrappable element expands its column, which expands the grid, which pushes the page wider than the viewport. A nowrapped repo name in the homepage activity panel was doing exactly this — losing the whole mobile layout in the process.

### CSS cache-busting

Stylesheet `<link>` tags include a manual version query string (`?v=2026-04-05-e`). When I ship CSS changes I bump the version. Without it, Cloudflare's CDN and GitHub Pages' cache happily serve stale CSS to visitors whose browsers have cached the unversioned URL — which bit me during the mobile-layout rebuild when fixes looked broken because the new CSS wasn't reaching the browser.

## Accessibility

The site targets WCAG 2.1 AA. Specific things I did rather than leave to luck:

- Body/label colours (`--muted`, `--dim`) tuned to pass 4.5:1 contrast on the `#0f0f0f` background. The dimmest decorative tier (`--faint`) is only used on elements that aren't text.
- `:focus-visible` outline on every interactive element so keyboard users can see what's focused. Form inputs, buttons, and the nav toggle get the ring directly on the element; links get it with a small offset.
- `@media (prefers-reduced-motion: reduce)` kills the fade-in entry animations for anyone who's opted out of motion in their OS.
- Hover states use CSS `:hover` rather than inline `onmouseover` handlers — the latter don't fire on keyboard focus, so using them to show interactive affordances silently excludes keyboard users.
- The viewport meta tag allows pinch-zoom; no `user-scalable=no`.
- Navigation, main content, and footer are all proper landmark elements (`<nav>`, `<main>`, `<footer>`), and there's a single `<h1>` per page.

## SEO & shareability

- **Open Graph + Twitter Card** meta tags on every public page so shared links render with a title and description instead of the raw URL. On the first share attempts the Whatsapp preview was three copies of `wellbelove.org` — this is what fixed it.
- **JSON-LD `Person` schema** in the base layout head with name, job title, location, and linked social profiles. Google's knowledge panel reads this.
- **`/sitemap.xml`** generated at build time from the base-layout pages (home, about, projects, blog, contact). Docs pages are noindex and excluded.
- **`/robots.txt`** points crawlers at the sitemap and disallows `/admin/` (the DecapCMS interface).
- **Custom `/404.html`** with recovery links back to home, projects, and contact. GitHub Pages serves it automatically for unknown paths.

## Known Gaps

- No analytics yet. Will add something privacy-respecting (Plausible or self-hosted Umami) when there's a reason to look at traffic.
- No RSS feed. Worth adding once the blog has posts.
- The `?v=` cache-busting is manual — I remember to bump it when I ship CSS changes. A build-time hash would be more reliable but adds complexity that doesn't feel worth it yet.
- Email addresses are plain text in the HTML. They'll get scraped eventually, but the contact form handles the primary path and Formspree/Outlook between them catch the spam.

## Repo

The full source is on GitHub: [`wblv-dev/wblv-dev.github.io`](https://github.com/wblv-dev/wblv-dev.github.io). Pull requests welcome if you find something broken.
