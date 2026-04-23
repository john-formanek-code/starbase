import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { 
  Activity,
  Zap,
  Search,
  AlertTriangle,
  Flame
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import MatrixGrid from './components/MatrixGrid';
import PillarDetail from './components/PillarDetail';

const DashboardContainer = () => {
  const [statuses, setStatuses] = useState<Record<string, {running: boolean, healthy: boolean}>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [sysInfo, setSysInfo] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<string | null>(null);
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
    setAlert(null);

    try {
      const res = await fetch(`/api/pillars/${id}/${action}`, { method: 'POST' });
      if (res.status === 403) {
        const error = await res.json();
        setAlert(error.error);
      }
      fetchData();
    } catch (e) {
      console.error("Toggle failed", e);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const executeMaintenance = async (command: string) => {
    try {
      await fetch('/api/system/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      fetchData();
    } catch (e) {
      console.error("Maintenance failed", e);
    }
  };

  const runningCount = Object.values(statuses).filter(s => s.running).length;
  const integrity = runningCount === 12 ? 'MAXIMUM' : runningCount > 6 ? 'STABLE' : runningCount > 0 ? 'DEGRADED' : 'OFFLINE';
  const integrityColor = runningCount === 12 ? '#00ffff' : runningCount > 6 ? '#00ff00' : runningCount > 0 ? '#ffaa00' : '#ff0000';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar sysInfo={sysInfo} />
      <div className="scanline"></div>
      
      {alert && (
        <div className="fade-in" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100, backgroundColor: 'rgba(255,0,0,0.9)', color: '#fff', padding: '15px 30px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #ffaa00', boxShadow: '0 0 30px rgba(255,0,0,0.5)' }}>
           <AlertTriangle size={20} />
           <div>
              <div style={{ fontSize: '10px', fontWeight: 900 }}>RESOURCE_GUARD_ALERT</div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{alert}</div>
           </div>
           <button onClick={() => setAlert(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 900 }}>X</button>
        </div>
      )}

      <main style={{ marginLeft: '280px', padding: '40px', width: 'calc(100% - 280px)', minHeight: '100vh' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '25px' }}>
          <div>
            <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '4px', marginBottom: '8px' }}>CORE_V7.0_INTELLIGENCE</div>
            <h2 style={{ fontSize: '36px', color: 'var(--text-main)', fontWeight: 900, letterSpacing: '-1.5px' }}>COMMAND_MATRIX</h2>
            <div style={{ display: 'flex', gap: '25px', marginTop: '15px' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={12} color={integrityColor} /> INTEGRITY: <span style={{color: integrityColor}}>{integrity}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={12} color="var(--accent)" /> LOAD: <span style={{color: 'var(--text-main)'}}>{sysInfo?.cpu || '0%'}</span>
              </div>
              {sysInfo?.hog && sysInfo.hog !== "NONE" && (
                <div style={{ color: '#ffaa00', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,170,0,0.1)', padding: '2px 8px', borderRadius: '2px' }}>
                  <Flame size={12} /> HOG: <span style={{fontWeight: 700}}>{sysInfo.hog.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
             <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px', width: '280px' }}>
                <Search size={14} color="var(--text-dim)" />
                <input ref={searchRef} type="text" placeholder="PRESS_/_TO_SEARCH" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '100%', outline: 'none' }} />
             </div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<MatrixGrid statuses={statuses} loading={loading} togglePillar={togglePillar} searchQuery={searchQuery} events={events} executeMaintenance={executeMaintenance} />} />
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
