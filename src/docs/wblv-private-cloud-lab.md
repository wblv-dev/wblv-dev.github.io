---
title: WBLV Private Cloud Lab — Harry Wellbelove
description: Framework-aligned private SOC lab — NIST CSF, CAF, CE+, CIS L2, MITRE ATT&CK, Palantir ADS, SOC-CMM, and SOC 2. Full detection and response pipeline with public self-assessment.
summary: Two-phase SOC lab build — enterprise-grade infrastructure hardened to CIS L2 and mapped to 8 security frameworks, with detection-as-code, threat intelligence, and telemetry simulation.
genre: Infrastructure
order: 1
permalink: /wblv-private-cloud-lab/
github_url: https://github.com/wblv-dev/wblv-private-cloud-lab
tags: doc
layout: docs.njk
---

## Overview

A full-rack private cloud lab rebuilt from scratch as a SOC platform. Every service exists either to generate, transport, enrich, or detect against security telemetry. The goal is real KQL in real Sentinel against real enriched data — not a sandbox.

The build is split into two phases. **Phase 1** takes an empty rack to the first KQL query returning results — infrastructure built, hardened, monitored, and logs flowing. **Phase 2** operationalises the SOC — detection-as-code, threat intelligence, automated investigation, and maturity assessment.

Everything is mapped to real security frameworks, self-assessed honestly, and evidenced publicly on this site.

<div class="photo-grid single">
  <img src="/assets/images/lab/rack-hero.jpeg" alt="WBLV Private Cloud Lab — full rack powered on" loading="lazy">
</div>

## Hardware

The lab runs on a 22U All-Rack CAB226X6, split into three tiers: network, storage/management, and compute. 84 cores, 168 threads, 192 GB RAM, and over 130 TB of raw storage.

### Network Tier (U22–U19)

<div class="photo-grid single">
  <img src="/assets/images/lab/network-tier.jpeg" alt="Network tier — firewalls, switch, NAS, Mac Mini" loading="lazy">
</div>

| U | Device | Spec | Role |
|---|--------|------|------|
| U22 | WatchGuard Firebox M370 | i5-6400, 32GB DDR4, 128GB SSD | Firewall (HA primary) — being replaced by OPNsense |
| U21 | WatchGuard Firebox M370 | i5-6400, 32GB DDR4, 128GB SSD | Firewall (HA secondary) — being replaced by OPNsense |
| U20 | HPE Aruba 2930F (JL253A) | 24x 1GbE, 4x SFP+ 10GbE, L3 managed | Core switch — VLAN trunking, inter-VLAN routing |
| U19 | Cable management bar | — | — |

### Storage & Management (U18–U14)

| Device | Spec | Role |
|--------|------|------|
| Synology DS418play | 4x 6TB WD Red, RAID 6 (12TB usable) | PBS backup target, NAS |
| Mac Mini | Apple M2, 8GB RAM, 500GB SSD | Ansible/Terraform control node |

### Compute Tier (U12–U1)

<div class="photo-grid single">
  <img src="/assets/images/lab/compute-tier.jpeg" alt="Compute tier — three-node Proxmox/Ceph cluster" loading="lazy">
</div>

Three identical 4U nodes forming a Proxmox/Ceph hyperconverged cluster. Each node:

| Component | Spec |
|-----------|------|
| Chassis | Logic Case LC-4480-8B-WH (4U) |
| Motherboard | SuperMicro X10DRI-T |
| Processors | 2x Intel Xeon E5-2680v4 (14c/28t each — 28c/56t per node) |
| RAM | 64GB Dataram DDR4 PC2400T |
| HBA | LSI 9300-16i (IT mode — direct disk passthrough to Ceph) |
| Network | 2x Intel 561T dual-port 10GbE (4x 10GbE per node) |
| Storage | 2x 10TB Seagate EXOS X10, 3x 4TB Toshiba MG04, 3x 1.6TB Micron S650DC SSD, 1x 128GB SSD boot |

**Per-node raw storage:** ~37TB (20TB EXOS + 12TB Toshiba + 4.8TB Micron SSD)

**Cluster totals:** 84 cores / 168 threads, 192GB RAM, ~111TB raw storage across Ceph, 12x 10GbE uplinks

### Build Progress

