import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [recentGroups, setRecentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/groups/my'),
      api.get('/sessions/my'),
      api.get('/groups?limit=3'),
    ]).then(([g, s, r]) => {
      setMyGroups(g.data.data);
      setSessions(s.data.data);
      setRecentGroups(r.data.data.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">My Groups</div>
          <div className="stat-value">{myGroups.length}</div>
          <div className="stat-sub">Study groups joined</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming Sessions</div>
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-sub">Scheduled sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available Groups</div>
          <div className="stat-value">{recentGroups.length}+</div>
          <div className="stat-sub">On the platform</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Groups</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-groups')}>View all</button>
          </div>
          {myGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 14 }}>
              No groups yet.{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/browse')}>Browse groups</span>
            </div>
          ) : myGroups.slice(0, 4).map(g => (
            <div key={g._id} className="member-row" onClick={() => navigate(`/groups/${g._id}`)} style={{ cursor: 'pointer' }}>
              <div className={`avatar-sm avatar ${g.colorClass || 'color-1'}`} style={{ width: 32, height: 32, fontSize: 16 }}>{g.icon}</div>
              <div className="member-info">
                <div className="member-name">{g.name}</div>
                <div className="member-meta">{g.courseCode}</div>
              </div>
              <span className="badge badge-gray">{g.members?.length || 0} members</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Sessions</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sessions')}>View all</button>
          </div>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 14 }}>No upcoming sessions.</div>
          ) : sessions.slice(0, 3).map(s => {
            const d = new Date(s.date);
            return (
              <div key={s._id} className="session-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/groups/${s.group._id}`)}>
                <div className="session-date">
                  <div className="day">{d.getDate()}</div>
                  <div className="month">{d.toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div className="session-info">
                  <div className="session-title">{s.title}</div>
                  <div className="session-meta">{s.time} · {s.location}</div>
                  <div className="session-meta" style={{ color: 'var(--accent)', fontSize: 11 }}>{s.group?.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recently Created Groups</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/browse')}>Browse all</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Create Group</button>
          </div>
        </div>
        <div className="groups-grid" style={{ marginTop: 4 }}>
          {recentGroups.map(g => <GroupCard key={g._id} group={g} />)}
        </div>
      </div>

      <CreateGroupModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
