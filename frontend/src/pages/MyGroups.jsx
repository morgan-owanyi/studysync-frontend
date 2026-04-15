import { useState, useEffect } from 'react';
import api from '../utils/api';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import { useNavigate } from 'react-router-dom';

export default function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const fetchGroups = () => {
    api.get('/groups/my').then(r => setGroups(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(fetchGroups, []);

  return (
    <>
      <div className="flex items-center justify-between mb-24">
        <p className="text-muted">Groups you have created or joined</p>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Group
        </button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👥</div>
          <h3>No groups yet</h3>
          <p>Join or create a study group to get started with collaborative learning</p>
          <button className="btn btn-primary" onClick={() => navigate('/browse')}>Browse Groups</button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(g => <GroupCard key={g._id} group={g} />)}
        </div>
      )}

      <CreateGroupModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchGroups} />
    </>
  );
}
