'use strict';

const { execFile } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const express = require('express');
const cors = require('cors');

const ROOT = process.env.HOST_ROOT || path.join(__dirname, '../..');
const COMPOSE_DIR = path.join(ROOT, 'infra/compose');
const PORT = Number(process.env.PORT || 3001);

const PILLARS = [
  { id: '1', slug: 'virt', project: 'virt', file: 'stack-virt.yml', port: 9000, name: 'Virtualization' },
  { id: '2', slug: 'cloud', project: 'cloud', file: 'stack-cloud.yml', port: 8080, name: 'Private Cloud' },
  { id: '3', slug: 'net', project: 'network', file: 'stack-network.yml', port: 8095, name: 'Network Lab' },
  { id: '4', slug: 'cyber', project: 'cyber', file: 'stack-cyber.yml', port: 8443, name: 'Cyber Defense' },
  { id: '5', slug: 'automation', project: 'automation', file: 'stack-automation.yml', port: 8123, name: 'Automation' },
  { id: '6', slug: 'media', project: 'media', file: 'stack-media.yml', port: 8096, name: 'Media Server' },
  { id: '7', slug: 'backup', project: 'backup', file: 'stack-backup.yml', port: 8200, name: 'Backup' },
  { id: '8', slug: 'devops', project: 'devops', file: 'stack-devops.yml', port: 8000, name: 'DevOps' },
  { id: '9', slug: 'ai', project: 'ai', file: 'stack-ai.yml', port: 3005, name: 'AI Playground' },
  { id: '10', slug: 'monitoring', project: 'monitoring', file: 'stack-monitoring.yml', port: 3002, name: 'Observability' },
  { id: '11', slug: 'core', project: 'core', file: 'stack-core.yml', port: 9002, name: 'Identity' },
  { id: '12', slug: 'business', project: 'business', file: 'stack-business.yml', port: 6875, name: 'Business' },
];

const PILLAR_COMMANDS = {
  '1': {
    prune: { cmd: ['docker', 'image', 'prune', '-f'], message: 'VIRT: unused images pruned' },
  },
  '2': {
    'maint-on': { cmd: ['docker', 'exec', '--user', 'www-data', 'nextcloud', 'php', 'occ', 'maintenance:mode', '--on'], message: 'CLOUD: maintenance mode on' },
    'maint-off': { cmd: ['docker', 'exec', '--user', 'www-data', 'nextcloud', 'php', 'occ', 'maintenance:mode', '--off'], message: 'CLOUD: maintenance mode off' },
  },
  '3': {
    disable: { cmd: ['docker', 'exec', 'pihole', 'pihole', 'disable'], message: 'NET: DNS blocking suspended' },
    enable: { cmd: ['docker', 'exec', 'pihole', 'pihole', 'enable'], message: 'NET: DNS blocking restored' },
  },
  '5': {
    reload: { cmd: ['docker', 'restart', 'homeassistant'], message: 'AUTO: home assistant restarted' },
  },
  '7': {
    'backup-now': { cmd: ['docker', 'exec', 'duplicati', 'duplicati-cli', 'backup', '1'], message: 'BACKUP: snapshot started' },
  },
};

const SYSTEM_COMMANDS = {
  prune: { cmd: ['docker', 'system', 'prune', '-f'], message: 'SYSTEM: unused docker resources pruned' },
  'dns-flush': { cmd: ['docker', 'exec', 'pihole', 'pihole', '-f'], message: 'SYSTEM: Pi-hole cache flushed' },
  'backup-config': {
    cmd: ['tar', '-czf', path.join(ROOT, 'data/volumes/backup/config_snap.tar.gz'), '-C', ROOT, 'infra/compose', 'infra/config'],
    message: 'SYSTEM: compose and config snapshot written',
  },
};

const events = [];
const demoState = {};

function addEvent(message, type = 'info') {
  events.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message,
    type,
  });
  if (events.length > 40) events.pop();
}

function pillarById(id) {
  return PILLARS.find((pillar) => pillar.id === String(id));
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: opts.timeout || 20000, cwd: opts.cwd || ROOT, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const detail = (stderr || stdout || error.message || '').toString().trim();
        reject(new Error(detail || `${cmd} failed`));
        return;
      }
      resolve((stdout || '').toString());
    });
  });
}

function commandExists(name) {
  return run('sh', ['-c', `command -v ${name}`], { timeout: 2000 }).then(() => true).catch(() => false);
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port, timeout: 400 }, () => {
      socket.end();
      resolve(true);
    });
    const fail = () => {
      socket.destroy();
      resolve(false);
    };
    socket.on('error', fail);
    socket.on('timeout', fail);
  });
}

function readBlueprint(pillar) {
  try {
    return fs.readFileSync(path.join(COMPOSE_DIR, pillar.file), 'utf8');
  } catch {
    return 'BLUEPRINT_UNAVAILABLE';
  }
}

