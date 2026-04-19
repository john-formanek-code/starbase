import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
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
  Power,
  Loader2,
  ExternalLink,
  Activity,
  Zap,
  Server,
  ChevronRight,
  ArrowLeft,
  Search,
  Globe,
  List,
  Clock
} from 'lucide-react';

const getUrl = (port: number) => `http://${window.location.hostname}:${port}`;

const PILLARS = [
  { id: 1, slug: 'virt', name: "Virtualization", icon: Cpu, desc: "Portainer & Containers", url: getUrl(9000) },
  { id: 2, slug: 'cloud', name: "Private Cloud", icon: Cloud, desc: "Nextcloud Storage", url: getUrl(8080) },
  { id: 3, slug: 'net', name: "Network Lab", icon: Network, desc: "VyOS & Pi-hole", url: getUrl(8095) },
  { id: 4, slug: 'cyber', name: "Cyber Defense", icon: Shield, desc: "Wazuh SIEM", url: getUrl(8443) },
  { id: 5, slug: 'automation', name: "Automation", icon: Home, desc: "Home Assistant", url: getUrl(8123) },
  { id: 6, slug: 'media', name: "Media Server", icon: Film, desc: "Jellyfin Streaming", url: getUrl(8096) },
  { id: 7, slug: 'backup', name: "Backup & DR", icon: Save, desc: "Duplicati Backups", url: getUrl(8200) },
  { id: 8, slug: 'devops', name: "DevOps / CI", icon: GitBranch, desc: "Gitea & Woodpecker", url: getUrl(3004) },
  { id: 9, slug: 'ai', name: "AI Playground", icon: Terminal, desc: "Ollama & LLMs", url: getUrl(3005) },
  { id: 10, slug: 'monitoring', name: "Observability", icon: Eye, desc: "Grafana & Metrics", url: getUrl(3002) },
  { id: 11, slug: 'core', name: "Identity IAM", icon: UserCheck, desc: "Authentik SSO", url: getUrl(9002) },
  { id: 12, slug: 'business', name: "Business Stack", icon: Briefcase, desc: "BookStack Wiki", url: getUrl(6875) },
];

const Sidebar = ({ sysInfo }: any) => (
  <aside style={{
    width: '280px',
    backgroundColor: 'var(--bg-nav)',
    borderRight: '1px solid var(--border)',
    height: '100vh',
    position: 'fixed',
    padding: '30px 20px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{ marginBottom: '50px' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="glitch-text" style={{ fontSize: '28px', color: 'var(--accent)', marginBottom: '10px' }}>
          starbase // OS
        </h1>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '3px' }}>v5.2.0 // TITAN_GRADE</div>
      </Link>
    </div>
    
    <nav style={{ flex: 1, overflowY: 'auto' }} className="terminal-scroll">
      <div style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '20px', opacity: 0.6, fontWeight: 700, letterSpacing: '2px' }}>MODULE_INDEX</div>
      {PILLARS.map(p => (
        <Link key={p.id} to={`/pillar/${p.slug}`} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '10px 12px', 
          color: 'var(--text-dim)',
          fontSize: '11px',
          cursor: 'pointer',
          borderRadius: '4px',
          marginBottom: '2px',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
          border: '1px solid transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-main)';
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-dim)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p.icon size={14} />
            {p.name.toUpperCase()}
          </div>
          <ChevronRight size={10} opacity={0.3} />
        </Link>
      ))}
    </nav>

    <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', marginTop: '20px' }}>
      <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '8px', opacity: 0.5 }}>HARDWARE_TELEMETRY</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={10} color="var(--accent)" /> {sysInfo?.hostname || 'LOCAL_NODE'}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={10} /> UPTIME: {sysInfo?.uptime || '0h'}
        </div>
      </div>
    </div>
  </aside>
);

