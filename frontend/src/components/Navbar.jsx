import { NavLink, Link } from 'react-router-dom';
import { usePlan } from '../PlanContext.jsx';

export default function Navbar() {
  const { items } = usePlan();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <img src="/logo.jpg" alt="Logo" style={{ height: '48px', width: '48px', borderRadius: '12px', objectFit: 'cover' }} />
          Local Tourist Day-Visit Planner
        </Link>
        <nav>
          <NavLink to="/" end>Browse</NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/plan">My Plan{items.length ? ` (${items.length})` : ''}</NavLink>
          <Link to="/admin" className="admin-link">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
