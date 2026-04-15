import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';

const FACULTIES = ['', 'Engineering & Tech', 'Business', 'Education', 'Health Sciences', 'Arts & Social'];

export default function BrowseGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (faculty) params.faculty = faculty;
      const res = await api.get('/groups', { params });
      setGroups(res.data.data);
    } finally { setLoading(false); }
  }, [search, faculty]);

  useEffect(() => {
    const t = setTimeout(fetchGroups, 300);
    return () => clearTimeout(t);
  }, [fetchGroups]);

  return (
    <>
      <div className="flex items-center gap-16 mb-24 flex-wrap">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search by course, group name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 200 }} value={faculty} onChange={e => setFaculty(e.target.value)}>
          {FACULTIES.map(f => <option key={f} value={f}>{f || 'All Faculties'}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Group
        </button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>No groups found</h3>
          <p>Try different search terms or be the first to create a group for this course</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Group</button>
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
