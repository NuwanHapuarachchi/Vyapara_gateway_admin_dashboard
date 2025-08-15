export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'approval',
      user: 'Sarah Johnson',
      action: 'approved',
      target: 'Silva Traders application',
      time: '5 minutes ago',
      avatar: 'SJ'
    },
    {
      id: 2,
      type: 'document',
      user: 'Mike Chen',
      action: 'uploaded',
      target: 'Business Plan document',
      time: '12 minutes ago',
      avatar: 'MC'
    },
    {
      id: 3,
      type: 'message',
      user: 'System',
      action: 'sent',
      target: 'verification reminder to John Silva',
      time: '1 hour ago',
      avatar: 'SY'
    },
    {
      id: 4,
      type: 'rejection',
      user: 'Sarah Johnson',
      action: 'rejected',
      target: 'Fernando & Co application',
      time: '2 hours ago',
      avatar: 'SJ'
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'approval': return 'fas fa-check-circle'
      case 'document': return 'fas fa-file-upload'
      case 'message': return 'fas fa-envelope'
      case 'rejection': return 'fas fa-times-circle'
      default: return 'fas fa-info-circle'
    }
  }

  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <div className="activity-avatar">
            {activity.avatar}
          </div>
          <div className="activity-content">
            <p>
              <strong>{activity.user}</strong> {activity.action} {activity.target}
            </p>
            <span className="activity-time">{activity.time}</span>
          </div>
          <div className={`activity-icon ${activity.type}`}>
            <i className={getActivityIcon(activity.type)}></i>
          </div>
        </div>
      ))}
    </div>
  )
}