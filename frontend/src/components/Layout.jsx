import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initials = (u) => u ? `${u.fname[0]}${u.lname[0]}` : '??';

const IconGrid = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconShield = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconUser = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLogout = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const pageTitles = {
  '/': 'Dashboard',
  '/browse': 'Browse Groups',
  '/my-groups': 'My Groups',
  '/sessions': 'Study Sessions',
  '/profile': 'My Profile',
  '/admin': 'Admin Panel',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/groups/') ? 'Group Detail' : 'StudySync');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Study<span>Sync</span></h1>
          <p>UCU Study Group Finder</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Main</div>
            <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <IconGrid /> Dashboard
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <IconSearch /> Browse Groups
            </NavLink>
            <NavLink to="/my-groups" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <IconUsers /> My Groups
            </NavLink>
            <NavLink to="/sessions" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <IconCalendar /> Study Sessions
            </NavLink>
          </div>

          {user?.role === 'admin' && (
            <div className="nav-section">
              <div className="nav-label">Admin</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <IconShield /> Admin Panel
              </NavLink>
            </div>
          )}

          <div className="nav-section">
            <div className="nav-label">Account</div>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <IconUser /> My Profile
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="avatar" style={{ background: '#4f46e5', color: '#fff' }}>
            {initials(user)}
          </div>
          <div className="info">
            <div className="name">{user?.fname} {user?.lname}</div>
            <div className="role">{user?.role === 'admin' ? 'Administrator' : user?.program || 'Student'}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
            <IconLogout />
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