function demoWidgets(pillar) {
  const samples = {
    '1': [{ label: 'TOP_IMAGES', value: ['portainer/portainer-ce:48MB', 'grafana/grafana:312MB', 'prom/prometheus:180MB'] }],
    '2': [{ label: 'MANAGED_USERS', value: '3 ACTIVE' }, { label: 'CLOUD_KERNEL', value: 'INITIALIZED' }],
    '3': [{ label: 'BLOCK_RATE', value: '18% OF_TRAFFIC' }],
    '4': [{ label: 'ACTIVE_SECURITY_NODES', value: '2' }],
    '5': [{ label: 'ACTIVE_AUTOMATIONS', value: '6 CONFIGURED' }],
    '6': [{ label: 'LIBRARY_COUNT', value: '128 MEDIA_FILES' }],
    '7': [{ label: 'VAULT_SIZE', value: '4.2G ARCHIVED' }],
    '8': [{ label: 'RECENT_REPOS', value: ['starbase', 'homelab-notes'] }],
    '9': [{ label: 'LOADED_MODELS', value: ['llama3.2:3b'] }],
    '10': [{ label: 'FIRING_ALERTS', value: 'SYSTEM_NORMAL' }],
    '11': [{ label: 'ACCESS_LOGS', value: ['login jan 10.0.0.8', 'login admin 10.0.0.8'] }],
    '12': [{ label: 'WIKI_UPDATES', value: ['Runbook', 'Network map'] }],
  };
  return samples[pillar.id] || [];
}

function demoLogs(pillar) {
  return [
    `${pillar.name} engine online`,
    'config loaded from infra/compose/' + pillar.file,
    'warning: demo mode is not talking to Docker',
    'health probe accepted',
  ].join('\n');
}

async function detectMode() {
  if (process.env.STARBASE_DEMO === '1') return 'demo';
  if (process.env.STARBASE_DEMO === '0') return 'live';
  const hasDocker = await commandExists('docker');
  if (!hasDocker) return 'demo';
  try {
    await run('docker', ['info'], { timeout: 4000 });
    return 'live';
  } catch {
    return 'demo';
  }
}

async function liveProjects() {
  const stdout = await run('docker', ['ps', '--format', '{{.Label "com.docker.compose.project"}}'], { timeout: 8000 });
  return new Set(stdout.split('\n').map((line) => line.trim()).filter(Boolean));
}

async function liveStatus() {
  const projects = await liveProjects();
  const status = {};
  await Promise.all(PILLARS.map(async (pillar) => {
    const running = projects.has(pillar.project);
    const healthy = running ? await portOpen(pillar.port) : false;
    status[pillar.id] = { running, healthy };
  }));
  return status;
}

function demoStatus() {
  const status = {};
  for (const pillar of PILLARS) {
    const state = demoState[pillar.id] || { running: false, healthy: false };
    status[pillar.id] = state;
  }
  return status;
}

async function sysinfo(mode) {
  let cpu = '0%';
  let ram = '0%';
  let uptime = '0h';
  let hostname = 'starbase';
  let kernel = 'unknown';
  try {
    const si = require('systeminformation');
    const [load, mem, os, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      Promise.resolve(si.time()),
    ]);
    cpu = `${Math.round(load.currentLoad || 0)}%`;
    ram = mem.total ? `${Math.round((mem.active / mem.total) * 100)}%` : '0%';
    uptime = `${Math.round((time.uptime || 0) / 3600)}h`;
    hostname = os.hostname || hostname;
    kernel = os.kernel || kernel;
  } catch {
    hostname = 'demo-node';
  }

  let hog = 'NONE';
  if (mode === 'demo') {
    hog = demoState['9']?.running ? 'ollama:41%' : 'NONE';
  } else {
    try {
      const stdout = await run('docker', ['stats', '--no-stream', '--format', '{{.Name}}:{{.CPUPerc}}'], { timeout: 8000 });
      const rows = stdout.split('\n').map((line) => line.trim()).filter(Boolean);
      rows.sort((a, b) => parseFloat(b.split(':').pop()) - parseFloat(a.split(':').pop()));
      hog = rows[0] || 'NONE';
    } catch {
      hog = 'NONE';
    }
  }

  return { cpu, ram, uptime, hostname, kernel, hog, mode };
}

async function ensureBackupDir() {
  await fs.promises.mkdir(path.join(ROOT, 'data/volumes/backup'), { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '32kb' }));

let mode = 'demo';

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode });
});

app.get('/api/events', (_req, res) => {
  res.json(events);
});

