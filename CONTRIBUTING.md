# Contributing to Starbase // TITAN_GRADE

This platform is a consolidated, enterprise-grade Homelab OS. To maintain its "Titan Grade" status, all contributions must follow these architectural standards.

## 📁 Workspace Standards

-   **`/apps`**: All application source code.
    -   Must use NPM Workspaces.
    -   Must follow component-based modularity in React.
-   **`/infra`**: All orchestration and configuration.
    -   Compose files must use relative volume paths.
    -   Configs must be strictly isolated from persistent state.
-   **`/data`**: Strictly for local persistent state.
    -   **NEVER** commit anything inside this folder.

## 🛠️ Development Workflow

1.  **Orchestration**: Use `./lab.sh` for all container lifecycle management.
2.  **API Bridge**: The `apps/api` is the authoritative source for system state; ensure all new pillars are mapped in `PILLAR_MAP` and `ACTUAL_NAMES`.
3.  **UI Components**: Keep `App.tsx` lean. New views belong in `apps/ui/src/components/`.

## 🚀 Pillar Definition Rules

Every pillar must include:
-   `deploy.resources.limits`: Strictly defined CPU/RAM caps.
-   `networks`: Minimum necessary network isolation.
-   `container_name`: Explicitly defined for telemetry tracking.

**Project STARBASE: Connected, Efficient, Brilliant.**
