# ☁️ Pillar 2: Private Cloud (Nextcloud)

## Purpose
The Private Cloud pillar provides decentralized data sovereignty for Starbase OS. It enables secure file storage, contact synchronization, and collaborative document editing without reliance on third-party public clouds.

## 🏗️ Architecture
-   **Core Service**: `Nextcloud (Official Image)`
-   **Database**: `PostgreSQL 15 (Alpine)`
-   **Acceleration**: `Redis (Alpine)` - Used for memory caching and file locking.
-   **Internal Name**: `cloud`
-   **Network Isolation**: Attached to `proxy` (UI access) and `database` (Internal DB connectivity).

## 🛠️ Management Commands
Use the root `lab.sh` for standard operations:
```bash
./lab.sh up cloud      # Ignite the Cloud Engine
./lab.sh status cloud  # Check storage health
```

## 📊 Telemetry Integration
The Starbase Dashboard pulls the following data points via the API bridge:
-   **Total Data Consumed**: Real-time calculation of the `nextcloud/data` directory size.
-   **Resource Consumption**: CPU/RAM usage of the Sync Engine and Database units.
-   **Database Health**: Confirmed via internal `pg_isready` health checks.

## ⚠️ Data Integrity Protocols
-   **Backups**: All user data resides in `/data/volumes/nextcloud/data`. Ensure Pillar 7 (Backup) is configured to snapshot this directory.
-   **Persistence**: Database state is isolated in `/data/volumes/nextcloud/db`.

**STATUS: TITAN_GRADE // COHESIVE**
