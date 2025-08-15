export default function VerificationPipeline() {
  const stages = [
    { name: 'Application Submitted', count: 45, color: 'blue' },
    { name: 'In Review', count: 31, color: 'orange' },
    { name: 'Approval Granted', count: 18, color: 'green' },
    { name: 'Registration Complete', count: 12, color: 'purple' },
    { name: 'Business Launched', count: 8, color: 'teal' }
  ]

  return (
    <div className="pipeline-container">
      <div className="pipeline-stages">
        {stages.map((stage, index) => (
          <div key={index} className="pipeline-stage">
            <div className={`stage-indicator ${stage.color}`}>
              <span className="stage-count">{stage.count}</span>
            </div>
            <div className="stage-info">
              <h4>{stage.name}</h4>
              <p>{stage.count} applications</p>
            </div>
            {index < stages.length - 1 && (
              <div className="stage-connector">
                <i className="fas fa-arrow-right"></i>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}