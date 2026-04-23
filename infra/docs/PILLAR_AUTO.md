# 🏠 Pillar 5: Automation (Smart Home & Logic)

## Purpose
The Automation pillar serves as the centralized "Brain" for Starbase OS. It provides the logic engines required to process sensor data, automate hardware tasks, and provide a unified interface for smart home governance and visual flow programming.

## 🏗️ Architecture
-   **Logic Core**: `Home Assistant (Official)` - Primary integration and state engine.
-   **Visual Flow**: `Node-RED` - Low-code automation and event processing.
-   **Messaging**: `Mosquitto (MQTT)` - High-speed internal bus for device communication.
-   **Internal Name**: `automation`
-   **Network Isolation**: Utilizes `host` networking for Home Assistant (to enable device discovery) and `proxy` for dashboard access.

## 🛠️ Management Commands
Use the root `lab.sh` for standard operations:
```bash
./lab.sh up automation      # Ignite the Logic Engine
./lab.sh status automation  # Check smart home unit health
```

## 📊 Telemetry Integration
The Starbase Dashboard pulls the following data points via the API bridge:
-   **Automation Core**: Real-time confirmation of the Home Assistant version and propped state.
-   **MQTT Health**: Signal confirmation from the messaging broker.
-   **Logic Pulse**: Resource consumption (CPU/RAM) per automation module.

## ⚠️ Operation Protocols
-   **Device Discovery**: Home Assistant requires host-level network visibility to detect local hardware.
-   **Persistence**: All logic and configurations are isolated in `/data/volumes/homeassistant/config`.

**STATUS: TITAN_GRADE // LOGIC_STABLE**