<div class="photo-grid">
  <img src="/assets/images/lab/rack-rear.jpeg" alt="Rack rear — power distribution and cabling" loading="lazy">
  <img src="/assets/images/lab/rack-front-complete.jpeg" alt="Completed rack — front view" loading="lazy">
</div>
<p class="photo-caption">Rear cabling and power distribution. Completed rack front view.</p>

## Architecture

### Phase 1 — Build the Platform

The infrastructure layer provides identity, networking, compute, storage, monitoring, and log transport. Every component is hardened to CIS Level 2 benchmarks and provisioned via Ansible and Terraform.

**Core services:**

- **OPNsense HA** — firewall, routing, VLAN segmentation (replacing the WatchGuards)
- **PowerDNS** — authoritative internal DNS
- **Proxmox + Ceph** — hyperconverged compute and storage
- **Authentik** — SSO and identity provider
- **Teleport** — privileged access management
- **NetBox** — IP address and asset management
- **Tailscale** — VPN connectivity to the management layer
- **1Password** — secrets management

**Hardening:** Ubuntu 22.04 LTS minimal with CIS Level 2 applied via Ansible. Windows Server 2022 with CIS Level 2 via Intune and GPO. Patching is automated — no manual windows.

**Log pipeline:**

```
Source → rsyslog → Graylog Cluster → Microsoft Sentinel
         (ship)    (enrich/filter)     (detect/respond)
```

**Monitoring:** Prometheus collects metrics, Grafana provides dashboards, alerts push to Discord.

**Backup:** Proxmox Backup Server on CRS-managed VM, primary datastore on the Synology NAS, encrypted offsite to OneDrive. Three copies, two media types, one offsite.

### Phase 2 — Operate the SOC

Once logs are flowing into Sentinel, the focus shifts to detection engineering and SOC operations.

**Threat intelligence:**

```
Feeds (abuse.ch, OTX, CVE, MITRE)
        |
        v
      MISP ---- IOC indicators ----> Sentinel
        |                               |
        | STIX                          | incidents
        v                               v
      OpenCTI <-- enrichment API -- Logic Apps / N8N
```

MISP ingests threat feeds and pushes indicators to Sentinel. OpenCTI builds the knowledge graph — campaigns, adversary profiles, ATT&CK relationships. SOAR queries OpenCTI for context during investigations without touching third-party tools.

**Detection-as-code:** Detections written as KQL, stored in Git with Palantir ADS metadata cards, deployed to Sentinel via GitHub Actions. ATT&CK coverage heat map auto-generated and published to this site.

**Telemetry simulation:** N8N orchestrates a simulated 50-person company — scripted sign-in patterns via Graph API, endpoint activity on simulation VMs with Sysmon and Defender, and realistic browsing that generates genuine firewall and DNS logs. Graylog filters 90%+ of raw volume, forwarding only enriched high-value events to Sentinel — keeping ingestion costs within budget.

## Framework Alignment

The build maps to eight security frameworks across both phases, plus three ITIL4 practices cherry-picked for SOC relevance.

**Phase 1 — Infrastructure:**

| Framework | Role |
|-----------|------|
| NIST CSF 2.0 | Top-level structure — six functions, scoped to relevant categories |
| CAF | Outcome-focused, maps to UK regulatory language |
| Cyber Essentials+ | Baseline hygiene — five controls, defined scope |
| CIS Level 2 | Prescriptive hardening benchmarks per OS and service |
| MITRE ATT&CK | Adversary lens — detection coverage mapped to technique IDs |

**Phase 2 — SOC Operations:**

| Framework | Role |
|-----------|------|
| Palantir ADS | Detection lifecycle management — metadata cards per analytic |
| SOC-CMM | SOC maturity model — target Level 3 (Defined) |
| SOC 2 | Trust Services Criteria — Security, Availability, Processing Integrity, Confidentiality |

Self-assessment and evidence will be published under the compliance section as each component is built. Gaps are documented honestly — that is what a competent assessor does.

## Status

The lab is currently in **Phase 1 — pre-build**. The rack is populated, hardware is ready, and the architecture is designed. The software stack is being rebuilt from an intentional design centred on the SOC use case.

This page will grow alongside the build. Each section expands with implementation details, configuration decisions, and evidence as components come online.

