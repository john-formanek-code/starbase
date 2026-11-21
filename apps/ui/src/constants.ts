import {
  Shield,
  Cpu,
  Cloud,
  Network,
  Home,
  Film,
  Save,
  GitBranch,
  Terminal,
  Eye,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PillarStatus = { running: boolean; healthy: boolean };
export type SystemEvent = { timestamp: string; message: string; type: string };
export type SysInfo = {
  cpu?: string;
  ram?: string;
  uptime?: string;
  hostname?: string;
  kernel?: string;
  hog?: string;
  mode?: 'demo' | 'live';
};
export type PillarWidget = { label: string; value: string | string[] };
export type PillarPlugin = { blueprint?: string; widgets?: PillarWidget[] };
export type Pillar = {
  id: number;
  slug: string;
  name: string;
  icon: LucideIcon;
  desc: string;
  url: string;
};

export const getUrl = (port: number) => `http://${window.location.hostname}:${port}`;

export const PILLARS: Pillar[] = [
  { id: 1, slug: 'virt', name: "Virtualization", icon: Cpu, desc: "Portainer & Containers", url: getUrl(9000) },
  { id: 2, slug: 'cloud', name: "Private Cloud", icon: Cloud, desc: "Nextcloud Storage", url: getUrl(8080) },
  { id: 3, slug: 'net', name: "Network Lab", icon: Network, desc: "VyOS & Pi-hole", url: getUrl(8095) },
  { id: 4, slug: 'cyber', name: "Cyber Defense", icon: Shield, desc: "Wazuh SIEM", url: getUrl(8443) },
  { id: 5, slug: 'automation', name: "Automation", icon: Home, desc: "Home Assistant", url: getUrl(8123) },
  { id: 6, slug: 'media', name: "Media Server", icon: Film, desc: "Jellyfin Streaming", url: getUrl(8096) },
  { id: 7, slug: 'backup', name: "Backup & DR", icon: Save, desc: "Duplicati Backups", url: getUrl(8200) },
  { id: 8, slug: 'devops', name: "DevOps / CI", icon: GitBranch, desc: "Woodpecker CI", url: getUrl(8000) },
  { id: 9, slug: 'ai', name: "AI Playground", icon: Terminal, desc: "Ollama & LLMs", url: getUrl(3005) },
  { id: 10, slug: 'monitoring', name: "Observability", icon: Eye, desc: "Grafana & Metrics", url: getUrl(3002) },
  { id: 11, slug: 'core', name: "Identity IAM", icon: UserCheck, desc: "Authentik SSO", url: getUrl(9002) },
  { id: 12, slug: 'business', name: "Business Stack", icon: Briefcase, desc: "BookStack Wiki", url: getUrl(6875) },
];
