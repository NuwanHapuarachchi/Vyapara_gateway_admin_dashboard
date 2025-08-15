// components/Sidebar.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Sidebar({ isOpen }) {
  const router = useRouter()
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  // Auto‑open the Users submenu when you're on /users/*
  useEffect(() => {
    if (router.pathname.startsWith('/users')) setActiveSubmenu('Users')
  }, [router.pathname])

  const menuItems = [
    { name: 'Dashboard', icon: 'fas fa-chart-bar', path: '/dashboard' },
    { name: 'Applications', icon: 'fas fa-file-alt', path: '/applications', badge: '24' },
    {
      name: 'Users',
      icon: 'fas fa-users',
      path: '/users',
      submenu: [
        { name: 'Pending Sign-ups', path: '/users/pending' },
        { name: 'All Users', path: '/users/all' },
      ],
    },
    { name: 'Reports', icon: 'fas fa-chart-line', path: '/reports' },
    { name: 'Settings', icon: 'fas fa-cog', path: '/settings' },
    { name: 'Help & Feedback', icon: 'fas fa-question-circle', path: '/help' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('auth')
    router.push('/')
  }

  // Utility: true if current route matches
  const isActive = (path) =>
    path === '/dashboard'
      ? router.pathname === '/dashboard'
      : router.pathname === path || router.pathname.startsWith(`${path}/`)

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon"><i className="fas fa-diagram-project" /></div>
          {isOpen && (
            <div className="logo-text">
              <h3>Vyāpāra Gateway</h3>
              <span>Admin Portal</span>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {menuItems.map((item) => (
          <div key={item.name} className="nav-item">
            {item.submenu ? (
              <>
                <button
                  className={`nav-link ${activeSubmenu === item.name ? 'active' : ''} ${isActive(item.path) ? 'current' : ''}`}
                  onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                  aria-expanded={activeSubmenu === item.name}
                  aria-controls={`submenu-${item.name}`}
                >
                  <i className={item.icon} />
                  {isOpen && <span>{item.name}</span>}
                  {isOpen && <i className="fas fa-chevron-down submenu-arrow" />}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </button>

                {isOpen && activeSubmenu === item.name && (
                  <div id={`submenu-${item.name}`} className="submenu">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={`submenu-link ${router.pathname === sub.path ? 'active' : ''}`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <i className={item.icon} />
                {isOpen && <span>{item.name}</span>}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar"><i className="fas fa-user-circle" /></div>
          {isOpen && (
            <div className="user-info">
              <h4>Admin User</h4>
              <p>Super Administrator</p>
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
