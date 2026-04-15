import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    fname: user?.fname || '',
    lname: user?.lname || '',
    program: user?.program || '',
    year: user?.year || '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/me', form);
      updateUser(res.data.data.user);
      toast('Profile updated!', 'success');
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to update profile.', 'error');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast('Password must be at least 6 characters.', 'error'); return;
    }
    setSavingPwd(true);
    try {
      await api.put('/auth/password', { newPassword });
      setNewPassword('');
      toast('Password changed successfully!', 'success');
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to change password.', 'error');
    } finally { setSavingPwd(false); }
  };

  const initials = user ? `${user.fname[0]}${user.lname[0]}` : '??';

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Profile Info Card */}
      <div className="card mb-24">
        <div className="card-header">
          <span className="card-title">Profile Information</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="avatar avatar-lg" style={{ background: '#4f46e5', color: '#fff', fontSize: 18 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{user?.fname} {user?.lname}</div>
            <div style={{ color: 'var(--text2)', fontSize: 14 }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-gray'}`} style={{ marginTop: 4 }}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" value={form.fname} onChange={e => set('fname', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" value={form.lname} onChange={e => set('lname', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" value={user?.email || ''} disabled
            style={{ background: 'var(--surface3)', cursor: 'not-allowed' }} />
          <div className="form-error" style={{ color: 'var(--text3)', marginTop: 4 }}>Email cannot be changed.</div>
        </div>

        <div className="form-group">
          <label className="form-label">Program of Study</label>
          <input className="form-input" value={form.program} onChange={e => set('program', e.target.value)} placeholder="e.g. BSc Information Technology" />
        </div>

        <div className="form-group">
          <label className="form-label">Year of Study</label>
          <select className="form-select" value={form.year} onChange={e => set('year', e.target.value)}>
            <option value="">Select Year</option>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Change Password</span>
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleChangePassword} disabled={savingPwd}>
          {savingPwd ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}
