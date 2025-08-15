import { useState } from 'react'

export default function SecureMessages({ applicationId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'System',
      message: 'Application submitted successfully. Review process has begun.',
      timestamp: '2024-08-10T10:00:00Z',
      type: 'system',
      visibleToApplicant: true
    },
    {
      id: 2,
      sender: 'Sarah Johnson',
      message: 'We need a clearer copy of your NIC. The current image is too blurry.',
      timestamp: '2024-08-11T14:30:00Z',
      type: 'admin',
      visibleToApplicant: true
    },
    {
      id: 3,
      sender: 'John Silva',
      message: 'I have uploaded a new NIC copy. Please review.',
      timestamp: '2024-08-12T09:15:00Z',
      type: 'user',
      visibleToApplicant: true
    }
  ])

  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('to-applicant')

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'Admin User',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'admin',
        visibleToApplicant: messageType === 'to-applicant'
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const cannedResponses = [
    'Please upload a clearer copy of your document.',
    'Your application is being reviewed. We will contact you shortly.',
    'Additional documentation is required. Please check your email.',
    'Your application has been approved. Next steps will be sent via email.'
  ]

  return (
    <div className="messages-panel">
      <div className="messages-header">
        <h3>Secure Messages</h3>
        <div className="message-filter">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">To Applicant</button>
          <button className="filter-btn">Internal</button>
        </div>
      </div>

      <div className="messages-thread">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-header">
              <div className="sender-info">
                <strong>{message.sender}</strong>
                {!message.visibleToApplicant && (
                  <span className="internal-badge">Internal</span>
                )}
              </div>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="message-content">
              {message.message}
            </div>
          </div>
        ))}
      </div>

      <div className="message-composer">
        <div className="composer-header">
          <div className="message-type-selector">
            <label>
              <input
                type="radio"
                name="messageType"
                value="to-applicant"
                checked={messageType === 'to-applicant'}
                onChange={(e) => setMessageType(e.target.value)}
              />
              <span>Visible to Applicant</span>
            </label>
            <label>
              <input
                type="radio"
                name="messageType"
                value="internal"
                checked={messageType === 'internal'}
                onChange={(e) => setMessageType(e.target.value)}
              />
              <span>Internal Note</span>
            </label>
          </div>
        </div>

        <div className="composer-body">
          <div className="canned-responses">
            <select onChange={(e) => setNewMessage(e.target.value)}>
              <option value="">Quick Responses</option>
              {cannedResponses.map((response, index) => (
                <option key={index} value={response}>{response}</option>
              ))}
            </select>
          </div>

          <div className="message-input-container">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={messageType === 'to-applicant' 
                ? "Type a message to the applicant... (Visible to applicant)"
                : "Add an internal note... (Internal only)"
              }
              rows="3"
            />
            <div className="composer-actions">
              <button className="attach-btn">
                <i className="fas fa-paperclip"></i>
              </button>
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <i className="fas fa-paper-plane"></i>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}