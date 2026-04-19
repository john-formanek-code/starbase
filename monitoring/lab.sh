#!/bin/bash

# Homelab Pillar Management Script
# Usage: ./lab.sh [up|down|restart|status] [pillar_name]

COMMAND=$1
PILLAR=$2

get_stack_info() {
  case $1 in
    "virt") STACK="stack-containers.yml"; NAME="virt" ;;
    "cloud") STACK="stack-cloud.yml"; NAME="cloud" ;;
    "net-core") STACK="stack-network-core.yml"; NAME="network-core" ;;
    "net") STACK="stack-network.yml"; NAME="network" ;;
    "cyber") STACK="stack-cyber.yml"; NAME="cyber" ;;
    "automation") STACK="stack-automation.yml"; NAME="automation" ;;
    "media") STACK="stack-media.yml"; NAME="media" ;;
    "backup") STACK="stack-backup.yml"; NAME="backup" ;;
    "devops") STACK="stack-devops.yml"; NAME="devops" ;;
    "ai") STACK="stack-ai.yml"; NAME="ai" ;;
    "monitoring") STACK="stack-monitoring.yml"; NAME="monitoring" ;;
    "core") STACK="stack-core.yml"; NAME="core" ;;
    "business") STACK="stack-business.yml"; NAME="business" ;;
    "ui") STACK="stack-ui.yml"; NAME="ui" ;;
    *) return 1 ;;
  esac
}

# Network initialization
init_networks() {
  echo "📡 Initializing Networks..."
  NETWORKS=("proxy" "monitoring" "vlan10_mgmt" "vlan20_srv" "vlan30_clients" "vlan60_dmz" "database" "identity")
  for net in "${NETWORKS[@]}"; do
    docker network create "$net" 2>/dev/null || true
  done
}

# Volume and Folder permissions
init_dirs() {
  echo "📂 Initializing Directories..."
  docker run --rm -v "$(pwd)":/mnt busybox chmod -R 777 /mnt
}

execute_stack() {
  local file=$1
  local name=$2
  local cmd=$3
  echo "🚀 Executing $cmd on $file (Project: $name)..."
  if [ "$cmd" == "up" ]; then
    docker compose -p "$name" -f "$file" up -d
  elif [ "$cmd" == "down" ]; then
    docker compose -p "$name" -f "$file" down
  elif [ "$cmd" == "restart" ]; then
    docker compose -p "$name" -f "$file" restart
  elif [ "$cmd" == "status" ]; then
    docker compose -p "$name" -f "$file" ps
  fi
}

# Execution logic
init_networks

if [ "$PILLAR" == "all" ]; then
  if [ "$COMMAND" == "up" ]; then init_dirs; fi
  PILLARS=("net-core" "net" "cyber" "core" "monitoring" "virt" "cloud" "automation" "media" "backup" "devops" "ai" "business" "ui")
  for p in "${PILLARS[@]}"; do
    get_stack_info "$p"
    execute_stack "$STACK" "$NAME" "$COMMAND"
  done
else
  get_stack_info "$PILLAR"
  if [ $? -eq 0 ]; then
    execute_stack "$STACK" "$NAME" "$COMMAND"
  else
    echo "Usage: $0 [up|down|restart|status] [virt|cloud|net-core|net|cyber|automation|media|backup|devops|ai|monitoring|core|business|ui|all]"
    exit 1
  fi
fi
