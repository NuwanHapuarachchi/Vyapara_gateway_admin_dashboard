import { useState } from 'react'

export default function Header({ onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    {
      id: 1,
      type: 'application',
      title: 'New Application Submitted',
      message: 'John Silva submitted a new business registration',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'approval',
      title: 'Document Approved',
      message: 'Business plan for Silva Traders has been approved',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'alert',
      title: 'SLA Alert',
      message: 'Application APP-2024-001 is overdue',
      time: '3 hours ago',
      unread: false
    }
  ]

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search applications, users..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          {/* Notifications */}
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              <span className="notification-count">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all read</button>
                </div>
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        <i className={
                          notification.type === 'application' ? 'fas fa-file-alt' :
                          notification.type === 'approval' ? 'fas fa-check-circle' :
                          'fas fa-exclamation-triangle'
                        }></i>
                      </div>
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notification-footer">
                  <a href="#all-notifications">View all notifications</a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <button className="quick-action-btn">
            <i className="fas fa-plus"></i>
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}