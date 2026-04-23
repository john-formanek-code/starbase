# 🛸 Pillar 1: Virtualization (Hypervisor)

## Purpose
The Virtualization pillar serves as the primary governing layer for the entire Starbase OS. It provides the hypervisor interface (Portainer CE) used to manage the lifecycle, networking, and storage of all other functional pillars.

## 🏗️ Architecture
-   **Core Service**: `Portainer Community Edition`
-   **Internal Name**: `virt`
-   **Network Isolation**: Attached to `proxy` (UI access) and `vlan10_mgmt` (Backend management).
-   **Governance**: Directly interfaces with `/var/run/docker.sock` to provide real-time orchestration.

## 🛠️ Management Commands
Use the root `lab.sh` for standard operations:
```bash
./lab.sh up virt      # Ignite the Hypervisor
./lab.sh status virt  # Check engine health
```

## 📊 Telemetry Integration
The Starbase Dashboard pulls the following data points via the API bridge:
-   **Global Container Count**: Total units propped on the node.
-   **Resource Consumption**: CPU/RAM usage of the hypervisor process.
-   **Orchestration Logs**: Live STDOUT stream from the engine.

## ⚠️ Safety Protocols
-   **Socket Access**: Portainer runs with `privileged: true` or high-level socket access. Ensure the `proxy` network is secured.
-   **Persistence**: All configuration is stored in `/data/volumes/portainer-data`. Do not manually edit these files while the engine is ignited.

**STATUS: TITAN_GRADE // COHESIVE**
