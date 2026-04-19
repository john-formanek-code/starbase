const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const si = require('systeminformation');

const app = express();
app.use(cors());
app.use(express.json());

const LAB_PATH = path.join(__dirname, '../monitoring');

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
addEvent("FJTG_OS KERNEL_BOOT_SUCCESS", "success");

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

// New System Info Endpoint for "Brilliant" Dashboard
app.get('/api/sysinfo', async (req, res) => {
  try {
    const [cpu, mem, load, os] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.currentLoad(),
      si.osInfo()
    ]);
    res.json({
      cpu: `${Math.round(load.currentLoad)}%`,
      temp: cpu.speed ? `${cpu.speed}GHz` : 'N/A',
      ram: `${Math.round((mem.active / mem.total) * 100)}%`,
      uptime: Math.round(si.time().uptime / 3600) + 'h',
      hostname: os.hostname,
      kernel: os.kernel,
      distro: os.distro
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute lab.sh command
const runLab = (cmd, pillar) => {
  return new Promise((resolve, reject) => {
    exec(`./lab.sh ${cmd} ${pillar}`, { cwd: LAB_PATH }, (error, stdout, stderr) => {
      if (error) reject(stderr);
      else resolve(stdout);
    });
  });
};

// Get status of all pillars
app.get('/api/status', async (req, res) => {
  try {
    exec('docker ps --format "{{.Label \\"com.docker.compose.project\\"}}" | sort | uniq', (error, stdout) => {
      if (error) {
        console.error("Docker PS Error:", error);
        return res.status(500).json({ error: error.message });
      }
      
      const runningProjects = stdout.split('\n').map(s => s.trim()).filter(Boolean);
      
      const status = {};
      Object.keys(PILLAR_MAP).forEach(id => {
        const internalName = PILLAR_MAP[id];
        const dockerProjectName = ACTUAL_NAMES[internalName];
        status[id] = runningProjects.includes(dockerProjectName);
      });
      res.json(status);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pillars/:id/:action', async (req, res) => {
  const { id, action } = req.params;
  const pillar = PILLAR_MAP[id];
  
  if (!pillar || !['up', 'down', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid pillar or action' });
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
  const pillar = PILLAR_MAP[id];
  if (!pillar) return res.status(404).json({ error: 'Not found' });
  
  const projectName = ACTUAL_NAMES[pillar];
  // docker stats for the project
  const cmd = `docker stats --no-stream --format "{{.Name}}: CPU {{.CPUPerc}}, RAM {{.MemUsage}}" --filter "label=com.docker.compose.project=${projectName}"`;
  
  exec(cmd, (error, stdout) => {
    if (error || !stdout.trim()) {
      return res.json({ stats: [] });
    }
    const stats = stdout.split('\n').filter(Boolean);
    res.json({ stats });
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FJTG System API running on port ${PORT}`);
});
