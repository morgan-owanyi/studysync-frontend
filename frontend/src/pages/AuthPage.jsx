import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PROGRAMS = [
  'BSc Information Technology', 'BSc Computer Science', 'BSc Software Engineering',
  'BSc Business Computing', 'BSc Electrical Engineering', 'BA Education', 'BSc Nursing',
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ fname: '', lname: '', email: '', password: '', role: 'student', program: '', year: '' });

  const setL = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));
  const setR = (k, v) => setRegForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regForm.fname || !regForm.lname || !regForm.email || !regForm.password || !regForm.program || !regForm.year) {
      setError('Please fill in all fields.'); return;
    }
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(regForm);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Study<span style={{ color: '#4f46e5' }}>Sync</span></h1>
          <p>Uganda Christian University — Study Group Finder</p>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</div>
          <div className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</div>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={loginForm.email} onChange={e => setL('email', e.target.value)} placeholder="you@ucu.ac.ug" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={loginForm.password} onChange={e => setL('password', e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" value={regForm.fname} onChange={e => setR('fname', e.target.value)} placeholder="John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={regForm.lname} onChange={e => setR('lname', e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={regForm.email} onChange={e => setR('email', e.target.value)} placeholder="you@ucu.ac.ug" />
            </div>
            <div className="form-group">
              <label className="form-label">Program of Study</label>
              <select className="form-select" value={regForm.program} onChange={e => setR('program', e.target.value)}>
                <option value="">Select Program</option>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <select className="form-select" value={regForm.year} onChange={e => setR('year', e.target.value)}>
                  <option value="">Year</option>
                  {['Year 1','Year 2','Year 3','Year 4'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={regForm.role} onChange={e => setR('role', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={regForm.password} onChange={e => setR('password', e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
