---
title: "WBLV Private Cloud Lab — Harry Wellbelove"
description: "WBLV Private Cloud Lab — Three-node Proxmox/Ceph homelab. Technical build documentation."
permalink: /wblv-private-cloud-lab/
tags:
  - Infrastructure
  - Homelab
  - Active
github_url: https://github.com/wblv-dev/wblv-private-cloud-lab
---

## Overview

*A private cloud running on repurposed enterprise hardware, using the same software stacks and security controls I work with professionally.*

The problem with only learning security and infrastructure on client environments is that you can't experiment. You can't upgrade a cluster node to see what breaks, run a new detection rule that might flood alerts, or test a firewall migration approach before committing to it in production.

The lab closes that gap. It runs the Proxmox hypervisor stack, OPNsense firewalls, and CIS hardening baselines I use at work. If I configure it here first, I understand it before it matters.

<div class="callout">
<strong>Philosophy:</strong> The lab runs real software, follows real security standards, and is documented properly. If it wouldn't pass a CAB submission, it doesn't go in.
</div>

## Servers

The cluster runs on three identical nodes — repurposed enterprise servers sourced through a recycling contact. Each node runs Proxmox VE with Ceph for converged storage, giving a fully hyper-converged architecture with no external SAN requirement.

<div class="card mb-md">
<table class="spec-table">
<tr><td>Motherboard</td><td>Supermicro X10DRI — dual socket LGA2011-v3</td></tr>
<tr><td>CPU</td><td>2× Intel Xeon E5-2680 v4 (14C/28T each, 56 threads total per node)</td></tr>
<tr><td>RAM</td><td>64GB DDR4 ECC per node (192GB cluster total)</td></tr>
<tr><td>Network</td><td>2× dual-port 10GbE RJ45 NIC + HPE 4-port 1GbE</td></tr>
<tr><td>Storage HBA</td><td>LSI 9300-16i — 16-port SAS3/SATA3</td></tr>
<tr><td>Ceph SSDs</td><td>3× Samsung PM1633a 1.6TB SAS SSD per node (9 total)</td></tr>
<tr><td>Ceph HDDs</td><td>Shared pool of 4TB and 10TB SAS HDDs across cluster</td></tr>
<tr><td>Boot</td><td>Dedicated SSD per node for Proxmox OS</td></tr>
<tr><td>Case</td><td>LC-4480 4U rackmount</td></tr>
</table>
</div>

### Network Interfaces

- Bond0 (LACP) — 2× 10GbE for VM traffic and Ceph replication
- mgmt0 — 1GbE dedicated management interface
- IPMI — out-of-band management, separate management VLAN

## Cluster Configuration

All three nodes form a Proxmox VE cluster with quorum provided by the three-node Corosync ring. VMs can live-migrate between nodes without downtime. The cluster uses LACP-bonded 10GbE links for both VM traffic and Ceph replication, giving redundant high-bandwidth paths between every node.

Each node runs both the Proxmox hypervisor and Ceph OSD daemons. It's a hyper-converged setup (same idea as Nutanix or vSAN), which costs some compute overhead but removes the need for a separate storage layer.

## Storage Architecture

Ceph runs converged on all three nodes, so storage OSDs share the same hosts as compute. You lose some CPU to Ceph overhead, but there's no separate storage infrastructure to manage.

### Pools & Replication

<div class="arch-block">CLUSTER STORAGE POOLS

vm-pool-ssd   ~5.5TB usable   Samsung PM1633a SSDs   Replication factor: 3
              → VM workloads, Sentinel lab, high-IOPS services

vm-pool-hdd   ~24TB usable    SAS HDDs               Replication factor: 3
              → Backup storage, archives, bulk data, cold workloads

                        3 OSD nodes × 6 SSDs = 18 OSD daemons (SSD pool)
                        3 OSD nodes × HDDs   = shared HDD pool OSDs</div>

The SSD pool hosts anything latency-sensitive: Sentinel, Graylog, development VMs. The HDD pool handles everything that just needs capacity: backups, ISOs, archive data.

## VLANs

The network is segmented into VLANs enforced by the OPNsense pair. Management, lab, home, and Ceph replication traffic are all separated so a compromise in one segment can't reach cluster management interfaces.

<div class="arch-block">VLAN LAYOUT