const EventLog = ({ events }: any) => (
  <div style={{ 
    backgroundColor: 'rgba(5,5,5,0.8)', 
    border: '1px solid var(--border)', 
    padding: '20px', 
    borderRadius: '4px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <List size={14} /> SYSTEM_EVENT_BUFFER
    </div>
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="terminal-scroll">
      {events.map((ev: any, i: number) => (
        <div key={i} style={{ fontSize: '11px', display: 'flex', gap: '10px', borderLeft: `2px solid ${ev.type === 'success' ? '#00ff00' : ev.type === 'error' ? '#ff0000' : 'var(--border)'}`, paddingLeft: '10px' }}>
          <span style={{ color: 'var(--text-dim)', opacity: 0.5 }}>[{ev.timestamp}]</span>
          <span style={{ color: ev.type === 'success' ? '#00ff00' : ev.type === 'error' ? '#ff0000' : 'var(--text-main)' }}>{ev.message}</span>
        </div>
      ))}
      {events.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>AWAITING_EVENTS...</div>}
    </div>
  </div>
);

const MatrixGrid = ({ statuses, loading, togglePillar, searchQuery, events }: any) => {
  const navigate = useNavigate();
  
  const filteredPillars = useMemo(() => {
    return PILLARS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px' 
      }}>
        {filteredPillars.map(p => {
          const isRunning = statuses[p.id];
          const isLoading = loading[p.id];

          return (
            <div key={p.id} className="fade-in" style={{
              backgroundColor: isRunning ? 'rgba(20,0,0,0.1)' : 'rgba(5,5,5,0.4)',
              border: isRunning ? '1px solid var(--accent)' : '1px solid var(--border)',
              padding: '25px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              minHeight: '170px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isRunning ? 'var(--accent)' : 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => navigate(`/pillar/${p.slug}`)}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ color: isRunning ? 'var(--accent)' : 'var(--text-dim)', fontSize: '9px', fontWeight: 900 }}>P_{p.id.toString().padStart(2, '0')}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePillar(null, p.id, !!isRunning); }}
                    disabled={isLoading}
                    style={{ background: 'transparent', border: 'none', color: isLoading ? 'var(--text-dim)' : (isRunning ? '#00ff00' : 'var(--text-dim)'), cursor: 'pointer' }}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Power size={14} />}
                  </button>
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '5px', fontWeight: 800 }}>{p.name.toUpperCase()}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{p.desc}</p>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '9px', color: isRunning ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 700 }}>{isRunning ? 'ESTABLISHED' : 'STANDBY'}</div>
                <ChevronRight size={10} color="var(--accent)" opacity={0.3} />
              </div>
              <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', color: isRunning ? 'rgba(255,0,0,0.03)' : 'rgba(255,255,255,0.01)' }}>
                <p.icon size={100} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 'calc(100vh - 250px)' }}>
        <EventLog events={events} />
      </div>
    </div>
  );
};

