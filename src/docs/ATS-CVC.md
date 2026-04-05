---
title: "ATS-CVC — Harry Wellbelove"
description: "CV gap analysis tool. Compares your CV against a job description using the ATS-CVC Framework."
summary: "CV gap analysis tool. Compares your CV against a job description using the ATS-CVC Framework, highlighting what's missing, undersold, and what a hiring manager will probe on."
genre: Tool
order: 3
permalink: /ATS-CVC/
github_url: https://github.com/wblv-dev/ATS-CVC
---

## Overview

*A CV gap analysis tool that compares your CV against a job description using the ATS-CVC Framework — highlighting what's missing, undersold, and what a hiring manager will probe on.*

ATS-CVC is not a CV writer. It's an analytical tool that identifies gaps, framing mismatches, and interview risks between a specific CV and a specific job description. The framework, backed by evidence and research, is the product — AI is the analytical engine.

<div class="callout">
<strong>The problem:</strong> Candidates often have the right experience but describe it in the wrong language for the role. Generic CV advice doesn't help. This tool gives honest feedback on whether you're competitive, and what to fix, before you invest in a full rewrite.
</div>

## Live Tool

**[Try the tool →](https://wellbelove.org/ATS-CVC/tool/)**

The tool runs entirely in your browser. No server, no database, no tracking. Bring your own API key from any of the four supported providers.

## The Framework

### Outputs

The ATS-CVC Framework produces five structured outputs from any CV + JD pair:

<div class="card mb-md">
<table class="spec-table">
<tr><td>Role Fit</td><td>Percentage score with detailed breakdown of alignment</td></tr>
<tr><td>Seniority Calibration</td><td>Whether the CV reads at the right level for the role</td></tr>
<tr><td>Keyword Gap</td><td>Present, missing, and framing mismatches</td></tr>
<tr><td>Expand These Points</td><td>Specific CV sections underselling their value</td></tr>
<tr><td>Interview Risk Flags</td><td>What hiring managers are likely to probe on</td></tr>
</table>
</div>

### Four Guardrails

The framework operates under four non-negotiable constraints to prevent CV fraud:

1. **No invented quantification** — never suggest metrics not evidenced in the CV
2. **No verb upgrades beyond accuracy** — don't overclaim ownership versus contribution
3. **No unevidenced skill assumptions** — don't add skills not actually in the CV
4. **Flag every assumption explicitly** — make visible every inference that needs verification

These exist because the tool is supposed to make candidates more competitive honestly, not help them misrepresent themselves. A candidate following the tool's advice should still be able to defend every claim on their CV in an interview.

### AI Provider Support

Bring your own API key from any of:

- **Anthropic Claude**
- **OpenAI GPT**
- **Google Gemini**
- **Mistral** (includes free tier)

API keys are never stored. They live only in memory during the session and are explicitly cleared on page close. No keys are logged, persisted, or transmitted anywhere except to the chosen provider's API.

### Evidence Base

The framework is backed by primary research sources. It explicitly debunks common CV myths — for example, the widely-repeated "75% ATS auto-rejection" statistic, which turns out to be fabricated and not traceable to any published study.

The methodology documentation (`METHODOLOGY.md` in the repo) includes:

- ATS reality check and recruiter screening research
- Eight-stage manual CV tailoring process
- Five analytical output specifications
- ATS-safe CV format specification
- Full evidence base with primary sources and URLs

## Architecture

### Design

The tool is a **single HTML file** (~60KB) with no build step, no bundler, no server, and no dependencies to install. This is deliberate.

<div class="card mb-md">
<table class="spec-table">
<tr><td>Architecture</td><td>Single-file HTML/CSS/JavaScript</td></tr>
<tr><td>PDF parsing</td><td>PDF.js v3.11.174 (browser-side)</td></tr>
<tr><td>Hosting</td><td>GitHub Pages (static only)</td></tr>
<tr><td>State</td><td>No localStorage, no cookies, no backend (sessionStorage used only to cache the framework prompt, auto-cleared on tab close)</td></tr>
<tr><td>CSP</td><td>connect-src restricted to 5 domains: 4 AI providers + raw.githubusercontent.com (for framework prompt fetch)</td></tr>
</table>
</div>

The single-file design is intentional: the entire tool is auditable in one view. You can open it, read it, understand what it does, and verify the security claims yourself.

### Security Model

<div class="arch-block">DATA FLOW

CV/JD upload  →  browser text extraction  →  prompt injection sanitisation
                                             ↓
                                    HTTPS to chosen provider
                                             ↓
                                    Response rendered in browser
                                             ↓
                              Explicit cleanup on page close</div>

**What leaves your machine:** Only the CV text, JD text, and your API key, sent directly to the provider you chose. On first load, the framework prompt is also fetched from `raw.githubusercontent.com` and cached in sessionStorage for the tab lifetime.

**What's on disk:** Nothing. No cookies, no localStorage, no logs, no database.

**Input validation:** Magic number checks, extension validation, size limits (CV 5MB, JD 2MB), text truncation for cost control (CV 8,000 chars, JD 4,000 chars).

**Prompt injection protection:** Text sanitisation patterns to prevent the uploaded CV/JD from manipulating the prompt.

## Usage

### Running the Tool

1. Go to the [live tool](https://wellbelove.org/ATS-CVC/tool/)
2. Choose an AI provider (Mistral has a free tier)
3. Get an API key from your chosen provider — links provided in the UI
4. Upload your CV (PDF, max 5MB)
5. Upload or paste the job description
6. Confirm the extracted name and role title
7. Click **Analyze** to run
8. Review the five-part report
9. Save as PDF using the browser print function

### Local Development

The tool has no build step. Run with any static file server:

```
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080/tool/`. File:// URLs work for most functionality, but some browsers restrict API calls from file:// origins due to CORS policy.

## Documentation

The repo includes extensive documentation beyond the code:

<div class="card mb-md">
<table class="spec-table">
<tr><td>METHODOLOGY.md</td><td>Framework documentation with evidence base</td></tr>
<tr><td>FRAMEWORK_PROMPT.md</td><td>Machine-readable system prompt for AI providers</td></tr>
<tr><td>BUILD.md</td><td>Technical decisions and their rationale</td></tr>
<tr><td>SECURITY.md</td><td>Security architecture and guarantees</td></tr>
<tr><td>PRIVACY.md</td><td>Privacy commitments and data flow</td></tr>
</table>
</div>
