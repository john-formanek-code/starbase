# starbase // TITAN_GRADE Architecture

A consolidated, production-grade Homelab Operating System.

## 📁 Repository Structure

-   **`/apps`**: Core application suite.
    -   `ui/`: React + TypeScript frontend (Static Nginx bundle).
    -   `api/`: Node.js Control Bridge (Docker Socket integration).
-   **`/infra`**: The 12-Pillar Infrastructure.
    -   `compose/`: Standardized Docker Compose stacks for all 12 pillars.
    -   `config/`: Service-specific configurations (Prometheus, Grafana, etc.).
-   **`/data`**: Persistent State (Excluded from Git).
    -   `volumes/`: All Docker container mount points.
-   **`lab.sh`**: The Master Command Script. High-level orchestration for pillar ignition.

## 🚀 Pillars of Operations
1.  **Virtualization** (`virt`) - Portainer
2.  **Private Cloud** (`cloud`) - Nextcloud
3.  **Network Lab** (`net`) - DNS/VPN
4.  **Cyber Defense** (`cyber`) - SIEM
5.  **Automation** (`automation`) - Smart Home
6.  **Media Server** (`media`) - Entertainment
7.  **Backup & DR** (`backup`) - Data Protection
8.  **DevOps / CI** (`devops`) - CI/CD
9.  **AI Playground** (`ai`) - Local LLMs
10. **Observability** (`monitoring`) - Metrics/Logs
11. **Identity IAM** (`core`) - Auth/SSO
12. **Business Stack** (`business`) - Productivity

## 🛠️ Management
Use the root management script for all operations:
```bash
./lab.sh up all       # Ignite entire stack
./lab.sh status virt  # Check Virtualization status
```
