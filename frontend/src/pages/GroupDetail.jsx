import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [group, setGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');
  const [joining, setJoining] = useState(false);

  // Modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Forms
  const [sessionForm, setSessionForm] = useState({ title: '', date: '', time: '', location: '', description: '' });
  const [postContent, setPostContent] = useState('');
  const [editForm, setEditForm] = useState({ name: '', description: '', location: '' });
  const [saving, setSaving] = useState(false);

  const fetchGroup = async () => {
    try {
      const [gRes, sRes, pRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/sessions`),
        api.get(`/groups/${id}/posts`),
      ]);
      setGroup(gRes.data.data);
      setSessions(sRes.data.data);
      setPosts(pRes.data.data);
    } catch { navigate('/browse'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGroup(); }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!group) return null;

  const leaderId = typeof group.leader === 'object' ? group.leader._id : group.leader;
  const isLeader = leaderId === user?._id;
  const isMember = group.members?.some(m => (typeof m === 'object' ? m._id : m) === user?._id);

  const handleJoin = async () => {
    setJoining(true);
    try { await api.post(`/groups/${id}/join`); toast('Joined group!', 'success'); fetchGroup(); }
    catch (e) { toast(e.response?.data?.message || 'Failed to join.', 'error'); }
    finally { setJoining(false); }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this group?')) return;
    try { await api.delete(`/groups/${id}/leave`); toast('Left group.', 'success'); fetchGroup(); }
    catch (e) { toast(e.response?.data?.message || 'Failed to leave.', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this group permanently? This cannot be undone.')) return;
    try { await api.delete(`/groups/${id}`); toast('Group deleted.', 'success'); navigate('/my-groups'); }
    catch (e) { toast(e.response?.data?.message || 'Failed to delete.', 'error'); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try { await api.delete(`/groups/${id}/members/${memberId}`); toast('Member removed.', 'success'); fetchGroup(); }
    catch (e) { toast(e.response?.data?.message || 'Failed to remove.', 'error'); }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.title || !sessionForm.date || !sessionForm.time || !sessionForm.location) {
      toast('Fill in all required fields.', 'error'); return;
    }
    setSaving(true);
    try {
      await api.post(`/groups/${id}/sessions`, sessionForm);
      toast('Session scheduled!', 'success');
      setSessionForm({ title: '', date: '', time: '', location: '', description: '' });
      setShowSessionModal(false);
      const res = await api.get(`/groups/${id}/sessions`);
      setSessions(res.data.data);
    } catch (e) { toast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) { toast('Write something first.', 'error'); return; }
    setSaving(true);
    try {
      await api.post(`/groups/${id}/posts`, { content: postContent });
      toast('Posted!', 'success');
      setPostContent('');
      setShowPostModal(false);
      const res = await api.get(`/groups/${id}/posts`);
      setPosts(res.data.data);
    } catch (e) { toast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/groups/${id}/posts/${postId}`);
      toast('Post deleted.', 'success');
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (e) { toast(e.response?.data?.message || 'Failed.', 'error'); }
  };

  const openEdit = () => {
    setEditForm({ name: group.name, description: group.description, location: group.location || '' });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/groups/${id}`, editForm);
      toast('Group updated!', 'success');
      setShowEditModal(false);
      fetchGroup();
    } catch (e) { toast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setSaving(false); }
  };

  const leader = typeof group.leader === 'object' ? group.leader : null;

  return (
    <>
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className={`detail-icon ${group.colorClass || 'color-1'}`}>{group.icon}</div>
        <div className="detail-info">
          <div className="detail-title">{group.name}</div>
          <div className="detail-course">{group.courseCode} · {group.courseName}</div>
          <div className="detail-actions">
            {!isMember && !isLeader && (
              <button className="btn btn-primary btn-sm" onClick={handleJoin} disabled={joining}>
                {joining ? 'Joining...' : 'Join Group'}
              </button>
            )}
            {isMember && !isLeader && (
              <button className="btn btn-ghost btn-sm" onClick={handleLeave}>Leave Group</button>
            )}
            {isLeader && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={openEdit}>Edit Group</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Group</button>
              </>
            )}
            <span className={`badge ${isLeader ? 'badge-accent' : isMember ? 'badge-success' : 'badge-gray'}`}>
              {isLeader ? 'You are leader' : isMember ? '✓ Member' : 'Not a member'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['about', 'members', 'sessions', 'posts'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* About */}
      {tab === 'about' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[['Course Code', group.courseCode], ['Members', group.members?.length], ['Faculty', group.faculty], ['Meeting Location', group.location || 'Not set']].map(([label, val]) => (
              <div key={label} className="card">
                <div className="stat-label">{label}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div className="card mb-16">
            <div className="card-title mb-8">About This Group</div>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{group.description}</p>
          </div>
          {leader && (
            <div className="card">
              <div className="card-title mb-8">Group Leader</div>
              <div className="member-row">
                <div className="avatar" style={{ background: '#4f46e5', color: '#fff' }}>{leader.fname[0]}{leader.lname[0]}</div>
                <div className="member-info">
                  <div className="member-name">{leader.fname} {leader.lname}</div>
                  <div className="member-meta">{leader.program} · {leader.year}</div>
                </div>
                <span className="badge badge-accent">Leader</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Members ({group.members?.length})</span>
          </div>
          {group.members?.map(m => {
            const memberId = typeof m === 'object' ? m._id : m;
            const memberObj = typeof m === 'object' ? m : null;
            return (
              <div key={memberId} className="member-row">
                <div className="avatar" style={{ background: memberId === leaderId ? '#4f46e5' : '#e2e8f0', color: memberId === leaderId ? '#fff' : '#475569' }}>
                  {memberObj ? `${memberObj.fname[0]}${memberObj.lname[0]}` : '??'}
                </div>
                <div className="member-info">
                  <div className="member-name">{memberObj ? `${memberObj.fname} ${memberObj.lname}` : 'Member'}</div>
                  <div className="member-meta">{memberObj?.program} {memberObj?.year ? `· ${memberObj.year}` : ''}</div>
                </div>
                {memberId === leaderId && <span className="badge badge-accent">Leader</span>}
                {isLeader && memberId !== user._id && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveMember(memberId)} style={{ marginLeft: 8 }}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sessions */}
      {tab === 'sessions' && (
        <>
          {isLeader && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSessionModal(true)}>+ Schedule Session</button>
            </div>
          )}
          {sessions.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><h3>No sessions yet</h3><p>{isLeader ? 'Schedule a study session for your group members.' : 'The group leader has not scheduled any sessions yet.'}</p></div>
          ) : sessions.map(s => {
            const d = new Date(s.date);
            return (
              <div key={s._id} className="session-card">
                <div className="session-date">
                  <div className="day">{d.getDate()}</div>
                  <div className="month">{d.toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div className="session-info">
                  <div className="session-title">{s.title}</div>
                  <div className="session-meta">{s.time} · {s.location}</div>
                  {s.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{s.description}</div>}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Posts */}
      {tab === 'posts' && (
        <>
          {(isMember || isLeader) && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPostModal(true)}>+ Post Message</button>
            </div>
          )}
          <div className="card">
            {posts.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}><p>No posts yet. Be the first to post!</p></div>
            ) : posts.map(p => {
              const author = typeof p.author === 'object' ? p.author : null;
              const t = new Date(p.createdAt);
              const isOwn = (typeof p.author === 'object' ? p.author._id : p.author) === user?._id;
              return (
                <div key={p._id} className="post">
                  <div className="post-header">
                    <div className="avatar avatar-sm" style={{ background: '#e2e8f0', color: '#475569' }}>
                      {author ? `${author.fname[0]}${author.lname[0]}` : '??'}
                    </div>
                    <span className="post-author">{author ? `${author.fname} ${author.lname}` : 'User'}</span>
                    <span className="post-time">{t.toLocaleDateString()} {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {(isOwn || user?.role === 'admin') && (
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--danger)', border: 'none' }} onClick={() => handleDeletePost(p._id)}>Delete</button>
                    )}
                  </div>
                  <div className="post-body">{p.content}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Schedule Session Modal */}
      <Modal open={showSessionModal} onClose={() => setShowSessionModal(false)} title="Schedule Study Session"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowSessionModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateSession} disabled={saving}>{saving ? 'Saving...' : 'Schedule Session'}</button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Session Title *</label>
          <input className="form-input" value={sessionForm.title} onChange={e => setSessionForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 4 Review" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={sessionForm.date} onChange={e => setSessionForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <input className="form-input" type="time" value={sessionForm.time} onChange={e => setSessionForm(f => ({ ...f, time: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Location / Meeting Link *</label>
          <input className="form-input" value={sessionForm.location} onChange={e => setSessionForm(f => ({ ...f, location: e.target.value }))} placeholder="Library Room 2 or https://zoom.us/..." />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={sessionForm.description} onChange={e => setSessionForm(f => ({ ...f, description: e.target.value }))} placeholder="What will be covered?" />
        </div>
      </Modal>

      {/* Post Modal */}
      <Modal open={showPostModal} onClose={() => setShowPostModal(false)} title="Post to Group"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowPostModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreatePost} disabled={saving}>{saving ? 'Posting...' : 'Post Message'}</button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Your Message</label>
          <textarea className="form-textarea" style={{ minHeight: 120 }} value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Share an announcement, ask a question, or coordinate a meeting..." />
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Group"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Group Name</label>
          <input className="form-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Meeting Location</label>
          <input className="form-input" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
        </div>
      </Modal>
    </>
  );
}
