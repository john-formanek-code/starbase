import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, Power, Trash2, RefreshCw, Database } from 'lucide-react';
import { PILLARS } from '../constants';
import EventLog from './EventLog';

interface MatrixGridProps {
  statuses: Record<string, {running: boolean, healthy: boolean}>;
  loading: Record<string, boolean>;
  togglePillar: (e: any, id: number, currentStatus: boolean) => Promise<void>;
  searchQuery: string;
  events: any[];
  executeMaintenance: (cmd: string) => Promise<void>;
}

const MatrixGrid: React.FC<MatrixGridProps> = ({ statuses, loading, togglePillar, searchQuery, events, executeMaintenance }) => {
  const navigate = useNavigate();
  
  const filteredPillars = useMemo(() => {
    return PILLARS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3.2fr 1.2fr', gap: '30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', gap: '15px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <button onClick={() => executeMaintenance('prune')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 15px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '2px' }}>
            <Trash2 size={12} /> PRUNE_SYSTEM
          </button>
          <button onClick={() => executeMaintenance('dns-flush')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 15px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '2px' }}>
            <RefreshCw size={12} /> FLUSH_DNS_CACHE
          </button>
          <button onClick={() => executeMaintenance('backup-config')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 15px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '2px' }}>
            <Database size={12} /> BACKUP_SNAPSHOT
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px' 
        }}>
          {filteredPillars.map(p => {
            const state = statuses[p.id] || { running: false, healthy: false };
            const isLoading = loading[p.id];

            return (
              <div key={p.id} className="fade-in" style={{
                backgroundColor: state.running ? 'rgba(20,0,0,0.1)' : 'rgba(5,5,5,0.4)',
                border: state.running ? `1px solid ${state.healthy ? 'var(--accent)' : '#ffaa00'}` : '1px solid var(--border)',
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
              onClick={() => navigate(`/pillar/${p.slug}`)}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ color: state.running ? (state.healthy ? 'var(--accent)' : '#ffaa00') : 'var(--text-dim)', fontSize: '9px', fontWeight: 900 }}>P_{p.id.toString().padStart(2, '0')}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePillar(null, p.id, !!state.running); }}
                      disabled={isLoading}
                      style={{ background: 'transparent', border: 'none', color: isLoading ? 'var(--text-dim)' : (state.running ? (state.healthy ? '#00ff00' : '#ffaa00') : 'var(--text-dim)'), cursor: 'pointer' }}
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Power size={14} />}
                    </button>
                  </div>
                  <h3 style={{ fontSize: '16px', marginBottom: '5px', fontWeight: 800 }}>{p.name.toUpperCase()}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{p.desc}</p>
                </div>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '9px', color: state.running ? (state.healthy ? 'var(--accent)' : '#ffaa00') : 'var(--text-dim)', fontWeight: 700 }}>
                    {state.running ? (state.healthy ? '[ HEALTHY_LIVENESS ]' : '[ ENGINE_BOOTING ]') : '[ STANDBY_IDLE ]'}
                  </div>
                  <ChevronRight size={10} color="var(--accent)" opacity={0.3} />
                </div>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', color: state.running ? (state.healthy ? 'rgba(255,0,0,0.03)' : 'rgba(255,170,0,0.03)') : 'rgba(255,255,255,0.01)' }}>
                  <p.icon size={100} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 250px)' }}>
        <EventLog events={events} />
      </div>
    </div>
  );
};

export default MatrixGrid;
