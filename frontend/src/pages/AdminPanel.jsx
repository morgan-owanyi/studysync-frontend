import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, groupsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/groups'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setGroups(groupsRes.data.data);
    } catch (e) {
      toast('Failed to load admin data.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast('User deleted.', 'success');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (e) {
      toast(e.response?.data?.message || 'Failed.', 'error');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const maxCount = stats?.activeCourses?.[0]?.count || 1;

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        {[
          ['Total Users', stats?.totalUsers, 'Registered accounts'],
          ['Study Groups', stats?.totalGroups, 'Active groups'],
          ['Study Sessions', stats?.totalSessions, 'Scheduled sessions'],
          ['Posts', stats?.totalPosts, 'Group messages'],
        ].map(([label, val, sub]) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{val ?? 0}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Users</span>
            <span className="badge badge-gray">{users.length} total</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{u.fname} {u.lname}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDeleteUser(u._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Groups Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Groups</span>
            <span className="badge badge-gray">{groups.length} total</span>
          </div>
          {groups.map(g => (
            <div key={g._id} className="member-row"
              onClick={() => navigate(`/groups/${g._id}`)}
              style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: 20 }}>{g.icon}</div>
              <div className="member-info">
                <div className="member-name">{g.name}</div>
                <div className="member-meta">{g.courseCode} · {g.members?.length ?? 0} members</div>
              </div>
              <span className="badge badge-gray">{g.faculty}</span>
            </div>
          ))}
          {groups.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 14 }}>
              No groups yet.
            </div>
          )}
        </div>
      </div>

      {/* Most Active Courses */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Most Active Courses</span>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>by membership count</span>
        </div>
        {stats?.activeCourses?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 14 }}>No data yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats?.activeCourses?.map(c => {
              const pct = Math.round((c.count / maxCount) * 100);
              return (
                <div key={c.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span><strong>{c.code}</strong> — {c.name}</span>
                    <span style={{ color: 'var(--text3)' }}>{c.count} members</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--surface3)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
