const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const si = require('systeminformation');

const app = express();
app.use(cors());
app.use(express.json());

const LAB_PATH = process.env.HOST_ROOT || path.join(__dirname, '../../');
const DATA_ROOT = process.env.HOST_ROOT ? path.join(process.env.HOST_ROOT, 'data/volumes') : path.join(__dirname, '../../data/volumes');

// In-memory events buffer (Production-ready lightweight logging)
const systemEvents = [];
const addEvent = (msg, type = 'info') => {
  systemEvents.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message: msg,
    type: type
  });
  if (systemEvents.length > 25) systemEvents.pop();
};

// Log initial boot
addEvent("starbase_OS KERNEL_BOOT_SUCCESS", "success");

app.get('/api/events', (req, res) => res.json(systemEvents));

const PILLAR_MAP = {
  '1': 'virt',
  '2': 'cloud',
  '3': 'net',
  '4': 'cyber',
  '5': 'automation',
  '6': 'media',
  '7': 'backup',
  '8': 'devops',
  '9': 'ai',
  '10': 'monitoring',
  '11': 'core',
  '12': 'business'
};

const ACTUAL_NAMES = {
  'virt': 'virt',
  'cloud': 'cloud',
  'net': 'network',
  'cyber': 'cyber',
  'automation': 'automation',
  'media': 'media',
  'backup': 'backup',
  'devops': 'devops',
  'ai': 'ai',
  'monitoring': 'monitoring',
  'core': 'core',
  'business': 'business'
};

const PILLAR_PORTS = {
  '1': 9000,
  '2': 8080,
  '3': 80,
  '4': 8443,
  '5': 8123,
  '6': 8096,
  '7': 8200,
  '8': 3004,
  '9': 3005,
  '10': 3002,
  '11': 9002,
  '12': 6875
};

// Check if a port is responding (Real Health Check)
const checkHealth = (port) => {
  return new Promise((resolve) => {
    const cmd = `nc -z -w 1 localhost ${port} && echo "OPEN" || echo "CLOSED"`;
    exec(cmd, (err, stdout) => {
      resolve(stdout.trim() === "OPEN");
    });
  });
};

