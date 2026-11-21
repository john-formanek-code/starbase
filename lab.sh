#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$ROOT/infra/compose"
ENV_FILE="$ROOT/.env"

COMMAND="${1:-}"
PILLAR="${2:-}"

usage() {
  cat <<'EOF'
Usage: ./lab.sh <up|down|restart|status> <pillar|all>

Pillars:
  virt cloud net-core net net-advanced cyber automation
  media backup devops ai monitoring core business ui

Examples:
  cp .env.example .env   # then set passwords
  ./lab.sh up monitoring
  ./lab.sh up ui
  ./lab.sh status all
  ./lab.sh down virt
EOF
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is not installed or not on PATH" >&2
    exit 1
  fi
}

get_stack_info() {
  case "$1" in
    virt) STACK="stack-virt.yml"; NAME="virt" ;;
    cloud) STACK="stack-cloud.yml"; NAME="cloud" ;;
    net-core) STACK="stack-network-core.yml"; NAME="network-core" ;;
    net) STACK="stack-network.yml"; NAME="network" ;;
    net-advanced) STACK="stack-network-advanced.yml"; NAME="network-advanced" ;;
    cyber) STACK="stack-cyber.yml"; NAME="cyber" ;;
    automation) STACK="stack-automation.yml"; NAME="automation" ;;
    media) STACK="stack-media.yml"; NAME="media" ;;
    backup) STACK="stack-backup.yml"; NAME="backup" ;;
    devops) STACK="stack-devops.yml"; NAME="devops" ;;
    ai) STACK="stack-ai.yml"; NAME="ai" ;;
    monitoring) STACK="stack-monitoring.yml"; NAME="monitoring" ;;
    core) STACK="stack-core.yml"; NAME="core" ;;
    business) STACK="stack-business.yml"; NAME="business" ;;
    ui) STACK="stack-ui.yml"; NAME="ui" ;;
    *) return 1 ;;
  esac
}

init_networks() {
  local networks=(proxy monitoring vlan10_mgmt vlan20_srv vlan30_clients vlan60_dmz database identity)
  local net
  for net in "${networks[@]}"; do
    if ! docker network inspect "$net" >/dev/null 2>&1; then
      docker network create "$net" >/dev/null
      echo "created network $net"
    fi
  done
}

init_dirs() {
  mkdir -p "$ROOT/data/volumes"
}

compose() {
  local file="$1"
  local name="$2"
  shift 2
  local args=(compose -p "$name" -f "$COMPOSE_DIR/$file")
  if [[ -f "$ENV_FILE" ]]; then
    args+=(--env-file "$ENV_FILE")
  fi
  export STARBASE_ROOT="$ROOT"
  export STARBASE_PROJECTS_DIR="${STARBASE_PROJECTS_DIR:-$ROOT}"
  docker "${args[@]}" "$@"
}

execute_stack() {
  local file="$1"
  local name="$2"
  local cmd="$3"
  echo "Executing $cmd on $file (project: $name)"
  case "$cmd" in
    up) compose "$file" "$name" up -d ;;
    down) compose "$file" "$name" down ;;
    restart) compose "$file" "$name" restart ;;
    status) compose "$file" "$name" ps ;;
    *) echo "Unknown command: $cmd" >&2; exit 1 ;;
  esac
}

if [[ -z "$COMMAND" || -z "$PILLAR" ]]; then
  usage
  exit 1
fi

require_docker

case "$COMMAND" in
  up|down|restart|status) ;;
  *) usage; exit 1 ;;
esac

if [[ "$COMMAND" == "up" ]]; then
  init_networks
  init_dirs
fi

if [[ "$PILLAR" == "all" ]]; then
  pillars=(net-core net cyber core monitoring virt cloud automation media backup devops ai business ui)
  for pillar in "${pillars[@]}"; do
    get_stack_info "$pillar"
    execute_stack "$STACK" "$NAME" "$COMMAND"
  done
else
  if ! get_stack_info "$PILLAR"; then
    usage
    exit 1
  fi
  execute_stack "$STACK" "$NAME" "$COMMAND"
fi
