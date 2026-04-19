# 🛡️ Homelab OS: The 12-Pillar Enterprise-Grade Architecture

This project implements a fully modular, enterprise-grade homelab environment divided into 12 functional pillars. Each pillar is isolated into its own Docker Compose stack, ensuring maximum stability, security, and scalability.

---

## 🏗️ The 12 Pillars of the Lab

| # | Pillar | Description | Stack File | Key Services |
|---|---|---|---|---|
| **1** | **Virtualization** | Container management & orchestration | `stack-containers.yml` | Portainer |
| **2** | **Private Cloud** | Secure file sync & collaboration | `stack-cloud.yml` | Nextcloud, Redis, Postgres |
| **3** | **Network Lab** | Enterprise routing & network services | `stack-network.yml` | VyOS, Pi-hole, Wireguard, Netbox |
| **4** | **Cyber Defense** | SIEM, vuln-scanning & security lab | `stack-cyber.yml` | Wazuh, OpenVAS, Kali, Vaultwarden |
| **5** | **Home Automation** | IoT brain & smart home logic | `stack-automation.yml` | Home Assistant, Node-RED, MQTT |
| **6** | **Media Server** | Private streaming & media management | `stack-media.yml` | Jellyfin |
| **7** | **Backup & DR** | Disaster recovery & data redundancy | `stack-backup.yml` | Duplicati |
| **8** | **DevOps / CI-CD** | Software delivery & Git automation | `stack-devops.yml` | Gitea, Woodpecker CI |
| **9** | **AI / ML Playground** | Local LLM inference & RAG pipelines | `stack-ai.yml` | Ollama, Open-WebUI |
| **10**| **Observability** | Full-stack monitoring & logging | `stack-monitoring.yml`| Prometheus, Grafana, Loki |
| **11**| **Identity (IAM)** | Centralized SSO & access control | `stack-core.yml` | Authentik |
| **12**| **Business Stack** | Knowledge base & project management | `stack-business.yml` | BookStack |

---

## 🌐 Network Topology (Docker Bridge/External)

The lab uses segmented networks to simulate real-world VLANs:

- `proxy`: External traffic ingress (Frontend services).
- `monitoring`: Dedicated observability network.
- `vlan10_mgmt`: Core management & administration.
- `vlan20_srv`: General internal services.
- `vlan30_clients`: IoT devices and client simulations.
- `vlan60_dmz`: Exposed services (Simulated).
- `database`: Isolated backend database traffic.
- `identity`: Isolated Auth/SSO traffic.

---

## 🚀 Management Commands

Use the provided `lab.sh` script to manage the entire infrastructure.

### Start a specific pillar:
```bash
./lab.sh up ai      # Starts the AI stack
./lab.sh up core    # Starts the Identity/IAM stack
```

### Check full lab status:
```bash
./lab.sh status
```

### Update all images:
```bash
./lab.sh update
```

---

## 🔒 Security Baseline

1. **Isolation:** Services communicate only across required networks. Databases are NEVER exposed to the host directly.
2. **Identity:** Authentik (Pillar 11) provides SSO and MFA for all front-end services.
3. **Observability:** Loki (Pillar 10) aggregates logs from all containers for audit trails.
4. **Permissions:** All data volumes are managed with strict UID/GID 1000 settings.

---

## 📂 Directory Structure

```text
/homelab/
├── monitoring/             # Main working directory
│   ├── config/             # Modular config files (Prometheus, Loki, etc.)
│   ├── stack-*.yml         # The 12 pillar compose files
│   └── lab.sh              # Master management script
└── <service>-data/         # Persistent data volumes
```
