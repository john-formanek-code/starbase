# Starbase

Starbase is a homelab operating system: twelve Docker Compose pillars (identity, network, monitoring, cloud, media, and the rest) plus a command center that can start and stop them.

The dashboard runs on its own. Without Docker it stays in demo mode, so you can click through every pillar, read the Compose blueprints, and see how the control plane behaves. On a machine with Docker it talks to the local engine.

## Run the command center

Requires Node.js 22.

```bash
npm install
npm run dev
```

- UI: http://localhost:5173
- API: http://localhost:3001

`npm run dev` starts both. The UI proxies `/api` to the API. If Docker is missing or unreachable, the API prints `demo` and the header shows `DEMO_MODE`. Set `STARBASE_DEMO=1` to force that, or `STARBASE_DEMO=0` to require Docker.

Search with `/`. Power buttons call `./lab.sh` for that pillar. In demo mode they only change the on-screen state.

## Run it on a homelab

Docker Engine and the Compose plugin are required. Copy the env file and replace every `changeme` before the first `up`. Those values become database passwords and app secrets. They are not in git.

```bash
cp .env.example .env
./lab.sh up monitoring
./lab.sh up ui
./lab.sh status all
```

`./lab.sh up all` creates the shared Docker networks, makes `data/volumes`, and starts every pillar except the optional network lab (`net-advanced`). Bring pillars up one at a time on a small machine. The UI container publishes on port **8088** unless `UI_PORT` is set. Persistent data lives in `data/` and is gitignored.

`./lab.sh` is the only supported way to start stacks. It exports `STARBASE_ROOT` (used by backup and code-server mounts) and passes `.env` into Compose.

## Pillars

| Id | Name | Stack | Port |
| --- | --- | --- | --- |
| 1 | Virtualization | Portainer | 9000 |
| 2 | Private Cloud | Nextcloud | 8080 |
| 3 | Network Lab | Pi-hole, WireGuard, NetBox | 8095 |
| 4 | Cyber Defense | Wazuh, Vaultwarden | 8443 |
| 5 | Automation | Home Assistant, Node-RED | 8123 |
| 6 | Media | Jellyfin | 8096 |
| 7 | Backup | Duplicati | 8200 |
| 8 | DevOps | Woodpecker | 8000 |
| 9 | AI | Ollama | 3005 |
| 10 | Observability | Grafana, Prometheus, Loki | 3002 |
| 11 | Identity | Authentik on 9002, Gitea on 3004 | 9002 |
| 12 | Business | BookStack | 6875 |

Also available, and included in `up all`: `net-core` (router, NTP, step-ca) and `ui` (this dashboard). `net-advanced` (Unbound, HAProxy, FRR, LibreNMS, SmokePing) is opt-in:

```bash
./lab.sh up net-advanced
```

## Layout

```
apps/ui        React command center
apps/api       Control bridge (Express)
infra/compose  One Compose file per pillar
infra/config   Prometheus, Grafana, Loki, Alertmanager
lab.sh         Start, stop, and status
```

The API mounts the repo and the Docker socket when it runs as a container (`infra/compose/stack-ui.yml`). That socket is root on the host. Keep the API on a trusted network.

## License

MIT. See [LICENSE](LICENSE).
