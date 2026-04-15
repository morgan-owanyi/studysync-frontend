import { useState } from 'react';
import Modal from './Modal';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const FACULTIES = ['Engineering & Tech', 'Business', 'Education', 'Health Sciences', 'Arts & Social'];

export default function CreateGroupModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', courseCode: '', courseName: '', faculty: 'Engineering & Tech', description: '', location: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.courseCode || !form.courseName || !form.description) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.post('/groups', form);
      toast('Group created!', 'success');
      setForm({ name: '', courseCode: '', courseName: '', faculty: 'Engineering & Tech', description: '', location: '' });
      onClose();
      if (onCreated) onCreated(res.data.data);
      navigate(`/groups/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Study Group"
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </>
      }>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="form-group">
        <label className="form-label">Group Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. CSC1202 Tuesday Warriors" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Course Code *</label>
          <input className="form-input" value={form.courseCode} onChange={e => set('courseCode', e.target.value)} placeholder="e.g. CSC1202" />
        </div>
        <div className="form-group">
          <label className="form-label">Course Name *</label>
          <input className="form-input" value={form.courseName} onChange={e => set('courseName', e.target.value)} placeholder="e.g. Web Development" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Faculty</label>
        <select className="form-select" value={form.faculty} onChange={e => set('faculty', e.target.value)}>
          {FACULTIES.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Study Focus Description *</label>
        <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What will this group focus on?" />
      </div>
      <div className="form-group">
        <label className="form-label">Meeting Location</label>
        <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Library Room 3 / https://zoom.us/..." />
      </div>
    </Modal>
  );
}