const PillarDetail = ({ statuses, loading, togglePillar }: any) => {
  const { slug } = useParams();
  const pillar = PILLARS.find(p => p.slug === slug);
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string>('AWAITING_TELEMETRY...');
  const [stats, setStats] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!pillar) return;
    let interval: ReturnType<typeof setInterval>;
    
    const fetchDetails = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          fetch(`/api/pillars/${pillar.id}/logs`),
          fetch(`/api/pillars/${pillar.id}/stats`)
        ]);
        const logsData = await logsRes.json();
        const statsData = await statsRes.json();
        if (logsData.logs) setLogs(logsData.logs);
        if (statsData.stats) setStats(statsData.stats);
      } catch (e) {
        console.error("Failed to fetch pillar details", e);
      }
    };

    if (statuses[pillar.id]) {
      fetchDetails();
      interval = setInterval(fetchDetails, 3000);
    } else {
      setLogs('PILLAR_OFFLINE');
      setStats([]);
    }

    return () => clearInterval(interval);
  }, [slug, pillar, statuses]);

  if (!pillar) return <div>Pillar not found</div>;

  const isRunning = statuses[pillar.id];
  const isLoading = loading[pillar.id];

  return (
    <div className="fade-in">
      <button 
        onClick={() => navigate('/')}
        style={{ background: 'transparent', border: 'none', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
      >
        <ArrowLeft size={16} /> RETURN_TO_MATRIX
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent)' }}>
            <pillar.icon size={30} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: '32px', color: 'var(--text-main)', fontWeight: 900 }}>{pillar.name.toUpperCase()}</h2>
            <div style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{pillar.desc}</div>
          </div>
        </div>
        <button onClick={(e) => togglePillar(e, pillar.id, !!isRunning)} disabled={isLoading} style={{ backgroundColor: isRunning ? 'transparent' : 'var(--accent)', border: isRunning ? '1px solid #ff0000' : 'none', color: isRunning ? '#ff0000' : '#000', padding: '12px 30px', fontSize: '12px', fontWeight: 800, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Power size={16} />}
          {isRunning ? 'SHUTDOWN_BACKEND' : 'IGNITE_PILLAR'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(5,5,5,0.7)', border: '1px solid var(--border)', padding: '30px', backdropFilter: 'blur(10px)' }}>
            <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '20px' }}>[ TELEMETRY ]</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '15px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>PROCESS</div>
                <div style={{ color: isRunning ? '#00ff00' : '#ff0000', fontSize: '14px', fontWeight: 700 }}>{isRunning ? 'ACTIVE' : 'IDLE'}</div>
              </div>
              <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '15px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>ID</div>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', fontFamily: 'monospace' }}>{pillar.slug.toUpperCase()}</div>
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(5,5,5,0.7)', border: '1px solid var(--border)', padding: '25px', flex: 1, backdropFilter: 'blur(10px)' }}>
             <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '15px' }}>[ RESOURCES ]</div>
             <div style={{ color: 'var(--text-main)', fontSize: '11px', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                {stats.length > 0 ? stats.map((s, i) => <div key={i} style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '4px', marginBottom: '4px' }}>{s}</div>) : 'OFFLINE'}
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#000', border: '1px solid var(--border)', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px' }}>[ LIVE_LOGS ]</div>
                {isRunning && (
                  <button onClick={() => window.open(pillar.url, '_blank')} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '4px 10px', fontSize: '10px', fontWeight: 900, borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    OPEN_UI <ExternalLink size={10} />
                  </button>
                )}
             </div>
             <div ref={scrollRef} style={{ color: '#00ff00', fontSize: '11px', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', height: '400px', overflowY: 'auto', opacity: 0.8 }} className="terminal-scroll">
                {logs}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardContainer = () => {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [sysInfo, setSysInfo] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, sysRes, eventsRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/sysinfo'),
        fetch('/api/events')
      ]);
      setStatuses(await statusRes.json());
      setSysInfo(await sysRes.json());
      setEvents(await eventsRes.json());
    } catch (e) {
      console.error("Global fetch failed", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const togglePillar = async (e: any, id: number, currentStatus: boolean) => {
    if (e) e.stopPropagation();
    const action = currentStatus ? 'down' : 'up';
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/pillars/${id}/${action}`, { method: 'POST' });
      fetchData();
    } catch (e) {
      console.error("Toggle failed", e);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const runningCount = Object.values(statuses).filter(Boolean).length;
  const integrity = runningCount === 12 ? 'MAXIMUM' : runningCount > 6 ? 'STABLE' : runningCount > 0 ? 'DEGRADED' : 'OFFLINE';
  const integrityColor = runningCount === 12 ? '#00ffff' : runningCount > 6 ? '#00ff00' : runningCount > 0 ? '#ffaa00' : '#ff0000';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar sysInfo={sysInfo} />
      <div className="scanline"></div>
      <main style={{ marginLeft: '280px', padding: '40px', width: 'calc(100% - 280px)', minHeight: '100vh' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '25px' }}>
          <div>
            <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '4px', marginBottom: '8px' }}>CORE_V5.2_TITAN</div>
            <h2 style={{ fontSize: '36px', color: 'var(--text-main)', fontWeight: 900, letterSpacing: '-1.5px' }}>COMMAND_MATRIX</h2>
            <div style={{ display: 'flex', gap: '25px', marginTop: '15px' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={12} color={integrityColor} /> INTEGRITY: <span style={{color: integrityColor}}>{integrity}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={12} color="var(--accent)" /> LOAD: <span style={{color: 'var(--text-main)'}}>{sysInfo?.cpu || '0%'}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={12} color="var(--accent)" /> RAM: <span style={{color: 'var(--text-main)'}}>{sysInfo?.ram || '0%'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
             <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px', width: '280px' }}>
                <Search size={14} color="var(--text-dim)" />
                <input ref={searchRef} type="text" placeholder="PRESS_/_TO_SEARCH" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '100%', outline: 'none' }} />
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: 800 }}>SUPERUSER_ADMIN</div>
                <div style={{ color: 'var(--accent)', fontSize: '9px' }}>ENCRYPTED_SIGNAL_STABLE</div>
             </div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<MatrixGrid statuses={statuses} loading={loading} togglePillar={togglePillar} searchQuery={searchQuery} events={events} />} />
          <Route path="/pillar/:slug" element={<PillarDetail statuses={statuses} loading={loading} togglePillar={togglePillar} />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <DashboardContainer />
    </BrowserRouter>
  );
}
