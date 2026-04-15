import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isMember = group.members?.some(m =>
    (typeof m === 'object' ? m._id : m) === user?._id
  );
  const isLeader = (typeof group.leader === 'object' ? group.leader._id : group.leader) === user?._id;
  const memberCount = group.members?.length ?? group.memberCount ?? 0;

  return (
    <div className="group-card" onClick={() => navigate(`/groups/${group._id}`)}>
      <div className="group-card-header">
        <div>
          <div className={`group-card-icon ${group.colorClass || 'color-1'}`}>{group.icon || '📚'}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="group-card-title">{group.name}</div>
          <div className="group-card-course">{group.courseCode} · {group.faculty}</div>
        </div>
        {isLeader && <span className="badge badge-accent">Leader</span>}
      </div>

      <div className="group-card-desc">
        {group.description.length > 120
          ? group.description.substring(0, 120) + '...'
          : group.description}
      </div>

      <div className="group-card-footer">
        <div className="member-count">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          </svg>
          {memberCount} members
        </div>
        <span className={`badge ${isMember || isLeader ? 'badge-success' : 'badge-gray'}`}>
          {isMember || isLeader ? '✓ Joined' : 'Join'}
        </span>
      </div>
    </div>
  );
}
