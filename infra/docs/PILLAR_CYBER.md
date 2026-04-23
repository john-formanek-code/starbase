# 🛡️ Pillar 4: Cyber Defense (SIEM & Security)

## Purpose
The Cyber Defense pillar provides proactive threat detection, vulnerability assessment, and encrypted secret management for Starbase OS. It serves as the primary "Shield" layer, monitoring all other pillars for malicious activity and maintaining a centralized security posture.

## 🏗️ Architecture
-   **SIEM Engine**: `Wazuh (XDR/SIEM)` - Advanced threat detection and log analysis.
-   **Vulnerability Scanner**: `OpenVAS` - Automated network vulnerability assessment.
-   **Secret Vault**: `Vaultwarden (Bitwarden)` - Encrypted credential sovereignty.
-   **Toolbox**: `CyberChef` - The "Cyber Swiss Army Knife" for data manipulation.
-   **Internal Name**: `cyber`
-   **Network Isolation**: Attached to `proxy` (Dashboard access) and `monitoring` (Security log extraction).

## 🛠️ Management Commands
Use the root `lab.sh` for standard operations:
```bash
./lab.sh up cyber      # Ignite the SOC
./lab.sh status cyber  # Check security unit health
```

## 📊 Telemetry Integration
The Starbase Dashboard pulls the following data points via the API bridge:
-   **Security Agents**: Count of active nodes being monitored by the SIEM.
-   **Shield Status**: Real-time confirmation of the SIEM logic engine state.
-   **Log Stream**: Real-time security event telemetry from the Wazuh Manager.

## ⚠️ Engagement Protocols
-   **SIEM Tuning**: Wazuh is a resource-heavy module. Ensure CPU/RAM limits are propped before long-term ignition.
-   **Persistence**: Vaultwarden secrets are isolated in `/data/volumes/vaultwarden/data`.

**STATUS: TITAN_GRADE // ACTIVE_SHIELD**