// Get status of all pillars
app.get('/api/status', async (req, res) => {
  try {
    exec('docker ps --format "{{.Label \\"com.docker.compose.project\\"}}" | sort | uniq', async (error, stdout) => {
      if (error) return res.status(500).json({ error: error.message });
      const runningProjects = stdout.split('\n').map(s => s.trim()).filter(Boolean);
      
      const status = {};
      const healthPromises = Object.keys(PILLAR_MAP).map(async (id) => {
        const internalName = PILLAR_MAP[id];
        const dockerProjectName = ACTUAL_NAMES[internalName];
        const isRunning = runningProjects.includes(dockerProjectName);
        
        let isHealthy = false;
        if (isRunning && PILLAR_PORTS[id]) {
          isHealthy = await checkHealth(PILLAR_PORTS[id]);
        }
        
        status[id] = { running: isRunning, healthy: isHealthy };
      });

      await Promise.all(healthPromises);
      res.json(status);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New System Info Endpoint
app.get('/api/sysinfo', async (req, res) => {
  try {
    const [cpu, mem, load, os] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.currentLoad(),
      si.osInfo()
    ]);

    // Hunter: Get top CPU consuming container
    exec('docker stats --no-stream --format "{{.Name}}:{{.CPUPerc}}" | sort -t: -k2 -hr | head -n1', (err, stdout) => {
      res.json({
        cpu: `${Math.round(load.currentLoad)}%`,
        ram: `${Math.round((mem.active / mem.total) * 100)}%`,
        uptime: Math.round(si.time().uptime / 3600) + 'h',
        hostname: os.hostname,
        kernel: os.kernel,
        hog: stdout.trim() || "NONE"
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute system maintenance commands
app.post('/api/system/execute', async (req, res) => {
  const { command } = req.body;

  let cmd = '';
  let msg = '';

  if (command === 'prune') {
    cmd = 'docker system prune -f';
    msg = 'SYSTEM_CLEANUP: ORPHANED_RESOURCES_PURGED';
  } else if (command === 'dns-flush') {
    cmd = 'docker exec pihole pihole -f';
    msg = 'NETWORK_GOVERNANCE: DNS_CACHE_FLUSHED';
  } else if (command === 'backup-config') {
    cmd = 'tar -czf data/volumes/backup/config_snap.tar.gz infra/config';
    msg = 'DATA_INTEGRITY: ARCHITECTURE_SNAPSHOT_CREATED';
  }

  if (!cmd) return res.status(400).json({ error: 'Invalid command' });

  exec(cmd, (err, stdout) => {
    if (err) {
      addEvent(`MAINTENANCE_FAILED: ${command.toUpperCase()}`, 'error');
      return res.status(500).json({ error: err.message });
    }
    addEvent(msg, 'success');
    res.json({ success: true, message: msg });
  });
});

app.post('/api/pillars/:id/:action', async (req, res) => {
  const { id, action } = req.params;
  const pillar = PILLARS[id];

  if (!pillar || !['up', 'down', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid pillar or action' });
  }

  // RESOURCE GUARD: Prevent ignition if RAM is critical
  if (action === 'up') {
    const mem = await si.mem();
    const load = (mem.active / mem.total) * 100;
    if (load > 95) {
      addEvent(`IGNITION_ABORTED: SYSTEM_RESOURCES_CRITICAL (${Math.round(load)}% RAM)`, 'error');
      return res.status(403).json({ error: 'RESOURCE_CRITICAL: FAILED_TO_ALLOCATE_MEMORY' });
    }
  }

  try {
    addEvent(`IGNITION_SEQUENCE: ${pillar.toUpperCase()} ${action.toUpperCase()}`, 'info');
    await runLab(action, pillar);
    addEvent(`SEQUENCE_COMPLETE: ${pillar.toUpperCase()} IS_READY`, 'success');
    res.json({ success: true, message: `Pillar ${pillar} ${action} successful` });
  } catch (err) {
    addEvent(`SEQUENCE_CRITICAL: ${pillar.toUpperCase()} FAILED`, 'error');
    res.status(500).json({ error: err });
  }
});

// Get container logs for a specific pillar
app.get('/api/pillars/:id/logs', (req, res) => {
  const { id } = req.params;
  const pillar = PILLAR_MAP[id];
  if (!pillar) return res.status(404).json({ error: 'Not found' });
  
  const projectName = ACTUAL_NAMES[pillar];
  // Get last 50 lines of logs for containers in this project
  const cmd = `docker ps -q --filter "label=com.docker.compose.project=${projectName}" | xargs -r docker logs --tail 50 2>&1 | tail -n 100`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error && !stdout) {
      return res.json({ logs: 'No logs available or pillar is offline.' });
    }
    res.json({ logs: stdout || stderr || 'No logs available.' });
  });
});

// Get real-time stats for a specific pillar
app.get('/api/pillars/:id/stats', (req, res) => {
  const { id } = req.params;
  const pillar = PILLARS[id];
  if (!pillar) return res.status(404).json({ error: 'Not found' });

  const projectName = ACTUAL_NAMES[pillar];

  // Base command for standard stats
  const statsCmd = `docker stats --no-stream --format "{{.Name}}: CPU {{.CPUPerc}}, RAM {{.MemUsage}}" --filter "label=com.docker.compose.project=${projectName}"`;

  exec(statsCmd, (error, stdout) => {
    let stats = [];
    if (!error && stdout.trim()) {
      stats = stdout.split('\n').filter(Boolean);
    }

    // Special cohesion for Pillar 1 (Virtualization): Add global system telemetry
    if (id === '1') {
      const systemCmd = 'docker ps -q | wc -l && docker images -q | wc -l && docker volume ls -q | wc -l';
      exec(systemCmd, (err, stdout) => {
        if (!err) {
          const [containers, images, volumes] = stdout.split('\n').map(s => s.trim());
          stats.unshift(`ORCHESTRATION_UNITS: ${containers} CONTAINERS / ${images} IMAGES / ${volumes} VOLUMES`);
          stats.unshift(`HYPERVISOR_MODE: GLOBAL_GOVERNANCE_ACTIVE`);
        }
        res.json({ stats });
      });
    // Special cohesion for Pillar 2 (Private Cloud): Add deep app telemetry
    else if (id === '2') {
      const cloudStats = [];
      
      // 1. Get Disk Usage (External Probe)
      const diskCmd = `du -sh ${path.join(DATA_ROOT, 'nextcloud/data')} 2>/dev/null | cut -f1`;
      
      // 2. Get App Status (Internal Deep Probe via occ)
      const occCmd = `docker exec --user www-data nextcloud php occ status --output=json 2>/dev/null`;
      
      // 3. Get DB size (Database Deep Probe)
      const dbCmd = `docker exec nextcloud-db psql -U nextcloud -d nextcloud -c "SELECT pg_size_pretty(pg_database_size('nextcloud'));" -t 2>/dev/null`;

      exec(`${diskCmd} && ${occCmd} && ${dbCmd}`, (err, stdout) => {
        if (!err && stdout) {
          const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
          // Disk Usage
          cloudStats.push(`STORAGE_ENGINE: ${lines[0] || '0B'} DATA_VAULT_SIZE`);
          
          // App Status
          try {
            const status = JSON.parse(lines[1]);
            cloudStats.push(`CLOUD_KERNEL: v${status.version} [${status.installed ? 'INITIALIZED' : 'CONFIG_PENDING'}]`);
          } catch(e) {
            cloudStats.push(`CLOUD_KERNEL: ENGINE_BOOTING...`);
          }

          // DB Size
          if (lines[2]) cloudStats.push(`DATABASE_WEIGHT: ${lines[2]} POSTGRES_STORAGE`);
        } else {
          cloudStats.push(`CLOUD_STORAGE: OFFLINE_OR_BOOTING`);
        }
        res.json({ stats: [...cloudStats, ...stats] });
      });
    }
    // Special cohesion for Pillar 3 (Network Lab): Add DNS telemetry
    else if (id === '3') {
      exec('curl -s http://pihole_exporter:9617/metrics | grep "pihole_ads_blocked_today" | head -n1 | awk \'{print $2}\'', (err, stdout) => {
        if (!err && stdout.trim()) {
          stats.unshift(`TRAFFIC_GOVERNANCE: ${stdout.trim()} DNS_THREADS_BLOCKED`);
        } else {
          stats.unshift(`TRAFFIC_GOVERNANCE: ENGINE_ACTIVE`);
        }
        res.json({ stats });
      });
    }
    // Special cohesion for Pillar 4 (Cyber Defense): Add SIEM telemetry
    else if (id === '4') {
      const cyberStats = [];
      // 1. Get Wazuh Agent Status (Deep Probe)
      // /var/ossec/bin/agent_control -l shows agents. We count the lines.
      const wazuhCmd = `docker exec wazuh-manager /var/ossec/bin/agent_control -l 2>/dev/null | grep -c "ID:" || echo "0"`;
      
      exec(wazuhCmd, (err, stdout) => {
        const agentCount = stdout.trim();
        cyberStats.push(`SIEM_LOGIC: ACTIVE_SHIELD`);
        cyberStats.push(`SECURITY_AGENTS: ${agentCount} NODES_PROTECTED`);
        
        res.json({ stats: [...cyberStats, ...stats] });
      });
    }
    // Special cohesion for Pillar 5 (Automation): Add Home Assistant telemetry
    else if (id === '5') {
      const autoStats = [];
      // Get HA version and state
      const haCmd = `docker exec homeassistant python3 -m homeassistant --version 2>/dev/null || echo "OFFLINE"`;
      
      exec(haCmd, (err, stdout) => {
        const version = stdout.trim();
        if (version !== "OFFLINE") {
          autoStats.push(`AUTOMATION_CORE: v${version} [LOGIC_PROPPED]`);
          autoStats.push(`MQTT_BROKER: SIGNAL_STABLE`);
        } else {
          autoStats.push(`AUTOMATION_CORE: STANDBY_OR_BOOTING`);
        }
        res.json({ stats: [...autoStats, ...stats] });
      });
    }
    else {
      res.json({ stats });
    }
  });
});

// Get deep-service intelligence (Plugin Architecture)
app.get('/api/pillars/:id/plugin', async (req, res) => {
  const { id } = req.params;
  const pillar = PILLAR_MAP[id];
  if (!pillar) return res.status(404).json({ error: 'Not found' });

  const pluginData = {
    blueprint: '',
    widgets: []
  };

  try {
    // 1. Load Blueprint (IaC Visibility)
    const blueprintPath = path.join(LAB_PATH, `infra/compose/stack-${pillar === 'net' ? 'network' : (pillar === 'virt' ? 'virt' : pillar)}.yml`);
    exec(`cat ${blueprintPath} 2>/dev/null`, (err, stdout) => {
      pluginData.blueprint = stdout || 'BLUEPRINT_UNAVAILABLE';

      // 2. Dispatch Pillar-Specific Intelligence
      if (id === '1') { // Virt
        exec('docker images --format "{{.Repository}}:{{.Size}}" | head -n 5', (e, out) => {
          pluginData.widgets.push({ label: 'TOP_IMAGES', value: out.trim().split('\n') });
          res.json(pluginData);
        });
      } else if (id === '2') { // Cloud
        exec(`docker exec --user www-data nextcloud php occ user:list --output=json 2>/dev/null`, (e, out) => {
          try {
            const users = Object.keys(JSON.parse(out)).length;
            pluginData.widgets.push({ label: 'MANAGED_USERS', value: `${users} ACTIVE` });
          } catch(err) {
            pluginData.widgets.push({ label: 'MANAGED_USERS', value: 'PROBING...' });
          }
          res.json(pluginData);
        });
      } else if (id === '3') { // Net
        exec(`curl -s http://pihole_exporter:9617/metrics | grep "pihole_ads_percentage_today" | awk '{print $2}'`, (e, out) => {
          pluginData.widgets.push({ label: 'BLOCK_RATE', value: `${Math.round(parseFloat(out) || 0)}% OF_TRAFFIC` });
          res.json(pluginData);
        });
      } else if (id === '4') { // Cyber
        exec(`docker exec wazuh-manager /var/ossec/bin/agent_control -l 2>/dev/null | grep "Active" | wc -l`, (e, out) => {
          pluginData.widgets.push({ label: 'ACTIVE_SECURITY_NODES', value: out.trim() });
          res.json(pluginData);
        });
      } else if (id === '8') { // DevOps
        const repoPath = path.join(DATA_ROOT, 'gitea/data/gitea-repositories');
        exec(`find ${repoPath} -maxdepth 2 -name ".git" -printf "%T+ %p\n" 2>/dev/null | sort -r | head -n 5 | awk -F/ '{print $NF}' | sed 's/\.git//'`, (e, out) => {
          pluginData.widgets.push({ label: 'RECENT_REPOS', value: out.trim().split('\n').filter(Boolean) || 'NO_GIT_ACTIVITY' });
          res.json(pluginData);
        });
      } else if (id === '10') { // Monitoring
        exec(`curl -s http://alertmanager:9093/api/v2/alerts`, (e, out) => {
          try {
            const alerts = JSON.parse(out).map(a => a.labels.alertname);
            pluginData.widgets.push({ label: 'FIRING_ALERTS', value: alerts.length > 0 ? alerts : 'SYSTEM_NORMAL' });
          } catch(err) {
            pluginData.widgets.push({ label: 'ALERT_ENGINE', value: 'PROBING_SILENT' });
          }
          res.json(pluginData);
        });
      } else if (id === '11') { // Identity
        const sql = "SELECT action, username, remote_ip FROM events_event ORDER BY created DESC LIMIT 5;";
        exec(`docker exec authentik-db psql -U authentik -d authentik -c "${sql}" -t 2>/dev/null`, (e, out) => {
          pluginData.widgets.push({ label: 'ACCESS_LOGS', value: out.trim().split('\n').map(l => l.trim()).filter(Boolean) || 'LOG_CLEAN' });
          res.json(pluginData);
        });
      } else if (id === '12') { // Business
        const sql = "SELECT name FROM pages ORDER BY updated_at DESC LIMIT 5;";
        exec(`docker exec bookstack-db mysql -u bookstack -pbookstack_db_pass bookstack -e "${sql}" -sN 2>/dev/null`, (e, out) => {
          pluginData.widgets.push({ label: 'WIKI_UPDATES', value: out.trim().split('\n').filter(Boolean) || 'NO_PAGES_FOUND' });
          res.json(pluginData);
        });
      } else if (id === '6') { // Media
        const moviePath = path.join(DATA_ROOT, 'jellyfin/movies');
        const showPath = path.join(DATA_ROOT, 'jellyfin/tvshows');
        exec(`find ${moviePath} ${showPath} -type f | wc -l`, (e, out) => {
            pluginData.widgets.push({ label: 'LIBRARY_COUNT', value: `${out.trim()} MEDIA_FILES` });
            res.json(pluginData);
        });
      } else if (id === '7') { // Backup
        const backupPath = path.join(DATA_ROOT, 'duplicati/backups');
        exec(`ls -lh ${backupPath} 2>/dev/null | head -n 2 | tail -n 1 | awk '{print $5}'`, (e, out) => {
            pluginData.widgets.push({ label: 'VAULT_SIZE', value: `${out.trim() || '0B'} ARCHIVED` });
            res.json(pluginData);
        });
      } else if (id === '9') { // AI
        exec(`curl -s http://ollama:11434/api/tags`, (e, out) => {
          try {
            const models = JSON.parse(out).models.map(m => m.name);
            pluginData.widgets.push({ label: 'LOADED_MODELS', value: models.length > 0 ? models : 'NO_MODELS_FOUND' });
          } catch(err) {
            pluginData.widgets.push({ label: 'AI_ENGINE', value: 'STANDBY_MODE' });
          }
          res.json(pluginData);
        });
      } else if (id === '5') { // Auto
        const autoPath = path.join(DATA_ROOT, 'homeassistant/config/automations.yaml');
        exec(`grep -c "^-" ${autoPath} 2>/dev/null`, (e, out) => {
          pluginData.widgets.push({ label: 'ACTIVE_AUTOMATIONS', value: `${out.trim() || '0'} CONFIGURED` });
          res.json(pluginData);
        });
      } else {
        res.json(pluginData);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute service-specific management commands (Pillar Studio Actions)
app.post('/api/pillars/:id/command', async (req, res) => {
  const { id } = req.params;
  const { command } = req.body;
  const pillar = PILLAR_MAP[id];
  
  if (!pillar) return res.status(404).json({ error: 'Not found' });

  let cmd = '';
  let msg = '';

  // COMMAND LOGIC GATE
  if (id === '1') { // Virt
    if (command === 'prune') {
      cmd = 'docker image prune -af';
      msg = 'VIRT_GOVERNANCE: UNUSED_IMAGES_PURGED';
    }
  } else if (id === '2') { // Cloud
    if (command === 'maint-on') {
      cmd = 'docker exec --user www-data nextcloud php occ maintenance:mode --on';
      msg = 'CLOUD_SECURITY: MAINTENANCE_MODE_ENGAGED';
    } else if (command === 'maint-off') {
      cmd = 'docker exec --user www-data nextcloud php occ maintenance:mode --off';
      msg = 'CLOUD_SECURITY: MAINTENANCE_MODE_RELEASED';
    }
  } else if (id === '3') { // Net
    if (command === 'disable') {
      cmd = 'docker exec pihole pihole disable';
      msg = 'NET_GOVERNANCE: DNS_FILTER_SUSPENDED';
    } else if (command === 'enable') {
      cmd = 'docker exec pihole pihole enable';
      msg = 'NET_GOVERNANCE: DNS_FILTER_ACTIVE';
    }
  } else if (id === '5') { // Auto
    if (command === 'reload') {
      cmd = 'docker exec homeassistant python3 -m homeassistant --script check_config && docker exec homeassistant curl -X POST http://localhost:8123/api/services/homeassistant/reload_all';
      msg = 'AUTO_LOGIC: CORE_CONFIGURATION_RELOADED';
    }
  } else if (id === '7') { // Backup
    if (command === 'backup-now') {
      cmd = 'docker exec duplicati /usr/bin/duplicati-cli backup 1';
      msg = 'INTEGRITY_GUARD: EMERGENCY_BACKUP_IGNITED';
    }
  }

  if (!cmd) return res.status(400).json({ error: 'COMMAND_NOT_SUPPORTED_FOR_THIS_PILLAR' });

  addEvent(`EXECUTING_COMMAND: ${msg}`, 'info');
  
  exec(cmd, (err, stdout) => {
    if (err) {
      addEvent(`COMMAND_CRITICAL_FAILURE: ${msg}`, 'error');
      return res.status(500).json({ error: err.message });
    }
    addEvent(`SUCCESS: ${msg}`, 'success');
    res.json({ success: true, message: msg });
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`starbase System API running on port ${PORT}`);
});