app.get('/api/status', async (_req, res) => {
  try {
    res.json(mode === 'live' ? await liveStatus() : demoStatus());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sysinfo', async (_req, res) => {
  try {
    res.json(await sysinfo(mode));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/system/execute', async (req, res) => {
  const command = req.body && req.body.command;
  const spec = SYSTEM_COMMANDS[command];
  if (!spec) return res.status(400).json({ error: 'Invalid command' });

  if (mode === 'demo') {
    addEvent(`DEMO ${spec.message}`, 'success');
    return res.json({ success: true, message: spec.message, mode });
  }

  try {
    if (command === 'backup-config') await ensureBackupDir();
    await run(spec.cmd[0], spec.cmd.slice(1), { timeout: 120000 });
    addEvent(spec.message, 'success');
    res.json({ success: true, message: spec.message });
  } catch (error) {
    addEvent(`MAINTENANCE_FAILED: ${command}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pillars/:id/command', async (req, res) => {
  const pillar = pillarById(req.params.id);
  const command = req.body && req.body.command;
  if (!pillar) return res.status(404).json({ error: 'Not found' });
  const spec = (PILLAR_COMMANDS[pillar.id] || {})[command];
  if (!spec) return res.status(400).json({ error: 'COMMAND_NOT_SUPPORTED_FOR_THIS_PILLAR' });

  if (mode === 'demo') {
    addEvent(`DEMO ${spec.message}`, 'success');
    return res.json({ success: true, message: spec.message, mode });
  }

  try {
    addEvent(spec.message, 'info');
    await run(spec.cmd[0], spec.cmd.slice(1), { timeout: 120000 });
    addEvent(`SUCCESS: ${spec.message}`, 'success');
    res.json({ success: true, message: spec.message });
  } catch (error) {
    addEvent(`COMMAND_FAILED: ${spec.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pillars/:id/:action', async (req, res) => {
  const pillar = pillarById(req.params.id);
  const action = req.params.action;
  if (!pillar || !['up', 'down', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid pillar or action' });
  }

  if (mode === 'demo') {
    const running = action !== 'down';
    demoState[pillar.id] = { running, healthy: running };
    addEvent(`${pillar.name} ${action}`, running ? 'success' : 'info');
    return res.json({ success: true, message: `Pillar ${pillar.slug} ${action} successful`, mode });
  }

  if (action === 'up') {
    try {
      const si = require('systeminformation');
      const mem = await si.mem();
      const load = mem.total ? (mem.active / mem.total) * 100 : 0;
      if (load > 95) {
        addEvent(`IGNITION_ABORTED: memory at ${Math.round(load)}%`, 'error');
        return res.status(403).json({ error: 'RESOURCE_CRITICAL: FAILED_TO_ALLOCATE_MEMORY' });
      }
    } catch {
      // Host telemetry is optional. Compose may still start.
    }
  }

  try {
    addEvent(`${pillar.name} ${action}`, 'info');
    await run('bash', [path.join(ROOT, 'lab.sh'), action, pillar.slug], { timeout: 180000 });
    addEvent(`${pillar.name} ${action} finished`, 'success');
    res.json({ success: true, message: `Pillar ${pillar.slug} ${action} successful` });
  } catch (error) {
    addEvent(`${pillar.name} ${action} failed`, 'error');
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pillars/:id/logs', async (req, res) => {
  const pillar = pillarById(req.params.id);
  if (!pillar) return res.status(404).json({ error: 'Not found' });
  if (mode === 'demo') {
    const state = demoState[pillar.id];
    return res.json({ logs: state?.running ? demoLogs(pillar) : 'PILLAR_OFFLINE' });
  }
  try {
    const ids = await run('docker', ['ps', '-q', '--filter', `label=com.docker.compose.project=${pillar.project}`]);
    const containerIds = ids.split('\n').map((line) => line.trim()).filter(Boolean);
    if (containerIds.length === 0) return res.json({ logs: 'No logs available or pillar is offline.' });
    const chunks = [];
    for (const id of containerIds.slice(0, 8)) {
      try {
        chunks.push(await run('docker', ['logs', '--tail', '40', id], { timeout: 8000 }));
      } catch (error) {
        chunks.push(error.message);
      }
    }
    res.json({ logs: chunks.join('\n').trim() || 'No logs available.' });
  } catch (error) {
    res.json({ logs: error.message });
  }
});

app.get('/api/pillars/:id/stats', async (req, res) => {
  const pillar = pillarById(req.params.id);
  if (!pillar) return res.status(404).json({ error: 'Not found' });
  if (mode === 'demo') {
    const state = demoState[pillar.id];
    if (!state?.running) return res.json({ stats: [] });
    return res.json({ stats: [`${pillar.name}: CPU 4.2%, RAM 180MiB / 512MiB`, `PORT ${pillar.port} LISTENING`] });
  }
  try {
    const stdout = await run('docker', [
      'stats', '--no-stream',
      '--format', '{{.Name}}: CPU {{.CPUPerc}}, RAM {{.MemUsage}}',
      '--filter', `label=com.docker.compose.project=${pillar.project}`,
    ]);
    res.json({ stats: stdout.split('\n').map((line) => line.trim()).filter(Boolean) });
  } catch {
    res.json({ stats: [] });
  }
});

app.get('/api/pillars/:id/plugin', (req, res) => {
  const pillar = pillarById(req.params.id);
  if (!pillar) return res.status(404).json({ error: 'Not found' });
  res.json({
    blueprint: readBlueprint(pillar),
    widgets: demoWidgets(pillar),
  });
});

detectMode().then((detected) => {
  mode = detected;
  for (const id of ['3', '10', '11']) {
    demoState[id] = { running: true, healthy: true };
  }
  demoState['2'] = { running: true, healthy: false };
  addEvent(mode === 'demo' ? 'starbase control plane online (demo mode)' : 'starbase control plane online', 'success');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`starbase api listening on ${PORT} (${mode})`);
  });
});
