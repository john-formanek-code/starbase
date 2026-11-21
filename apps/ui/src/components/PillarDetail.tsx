import { useState, useEffect, useRef, useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Power, Terminal as TerminalIcon, FileCode, Layers, Settings2 } from 'lucide-react';
import { PILLARS, type PillarPlugin, type PillarStatus } from '../constants';

interface PillarDetailProps {
  statuses: Record<string, PillarStatus>;
  loading: Record<string, boolean>;
  togglePillar: (e: ReactMouseEvent | null, id: number, currentStatus: boolean) => Promise<void>;
}

const PillarDetail = ({ statuses, loading, togglePillar }: PillarDetailProps) => {
  const { slug } = useParams();
  const pillar = PILLARS.find(p => p.slug === slug);
  const navigate = useNavigate();
  
  const [logs, setLogs] = useState<string>('AWAITING_TELEMETRY...');
  const [stats, setStats] = useState<string[]>([]);
  const [plugin, setPlugin] = useState<PillarPlugin | null>(null);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'BLUEPRINT'>('CONSOLE');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  useEffect(() => {
    if (!pillar) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    
    const fetchDetails = async () => {
      try {
        const pluginRes = await fetch(`/api/pillars/${pillar.id}/plugin`);
        const pluginData = await pluginRes.json() as PillarPlugin;
        if (pluginData) setPlugin(pluginData);

        if (!statuses[pillar.id]?.running) {
          setLogs('PILLAR_OFFLINE');
          setStats([]);
          return;
        }

        const [logsRes, statsRes] = await Promise.all([
          fetch(`/api/pillars/${pillar.id}/logs`),
          fetch(`/api/pillars/${pillar.id}/stats`),
        ]);
        const logsData = await logsRes.json() as { logs?: string };
        const statsData = await statsRes.json() as { stats?: string[] };

        if (logsData.logs) setLogs(logsData.logs);
        if (statsData.stats) setStats(statsData.stats);
      } catch (e) {
        console.error("Failed to fetch pillar details", e);
      }
    };

    fetchDetails();
    if (statuses[pillar.id]?.running) {
      interval = setInterval(fetchDetails, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [slug, pillar, statuses]);

  const runCommand = async (command: string) => {
    if (!pillar) return;
    setActionLoading(true);
    try {
        await fetch(`/api/pillars/${pillar.id}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
    } catch (e) {
        console.error("Command execution failed", e);
    } finally {
        setActionLoading(false);
    }
  };

  const highlightedLogs = useMemo(() => {
    return logs.split('\n').map((line, i) => {
      const isError = /error|fatal|fail|critical/i.test(line);
      const isWarn = /warn|warning/i.test(line);
      if (logFilter === 'ERRORS' && !isError) return null;
      if (logFilter === 'WARNINGS' && !isWarn && !isError) return null;
      return (
        <div key={i} style={{ color: isError ? '#ff0000' : isWarn ? '#ffaa00' : '#00ff00', background: isError ? 'rgba(255,0,0,0.1)' : 'transparent', padding: isError ? '2px 5px' : '0' }}>
          {line}
        </div>
      );
    }).filter(Boolean);
  }, [logs, logFilter]);

  if (!pillar) return <div>Pillar not found</div>;

  const state = statuses[pillar.id] || { running: false, healthy: false };
  const isLoading = loading[pillar.id];

  return (
    <div className="fade-in">
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
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
        <button onClick={(e) => togglePillar(e, pillar.id, !!state.running)} disabled={isLoading} style={{ backgroundColor: state.running ? 'transparent' : 'var(--accent)', border: state.running ? `1px solid ${state.healthy ? '#ff0000' : '#ffaa00'}` : 'none', color: state.running ? '#ff0000' : '#000', padding: '12px 30px', fontSize: '12px', fontWeight: 800, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Power size={16} />}
          {state.running ? 'SHUTDOWN_ENGINE' : `IGNITE_${pillar.name.toUpperCase()}`}
        </button>
      </div>

      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(5,5,5,0.7)', border: '1px solid var(--border)', padding: '30px', backdropFilter: 'blur(10px)' }}>
            <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '20px' }}>[ TELEMETRY ]</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '15px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>LIVENESS</div>
                <div style={{ color: state.running ? (state.healthy ? '#00ff00' : '#ffaa00') : '#ff0000', fontSize: '14px', fontWeight: 700 }}>
                    {state.running ? (state.healthy ? 'HEALTHY' : 'BOOTING') : 'OFFLINE'}
                </div>
              </div>
              {(plugin?.widgets || []).map((widget) => (
                <div key={widget.label} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '15px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{widget.label}</div>
                  <div style={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: 700, whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(widget.value) ? widget.value.join('\n') : widget.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Center (Huge Utility) */}
          <div style={{ backgroundColor: 'rgba(255,0,0,0.02)', border: '1px solid var(--accent)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings2 size={14} /> COMMAND_MODULE
             </div>
             
             {!state.running ? (
                 <div style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>IGNITE_TO_ENABLE_ACTIONS</div>
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pillar.id === 1 && (
                        <button disabled={actionLoading} onClick={() => runCommand('prune')} style={{ background: '#000', border: '1px solid #ff0000', color: '#ff0000', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>[ EXECUTE_RESOURCE_PRUNE ]</button>
                    )}
                    {pillar.id === 2 && (
                        <>
                            <button disabled={actionLoading} onClick={() => runCommand('maint-on')} style={{ background: '#ff0000', border: 'none', color: '#000', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>ENGAGE_MAINTENANCE</button>
                            <button disabled={actionLoading} onClick={() => runCommand('maint-off')} style={{ background: '#000', border: '1px solid var(--text-dim)', color: 'var(--text-dim)', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>RELEASE_MAINTENANCE</button>
                        </>
                    )}
                    {pillar.id === 3 && (
                        <>
                            <button disabled={actionLoading} onClick={() => runCommand('disable')} style={{ background: '#ff0000', border: 'none', color: '#000', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>SUSPEND_DNS_BLOCKING</button>
                            <button disabled={actionLoading} onClick={() => runCommand('enable')} style={{ background: '#00ff00', border: 'none', color: '#000', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>RESTORE_FILTERING</button>
                        </>
                    )}
                    {pillar.id === 5 && (
                        <button disabled={actionLoading} onClick={() => runCommand('reload')} style={{ background: '#ff00ff', border: 'none', color: '#000', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>RELOAD_YAML_CORE</button>
                    )}
                    {pillar.id === 7 && (
                        <button disabled={actionLoading} onClick={() => runCommand('backup-now')} style={{ background: '#00ffff', border: 'none', color: '#000', padding: '10px', fontSize: '9px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>IGNITE_SNAPSHOT_NOW</button>
                    )}
                    {actionLoading && <div style={{ fontSize: '9px', color: 'var(--accent)', textAlign: 'center' }}>[ EXECUTING_REMOTE_CMD... ]</div>}
                </div>
             )}
          </div>

          {/* Resource HUD Restoration */}
          <div style={{ backgroundColor: 'rgba(5,5,5,0.7)', border: '1px solid var(--border)', padding: '25px', flex: 1, backdropFilter: 'blur(10px)' }}>
             <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '15px' }}>[ RESOURCE_HUD ]</div>
             <div style={{ color: 'var(--text-main)', fontSize: '11px', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                {stats.length > 0 ? stats.map((s, i) => (
                    <div key={i} style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '6px', marginBottom: '6px' }}>{s}</div>
                )) : 'AWAITING_IGNITION...'}
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid var(--border)', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('CONSOLE')} style={{ background: 'transparent', border: 'none', borderBottom: activeTab === 'CONSOLE' ? '2px solid var(--accent)' : 'none', color: activeTab === 'CONSOLE' ? 'var(--text-main)' : 'var(--text-dim)', padding: '15px 25px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={14} /> MODULE_CONSOLE
                </button>
                <button onClick={() => setActiveTab('BLUEPRINT')} style={{ background: 'transparent', border: 'none', borderBottom: activeTab === 'BLUEPRINT' ? '2px solid var(--accent)' : 'none', color: activeTab === 'BLUEPRINT' ? 'var(--text-main)' : 'var(--text-dim)', padding: '15px 25px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={14} /> IaC_BLUEPRINT
                </button>
             </div>

             <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'CONSOLE' ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TerminalIcon size={14} /> [ LOG_HUNTER_TERMINAL ]
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {state.healthy && (
                                    <button onClick={() => window.open(pillar.url, '_blank')} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '4px 10px', fontSize: '9px', fontWeight: 900, borderRadius: '2px', marginRight: '15px' }}>LAUNCH_UI</button>
                                )}
                                {['ALL', 'WARNINGS', 'ERRORS'].map(f => (
                                    <button key={f} onClick={() => setLogFilter(f)} style={{ background: logFilter === f ? 'var(--accent)' : 'transparent', color: logFilter === f ? '#000' : 'var(--text-dim)', border: `1px solid ${logFilter === f ? 'var(--accent)' : 'var(--border)'}`, fontSize: '8px', padding: '2px 8px', borderRadius: '2px', fontWeight: 800 }}>{f}</button>
                                ))}
                            </div>
                        </div>
                        <div ref={scrollRef} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', height: '450px', overflowY: 'auto', backgroundColor: '#000', padding: '15px', border: '1px solid #111' }} className="terminal-scroll">
                            {highlightedLogs}
                        </div>
                    </>
                ) : (
                    <div style={{ backgroundColor: '#050505', padding: '25px', border: '1px solid #111', height: '500px', overflowY: 'auto' }} className="terminal-scroll">
                        <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '15px' }}>[ DOCKER_COMPOSE_SPEC ]</div>
                        <pre style={{ color: '#888', fontSize: '11px', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>{plugin?.blueprint || 'LOADING_SPECIFICATION...'}</pre>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarDetail;
