import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Globe, Clock, Lightbulb, Flame } from 'lucide-react';
import { PILLARS, type SysInfo } from '../constants';

interface SidebarProps {
  sysInfo: SysInfo | null;
}

const Sidebar = ({ sysInfo }: SidebarProps) => {
  const ramUsage = parseInt(sysInfo?.ram || '0');
  const cpuUsage = parseInt(sysInfo?.cpu || '0');

  const recommendation = useMemo(() => {
    if (ramUsage > 85) return { text: 'CRITICAL: FLUSH_IDLE_SYSTEMS', type: 'error' };
    if (cpuUsage > 70) return { text: 'WARNING: RESOURCE_SATURATION', type: 'warning' };
    return { text: 'STABLE: OPTIMIZED_LATENCY', type: 'success' };
  }, [ramUsage, cpuUsage]);

  return (
    <aside className="sidebar" style={{
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
      <div style={{ marginBottom: '40px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="glitch-text" style={{ fontSize: '24px', color: 'var(--accent)', marginBottom: '8px' }}>
            STARBASE // OS
          </h1>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '2px' }}>v7.0.0 // INTELLIGENCE</div>
        </Link>
      </div>
      
      <nav style={{ flex: 1, overflowY: 'auto' }} className="terminal-scroll">
        <div style={{ color: 'var(--accent)', fontSize: '10px', marginBottom: '15px', opacity: 0.6, fontWeight: 700, letterSpacing: '2px' }}>MODULE_INDEX</div>
        {PILLARS.map(p => (
          <Link key={p.id} to={`/pillar/${p.slug}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 12px', 
            color: 'var(--text-dim)',
            fontSize: '11px',
            cursor: 'pointer',
            borderRadius: '4px',
            marginBottom: '2px',
            transition: 'all 0.2s ease',
            textDecoration: 'none'
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
              <p.icon size={13} />
              {p.name.toUpperCase()}
            </div>
            <ChevronRight size={10} opacity={0.3} />
          </Link>
        ))}
      </nav>

      {sysInfo?.hog && sysInfo.hog !== "NONE" && (
         <div style={{ padding: '12px', backgroundColor: 'rgba(255,170,0,0.1)', border: '1px solid #ffaa00', borderRadius: '4px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#ffaa00', fontWeight: 800, marginBottom: '5px' }}>
                <Flame size={12} /> RESOURCE_HOG_ALERT
            </div>
            <div style={{ fontSize: '10px', color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>
                {sysInfo.hog.split(':')[0]}
            </div>
         </div>
      )}

      <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: 'var(--accent)', fontWeight: 800, marginBottom: '8px' }}>
          <Lightbulb size={12} /> ENGINE_ADVISOR
        </div>
        <div style={{ fontSize: '9px', color: recommendation.type === 'error' ? '#ff0000' : recommendation.type === 'warning' ? '#ffaa00' : '#00ff00', fontWeight: 700 }}>
          [ {recommendation.text} ]
        </div>
      </div>

      <div style={{ paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
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
};

export default Sidebar;