VLAN 10  — Management     Proxmox hosts, OPNsense, IPMI
VLAN 20  — Lab            VM workloads, security tooling
VLAN 30  — Home           Household devices, Lauren's kit
VLAN 40  — Ceph           Storage replication traffic (MTU 9000, jumbo frames)
VLAN 50  — DMZ            Anything externally reachable
VLAN 99  — Native/Trunk   Uplink trunks to switching

Inter-VLAN routing enforced by OPNsense firewall rules.
Default deny between segments. Explicit allows only.</div>

### DNS Resolution

Internal DNS runs on a PowerDNS HA pair (Authoritative + Recursor) across two VMs. Split-horizon: internal queries go to PowerDNS, external queries forward upstream. DNSSEC is on for internal zones.

## Firewall High Availability

Two OPNsense instances run in active/passive HA using CARP for virtual IP failover and XMLRPC for configuration sync. Failover is sub-second, tested under load.

<div class="card mb-md">
<table class="spec-table">
<tr><td>Platform</td><td>OPNsense 24.x on dedicated VMs (PCI passthrough for NICs)</td></tr>
<tr><td>HA mode</td><td>Active/Passive CARP — VIP failover</td></tr>
<tr><td>Sync</td><td>XMLRPC configuration sync, pfsync for state table</td></tr>
<tr><td>Hosts</td><td>P-WBLV-MK5-PVE-01 (primary), P-WBLV-MK5-PVE-02 (secondary)</td></tr>
<tr><td>IDS/IPS</td><td>Suricata with ET Open ruleset</td></tr>
<tr><td>Logging</td><td>Syslog → Graylog for centralised log management</td></tr>
</table>
</div>

### Remote Access

No management interfaces are exposed to the internet. Remote access goes through Tailscale only: authenticated, encrypted tunnels with no inbound firewall rules or exposed ports needed.

## Security Hardening

All VM workloads are hardened to CIS Level 2 baselines before deployment, using the same tooling and validation approach as the CNI programme work, with the same documentation standard.

- CIS Level 2 applied to Ubuntu 22.04 LTS base images using Ansible playbooks
- Compliance validated with CIS-CAT Assessor post-deployment
- SSH key-only authentication, root login disabled, fail2ban active
- Automatic security updates via unattended-upgrades
- AppArmor profiles enforced on all workloads
- Auditd configured per CIS requirements, logs forwarded to Graylog
- Separate service accounts per workload, no shared credentials
- Secrets managed via 1Password CLI with vault separation by privilege level

### Tooling Stack

The lab runs a self-funded Microsoft 365 E5 tenant with Sentinel as the SIEM. Having my own Sentinel instance means I can do detection engineering and KQL development without touching client environments.

<div class="card mb-md">
<table class="spec-table">
<tr><td>SIEM</td><td>Microsoft Sentinel (M365 E5 tenant)</td></tr>
<tr><td>Log mgmt</td><td>Graylog — centralised collection before Sentinel forwarding</td></tr>
<tr><td>Automation</td><td>Mac Mini M2 (p-wblv-lab-aut-01) — Ansible, Claude Code, MCP servers</td></tr>
<tr><td>Remote</td><td>Tailscale mesh + subnet routing across all VLANs</td></tr>
<tr><td>Monitoring</td><td>Prometheus + Grafana for cluster and VM metrics</td></tr>
<tr><td>DNS</td><td>PowerDNS Authoritative + Recursor HA pair</td></tr>
<tr><td>Secrets</td><td>1Password CLI with tiered vault structure</td></tr>
</table>
</div>

## Automation

A Mac Mini M2 (16GB RAM, 1TB SSD) handles Ansible playbook execution, hosts MCP servers for Claude Code integration, and serves as the SSH jump host for lab access.

<div class="callout">
<strong>MCP integration:</strong> Four MCP servers run on the automation node — filesystem, proxmox, obsidian, and github — allowing Claude Code to interact directly with lab infrastructure. All build documentation lives in Obsidian and is accessible via MCP during active sessions.
</div>

## Roadmap

- Out-of-band management expansion — Raspberry Pi serial console server for all five managed devices
- JetKVM deployment for the Mac Mini automation node
- Expand Sentinel detection library — port production KQL rules into the lab environment
- South Wales relocation — natural forcing function for a hardware refresh and potential SFF replacement evaluation
