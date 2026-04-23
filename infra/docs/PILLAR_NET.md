# 🌐 Pillar 3: Network Lab (Pi-hole & Netbox)

## Purpose
The Network Lab pillar provides centralized traffic governance and infrastructure management for Starbase OS. It enables network-level ad-blocking (Pi-hole), automated IP Address Management (IPAM via Netbox), and real-time traffic analysis.

## 🏗️ Architecture
-   **Traffic Filter**: `Pi-hole (Official)` - Core DNS sinkhole and ad-blocker.
-   **IPAM Engine**: `Netbox (Community)` - Source of truth for network documentation.
-   **Telemetry Bridge**: `pihole-exporter` & `wireguard-exporter` - Provides Prometheus-compatible metrics.
-   **Internal Name**: `network`
-   **Network Isolation**: Spans `vlan10_mgmt` (Backend control), `proxy` (UI access), and `monitoring` (Telemetry extraction).

## 🛠️ Management Commands
Use the root `lab.sh` for standard operations:
```bash
./lab.sh up net      # Ignite the Traffic Control Center
./lab.sh status net  # Check network unit health
```

## 📊 Telemetry Integration
The Starbase Dashboard pulls the following data points via the API bridge:
-   **DNS Threads Blocked**: Real-time count of blocked malicious/ad requests.
-   **Module Status**: Connectivity confirmation for Pi-hole and Netbox units.
-   **System Heartbeat**: Resource consumption (CPU/RAM) per networking module.

## ⚠️ Governance Protocols
-   **DNS Authority**: Ensure Pi-hole is propped before re-pointing upstream routers to this node.
-   **Persistence**: Network documentation state is isolated in `/data/volumes/netbox/db`.

**STATUS: TITAN_GRADE // COHESIVE**
