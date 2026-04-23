import React from 'react';
import { List } from 'lucide-react';

interface EventLogProps {
  events: any[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => (
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

export default EventLog;
