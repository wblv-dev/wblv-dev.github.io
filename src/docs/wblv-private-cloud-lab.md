---
title: WBLV Private Cloud Lab — Harry Wellbelove
description: WBLV Private Cloud Lab — private cloud rebuild in progress. Documentation pending.
summary: Private cloud rebuild in progress — Proxmox/Ceph cluster being rearchitected from the ground up. Documentation will follow the build.
genre: Infrastructure
order: 1
permalink: /wblv-private-cloud-lab/
github_url: https://github.com/wblv-dev/wblv-private-cloud-lab
---

## Status

*This lab is currently being rebuilt from scratch. Documentation will follow the build, not precede it — so the content here will land once the new architecture is in place rather than describing a system that doesn't exist yet.*

<div class="callout">
<strong>Why the rebuild:</strong> The previous iteration gave me a working Proxmox/Ceph cluster with OPNsense HA and CIS-hardened workloads, but the hardware inventory and network topology had grown organically rather than being designed. This rebuild starts from an intentional architecture and documents each decision as it's made.
</div>

## What will be here

Once the rebuild is in a documentable state, this page will cover:

- Hardware inventory and rack layout
- Cluster and storage architecture
- Network segmentation and firewall design
- Security baselines and hardening approach
- Automation and secrets management
- Build decisions and trade-offs

Until then, check back or follow the [repo](https://github.com/wblv-dev/wblv-private-cloud-lab) for progress.
