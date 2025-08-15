// pages/help/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function Help() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('resources')
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true'
    if (!authed) router.replace('/')
  }, [router])

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus('')

    try {
      // Get current user info (you might want to store this differently)
      const userEmail = localStorage.getItem('userEmail') || 'admin@vyapara.com'
      
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            type: feedbackForm.type,
            subject: feedbackForm.subject,
            message: feedbackForm.message,
            priority: feedbackForm.priority,
            submitted_by: userEmail,
            status: 'open',
            submitted_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      setSubmitStatus('success')
      setFeedbackForm({
        type: 'suggestion',
        subject: '',
        message: '',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Feedback submission error:', error)
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFeedbackForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const faqItems = [
    {
      category: 'Applications',
      items: [
        {
          question: 'How long does application review take?',
          answer: 'Most applications are reviewed within 3-5 business days. Complex applications may take up to 10 business days.'
        },
        {
          question: 'What documents are required for business registration?',
          answer: 'Required documents include: Business registration certificate, Tax identification number, Proof of address, and Identity verification documents.'
        },
        {
          question: 'How can I track my application status?',
          answer: 'You can track your application status in real-time through the Applications dashboard. You\'ll also receive email notifications for status updates.'
        }
      ]
    },
    {
      category: 'System',
      items: [
        {
          question: 'How do I reset my password?',
          answer: 'Click on the "Forgot Password" link on the login page and follow the instructions sent to your email.'
        },
        {
          question: 'What browsers are supported?',
          answer: 'Vyapara Gateway supports all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.'
        },
        {
          question: 'How do I export application data?',
          answer: 'Navigate to the Applications page and click the "Export CSV" button to download your data in spreadsheet format.'
        }
      ]
    },
    {
      category: 'Troubleshooting',
      items: [
        {
          question: 'Application submission failed',
          answer: 'If your application fails to submit, check your internet connection and ensure all required fields are completed. Contact support if the issue persists.'
        },
        {
          question: 'Cannot access certain features',
          answer: 'Some features may require specific permissions. Contact your system administrator to verify your access level.'
        },
        {
          question: 'Data not loading or displaying incorrectly',
          answer: 'Try refreshing the page or clearing your browser cache. If the problem continues, please submit a bug report.'
        }
      ]
    }
  ]

  const filteredFaq = faqItems.map(category => ({
    ...category,
    items: category.items.filter(item => 
      !searchQuery || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  const quickActions = [
    {
      title: 'Submit New Application',
      description: 'Start a new business registration application',
      icon: 'fa-plus-circle',
      color: 'blue',
      href: '/applications/new'
    },
    {
      title: 'View Application Status',
      description: 'Check the status of your submitted applications',
      icon: 'fa-search',
      color: 'green',
      href: '/applications'
    },
    {
      title: 'Download Reports',
      description: 'Generate and download system reports',
      icon: 'fa-download',
      color: 'purple',
      href: '/reports'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'fa-users-cog',
      color: 'orange',
      href: '/users'
    }
  ]

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>Help & Support Center</h1>
            <p>Find answers, get help, or share your feedback to improve Vyapara Gateway</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <i className="fas fa-book"></i>
            Resources & FAQ
          </button>
          <button 
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <i className="fas fa-comment-dots"></i>
            Feedback & Support
          </button>
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <i className="fas fa-phone"></i>
            Contact Information
          </button>
        </div>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="tab-content">
            {/* Quick Actions */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
                <p className="card-subtitle">Common tasks and shortcuts</p>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <Link href={action.href} key={index} className="quick-action-card">
                    <div className={`action-icon ${action.color}`}>
                      <i className={`fas ${action.icon}`}></i>
                    </div>
                    <div className="action-content">
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                    </div>
                    <i className="fas fa-chevron-right action-arrow"></i>
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Frequently Asked Questions</h3>
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="faq-content">
                {filteredFaq.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="faq-category">
                    <h4 className="category-title">
                      <i className="fas fa-folder-open"></i>
                      {category.category}
                    </h4>
                    <div className="faq-items">
                      {category.items.map((item, itemIndex) => (
                        <details key={itemIndex} className="faq-item">
                          <summary className="faq-question">
                            <i className="fas fa-question-circle"></i>
                            {item.question}
                            <i className="fas fa-chevron-down faq-toggle"></i>
                          </summary>
                          <div className="faq-answer">
                            <p>{item.answer}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredFaq.length === 0 && searchQuery && (
                  <div className="no-results">
                    <i className="fas fa-search"></i>
                    <h4>No results found</h4>
                    <p>Try different keywords or browse all categories above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation Links */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Documentation & Guides</h3>
              </div>
              <div className="resource-links">
                <div className="resource-item">
                  <div className="resource-icon">
                    <i className="fas fa-book-open"></i>
                  </div>
                  <div className="resource-content">
                    <h4>User Guide</h4>
                    <p>Complete guide to using Vyapara Gateway</p>
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>
                
                <div className="resource-item">
                  <div className="resource-icon">
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="resource-content">
                    <h4>API Documentation</h4>
                    <p>Integration guide and API references</p>
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>
                
                <div className="resource-item">
                  <div className="resource-icon">
                    <i className="fas fa-video"></i>
                  </div>
                  <div className="resource-content">
                    <h4>Video Tutorials</h4>
                    <p>Step-by-step video guides</p>
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="tab-content">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Submit Feedback or Report Issue</h3>
                <p className="card-subtitle">Help us improve Vyapara Gateway by sharing your thoughts</p>
              </div>
              
              {submitStatus === 'success' && (
                <div className="status-message success">
                  <i className="fas fa-check-circle"></i>
                  Thank you! Your feedback has been submitted successfully.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="status-message error">
                  <i className="fas fa-exclamation-circle"></i>
                  Sorry, there was an error submitting your feedback. Please try again.
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Feedback Type</label>
                    <select 
                      value={feedbackForm.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      required
                    >
                      <option value="suggestion">Suggestion</option>
                      <option value="bug_report">Bug Report</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="general_feedback">General Feedback</option>
                      <option value="support_request">Support Request</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Priority</label>
                    <select 
                      value={feedbackForm.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={feedbackForm.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of your feedback"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide detailed information about your feedback, including steps to reproduce any issues..."
                    rows="6"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* System Status */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>System Status</h3>
                <span className="status-badge healthy">
                  <i className="fas fa-circle"></i>
                  All Systems Operational
                </span>
              </div>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-indicator healthy"></div>
                  <div className="status-info">
                    <h4>Application Processing</h4>
                    <p>Normal operations</p>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-indicator healthy"></div>
                  <div className="status-info">
                    <h4>Database</h4>
                    <p>All services running</p>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-indicator healthy"></div>
                  <div className="status-info">
                    <h4>File Storage</h4>
                    <p>Upload/download available</p>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-indicator warning"></div>
                  <div className="status-info">
                    <h4>Email Notifications</h4>
                    <p>Slight delays possible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="tab-content">
            <div className="contact-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Technical Support</h3>
                </div>
                <div className="contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="contact-details">
                      <h4>Email Support</h4>
                      <p>support@vyapara.lk</p>
                      <span className="contact-hours">Response time: 4-6 hours</span>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="contact-details">
                      <h4>Phone Support</h4>
                      <p>+94 11 234 5678</p>
                      <span className="contact-hours">Mon-Fri, 9:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-comments"></i>
                    </div>
                    <div className="contact-details">
                      <h4>Live Chat</h4>
                      <p>Available during business hours</p>
                      <button className="btn btn-primary btn-sm">
                        <i className="fas fa-comment"></i>
                        Start Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Business Inquiries</h3>
                </div>
                <div className="contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="contact-details">
                      <h4>Business Development</h4>
                      <p>business@vyapara.lk</p>
                      <span className="contact-hours">Partnership opportunities</span>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-details">
                      <h4>Office Address</h4>
                      <p>123 Business District<br />Colombo 03, Sri Lanka</p>
                      <span className="contact-hours">Visitors by appointment</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Emergency Contact</h3>
                </div>
                <div className="emergency-contact">
                  <div className="emergency-info">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h4>System Emergencies</h4>
                    <p>For critical system outages or security issues</p>
                    <div className="emergency-details">
                      <strong>Emergency Hotline: +94 11 999 8888</strong>
                      <p>Available 24/7 for critical issues</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </Layout>
  )
}