---
title: "Domain Security Toolkit — Harry Wellbelove"
description: "Open source Python tool for automated domain security auditing. 35+ checks across TLS, email authentication, HTTP headers, DNSSEC, and OSINT."
summary: "35+ automated security checks across TLS, email authentication, HTTP headers, DNSSEC, and OSINT exposure. Generates customer-ready HTML reports covering NIST, OWASP, NCSC, CISA, and GDPR."
genre: Tool
order: 2
permalink: /domain-security-toolkit/
github_url: https://github.com/wblv-dev/domain-security-toolkit
---

## Overview

*Automated domain security auditing for 35+ checks across TLS, email authentication, HTTP headers, DNSSEC, and OSINT exposure.*

Domain Security Toolkit is an open-source Python tool that audits any domain against a comprehensive set of security controls in one pass. It generates customer-ready reports with remediation guidance aligned to NIST, OWASP, NCSC, CISA, and GDPR — the kind of thing that normally takes a consultant a day to assemble manually.

<div class="callout">
<strong>Why this exists:</strong> Domain security spans email authentication, DNS security, certificates, HTTP headers, and OSINT. Most tools cover one slice. This one runs everything in a single pass and produces reports you can hand to a customer.
</div>

## Installation

```
pip install git+https://github.com/wblv-dev/domain-security-toolkit
```

Python 3.10+ required.

## Quick Start

```
# Single domain audit
domain-audit --domains example.com

# Multiple domains
domain-audit --domains example.com example.org

# From a file
domain-audit --domains-file domains.txt
```

Output lands in the current directory as:

- `audit_report.html` — interactive dashboard with all findings
- `AUDIT_REPORT.md` — markdown report, git-friendly
- `audit_report.csv` — compliance summary, one row per domain
- `audit_history.db` — SQLite database with historical data

## Security Checks

### Email Security

- **SPF** — validates DNS TXT records for authorised senders
- **DMARC** — policy and reporting configuration
- **DKIM** — detects keys across common selectors (default, google, selector1/2, protonmail, etc.)
- **MX Records** — mail server config including null MX (RFC 7505) detection
- **MTA-STS** — forces TLS encryption for inbound email
- **TLSRPT** — monitors TLS negotiation failures
- **BIMI** — brand logo indicators for supporting clients

### DNS & Certificate Security

- **DNSSEC** — DNSKEY and DS record validation
- **CAA** — certificate authority authorisation records
- **Dangling CNAMEs** — subdomain takeover risk detection
- **Certificate Transparency** — crt.sh monitoring for SSL certificate issuance
- **Domain Expiry (RDAP)** — registration status and expiry dates
- **Transfer Lock** — domain lock status validation
- **Reverse DNS** — FCrDNS (Forward-Confirmed reverse DNS) validation

### Web Security

- **HTTP Security Headers** — X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS
- **security.txt** — vulnerability disclosure policy at `/.well-known/security.txt`
- **Technology Fingerprint** — identifies web technologies and frameworks

### OSINT & Threat Intelligence

- **Shodan Internet DB** — open ports and exposed services
- **Mozilla Observatory** — website security header scoring
- **DNSBL** — checks against multiple spam blacklist databases
- **Optional integrations** — VirusTotal, AlienVault OTX, AbuseIPDB (API keys supported)

Optional integrations activate when the corresponding environment variable is set:

<div class="card mb-md">
<table class="spec-table">
<tr><td>SHODAN_API_KEY</td><td>Enables Shodan Internet DB lookups</td></tr>
<tr><td>VIRUSTOTAL_KEY</td><td>Domain reputation + detection history</td></tr>
<tr><td>OTX_KEY</td><td>AlienVault OTX pulse/indicator lookups</td></tr>
<tr><td>ABUSEIPDB_KEY</td><td>AbuseIPDB reputation scoring</td></tr>
<tr><td>CF_API_TOKEN</td><td>Cloudflare zone settings (alternative to --cloudflare-token)</td></tr>
</table>
</div>

## Cloudflare Integration

Optional integration pulls zone settings directly via the Cloudflare API:

<div class="card mb-md">
<table class="spec-table">
<tr><td>SSL/TLS</td><td>Mode validation and minimum TLS version checks</td></tr>
<tr><td>HTTPS</td><td>Automatic HTTPS rewrites, HSTS, HSTS preload</td></tr>
<tr><td>Security</td><td>Security level, WAF rules, Bot Management</td></tr>
<tr><td>Privacy</td><td>Email obfuscation and hotlink protection</td></tr>
</table>
</div>

```
export CF_API_TOKEN="your_cloudflare_token"
domain-audit --domains example.com --cloudflare-token $CF_API_TOKEN
```

## Reporting & Output

The toolkit maintains a persistent SQLite database across audit runs, enabling historical comparisons and change tracking. The diff functionality highlights what's changed between runs — useful for tracking remediation progress or catching config drift.

```
# Interactive dashboard of historical audits
domain-dashboard                      # port 8001 default
domain-dashboard --port 9000
```

Each finding includes remediation guidance with references to the relevant standard (NIST SP 800-52, OWASP, NCSC, CISA, PCI DSS, GDPR, or RFC).

## Advanced Usage

### Command Flags

<div class="card mb-md">
<table class="spec-table">
<tr><td>--domains</td><td>One or more domains to audit</td></tr>
<tr><td>--domains-file</td><td>Read domains from a file (one per line)</td></tr>
<tr><td>--output-dir</td><td>Custom output directory for reports</td></tr>
<tr><td>--format</td><td>Select output formats: html, md, csv (default: all three)</td></tr>
<tr><td>--verbose</td><td>Debug logging</td></tr>
<tr><td>--log-file</td><td>Write detailed logs to file</td></tr>
<tr><td>--no-diff</td><td>Skip comparison with previous run</td></tr>
<tr><td>--concurrency</td><td>Parallel domain count (default: 20)</td></tr>
<tr><td>--cloudflare-token</td><td>Cloudflare API token for zone settings check</td></tr>
</table>
</div>

### Exit Codes

- `0` — all checks passed or warned (no failures)
- `1` — configuration or runtime error
- `2` — at least one check graded as FAIL
- `130` — interrupted by user (Ctrl+C)

Suitable for CI/CD integration where you want to fail the pipeline on security regressions.

## Architecture

Built on Python's asyncio with aiohttp for concurrent HTTP requests and dnspython for DNS queries. Each check module is independent and returns a standardised result structure, making it straightforward to add new checks. Rate limiting via asyncio semaphores prevents overwhelming target infrastructure or API endpoints.

## Standards & Compliance

Remediation guidance embedded in the toolkit references:

- **NIST** — SP 800-52 Rev. 2, SP 800-63
- **OWASP** — Top 10, secure coding guidelines
- **NCSC** — UK National Cyber Security Centre
- **CISA** — US Cybersecurity & Infrastructure Security Agency
- **PCI DSS** — Payment Card Industry Data Security Standard
- **GDPR** — General Data Protection Regulation
- **RFC standards** — SPF, DMARC, DKIM, DNSSEC, etc.
