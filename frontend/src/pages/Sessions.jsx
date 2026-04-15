import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/sessions/my').then(r => setSessions(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <p className="text-muted mb-24">All upcoming study sessions from your groups</p>
      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <h3>No upcoming sessions</h3>
          <p>Join more groups to see scheduled study sessions here</p>
        </div>
      ) : sessions.map(s => {
        const d = new Date(s.date);
        return (
          <div key={s._id} className="session-card"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/groups/${typeof s.group === 'object' ? s.group._id : s.group}`)}>
            <div className="session-date">
              <div className="day">{d.getDate()}</div>
              <div className="month">{d.toLocaleString('default', { month: 'short' })}</div>
            </div>
            <div className="session-info" style={{ flex: 1 }}>
              <div className="session-title">{s.title}</div>
              <div className="session-meta">{s.time} · {s.location}</div>
              {s.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{s.description}</div>}
            </div>
            {s.group && typeof s.group === 'object' && (
              <span className="badge badge-accent">{s.group.name}</span>
            )}
          </div>
        );
      })}
    </>
  );
}
