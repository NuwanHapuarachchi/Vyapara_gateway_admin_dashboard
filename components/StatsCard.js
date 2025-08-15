import Link from 'next/link'

export default function StatsCard({ title, value, change, trend, icon, color, href }) {
  // If you pass an href, we render a <Link>; otherwise keep it as a <div>
  const CardTag = href ? Link : 'div'
  const cardProps = href ? { href, prefetch: false } : {}

  return (
    <CardTag {...cardProps} className={`stats-card ${color} ${href ? 'clickable' : ''}`} aria-label={href ? `Go to ${title}` : undefined}>
      <div className="stats-content">
        <div className="stats-header">
          <h3>{title}</h3>
          <div className={`stats-icon ${color}`}>
            <i className={icon}></i>
          </div>
        </div>
        <div className="stats-value">
          <span className="value">{value}</span>
          <div className={`stats-change ${trend}`}>
            <i className={trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
            {change}
          </div>
        </div>
      </div>
    </CardTag>
  )
}
