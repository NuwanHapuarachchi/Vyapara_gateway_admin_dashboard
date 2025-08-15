export default function StatusStepper({ currentStage }) {
  const stages = [
    'Application Submitted',
    'In Review',
    'Approval Granted',
    'Registration Complete',
    'Business Launched'
  ]

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage === currentStage)
  }

  const currentIndex = getCurrentStageIndex()

  return (
    <div className="status-stepper">
      {stages.map((stage, index) => (
        <div key={index} className={`stepper-step ${
          index < currentIndex ? 'completed' : 
          index === currentIndex ? 'active' : 
          'upcoming'
        }`}>
          <div className="step-indicator">
            <div className="step-number">
              {index < currentIndex ? (
                <i className="fas fa-check"></i>
              ) : (
                index + 1
              )}
            </div>
          </div>
          <div className="step-content">
            <h4>{stage}</h4>
            <p>
              {index < currentIndex ? 'Completed' : 
               index === currentIndex ? 'In Progress' : 
               'Pending'}
            </p>
          </div>
          {index < stages.length - 1 && (
            <div className={`step-connector ${index < currentIndex ? 'completed' : ''}`}></div>
          )}
        </div>
      ))}
    </div>
  )
}