import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/coach', label: 'AI Coach', icon: '🤖' },
  { to: '/workout', label: 'Workout', icon: '💪' },
  { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { to: '/habits', label: 'Habits', icon: '✅' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find((n) => location.pathname.startsWith(n.to))?.label || 'Fitness Buddy';

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="sidebar-logo">🏋️</div>
          <div>
            <div className="sidebar-title">Fitness Buddy</div>
            <div className="sidebar-subtitle">AI Fitness Coach</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              aria-current={location.pathname.startsWith(item.to) ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="disclaimer-text">
            ⚠️ Fitness Buddy provides general wellness info only. Not a replacement for a doctor, dietitian, or fitness professional.
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <span className="mobile-title">🏋️ {currentPage}</span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-bottom-icon" aria-hidden="true">{item.icon}</span>
            <span className="mobile-bottom-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content" id="main-content">
        <Outlet />
      </main>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          overflow-y: auto;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-logo {
          font-size: 1.75rem;
          line-height: 1;
        }

        .sidebar-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .sidebar-subtitle {
          font-size: 0.72rem;
          color: var(--primary-light);
          font-weight: 500;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition);
        }

        .nav-item:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .nav-item-active {
          background: rgba(99, 102, 241, 0.15) !important;
          color: var(--primary-light) !important;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
        }

        .disclaimer-text {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 200;
          background: var(--bg-sidebar);
          border-bottom: 1px solid var(--border);
        }

        .mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
        }

        .mobile-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mobile-menu {
          padding: 8px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-decoration: none;
          transition: all var(--transition);
        }

        .mobile-nav-item:hover { background: var(--bg-card); color: var(--text-primary); }

        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 200;
          background: var(--bg-sidebar);
          border-top: 1px solid var(--border);
          padding: 4px 0 calc(4px + env(safe-area-inset-bottom));
        }

        .mobile-bottom-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 4px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color var(--transition);
        }

        .mobile-bottom-item.active {
          color: var(--primary-light);
        }

        .mobile-bottom-icon { font-size: 1.2rem; }
        .mobile-bottom-label { font-size: 0.65rem; font-weight: 500; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-header { display: block; }
          .mobile-bottom-nav { display: flex; }
          .main-content { margin-top: 56px; }
        }
      `}</style>
    </div>
  );
}
