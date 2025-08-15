// pages/settings/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function Settings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'Vyapara Gateway',
    adminEmail: 'admin@vyapara.lk',
    timezone: 'Asia/Colombo',
    language: 'en',
    
    // Application Settings
    autoAssignment: true,
    slaHours: 72,
    requireDocuments: ['nic', 'business_plan', 'financial_statement'],
    allowedBusinessTypes: ['sole_proprietorship', 'partnership', 'limited_company', 'ngo'],
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    slackWebhook: '',
    
    // Security Settings
    sessionTimeout: 480, // minutes
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false
    },
    twoFactorAuth: false
  })

  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true'
    if (!authed) {
      router.replace('/')
      return
    }
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // In a real app, you'd load from Supabase settings table
      // For now, using localStorage as fallback
      const saved = localStorage.getItem('vyapara_settings')
      if (saved) {
        setSettings({ ...settings, ...JSON.parse(saved) })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    setErrors({})
    setSuccessMsg('')

    try {
      // Validation
      const newErrors = {}
      if (!settings.systemName.trim()) newErrors.systemName = 'System name is required'
      if (!settings.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required'
      if (settings.slaHours < 1) newErrors.slaHours = 'SLA hours must be at least 1'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setSaving(false)
        return
      }

      // Save to localStorage (in real app, save to Supabase)
      localStorage.setItem('vyapara_settings', JSON.stringify(settings))
      
      setSuccessMsg('Settings saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      setErrors({ general: 'Failed to save settings' })
    }
    setSaving(false)
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePasswordPolicyChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      passwordPolicy: { ...prev.passwordPolicy, [field]: value }
    }))
  }

  const handleArrayChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean)
    setSettings(prev => ({ ...prev, [field]: array }))
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  const tabs = [
    { id: 'general', name: 'General', icon: 'fas fa-cog' },
    { id: 'applications', name: 'Applications', icon: 'fas fa-file-alt' },
    { id: 'notifications', name: 'Notifications', icon: 'fas fa-bell' },
    { id: 'security', name: 'Security', icon: 'fas fa-shield-alt' }
  ]

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>Settings</h1>
            <p>Configure your Vyapara Gateway admin portal</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary" 
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-save" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="success-banner" style={{ marginBottom: '1rem' }}>
            <i className="fas fa-check-circle" />
            {successMsg}
          </div>
        )}

        {errors.general && (
          <div className="error-banner" style={{ marginBottom: '1rem' }}>
            <i className="fas fa-exclamation-circle" />
            {errors.general}
          </div>
        )}

        <div className="settings-container">
          {/* Tab Navigation */}
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {activeTab === 'general' && (
              <div className="settings-section">
                <h3>General Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>System Name</label>
                    <input
                      type="text"
                      value={settings.systemName}
                      onChange={(e) => handleInputChange('systemName', e.target.value)}
                      className={errors.systemName ? 'error' : ''}
                    />
                    {errors.systemName && <span className="error-text">{errors.systemName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Admin Email</label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                      className={errors.adminEmail ? 'error' : ''}
                    />
                    {errors.adminEmail && <span className="error-text">{errors.adminEmail}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                    >
                      <option value="Asia/Colombo">Asia/Colombo</option>
                      <option value="UTC">UTC</option>
                      <option value="Asia/Dhaka">Asia/Dhaka</option>
                      <option value="Asia/Karachi">Asia/Karachi</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="settings-section">
                <h3>Application Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.autoAssignment}
                        onChange={(e) => handleInputChange('autoAssignment', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Enable Auto Assignment
                    </label>
                    <small>Automatically assign new applications to available staff</small>
                  </div>
                  
                  <div className="form-group">
                    <label>SLA Hours</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.slaHours}
                      onChange={(e) => handleInputChange('slaHours', parseInt(e.target.value))}
                      className={errors.slaHours ? 'error' : ''}
                    />
                    <small>Hours before application is considered overdue</small>
                    {errors.slaHours && <span className="error-text">{errors.slaHours}</span>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Required Documents</label>
                    <textarea
                      value={settings.requireDocuments.join(', ')}
                      onChange={(e) => handleArrayChange('requireDocuments', e.target.value)}
                      placeholder="nic, business_plan, financial_statement"
                      rows="3"
                    />
                    <small>Comma-separated list of required document types</small>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Allowed Business Types</label>
                    <textarea
                      value={settings.allowedBusinessTypes.join(', ')}
                      onChange={(e) => handleArrayChange('allowedBusinessTypes', e.target.value)}
                      placeholder="sole_proprietorship, partnership, limited_company"
                      rows="2"
                    />
                    <small>Comma-separated list of allowed business types</small>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h3>Notification Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Email Notifications
                    </label>
                    <small>Send email alerts for important events</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      SMS Notifications
                    </label>
                    <small>Send SMS alerts for urgent matters</small>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Slack Webhook URL</label>
                    <input
                      type="url"
                      value={settings.slackWebhook}
                      onChange={(e) => handleInputChange('slackWebhook', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    <small>Optional: Send notifications to Slack channel</small>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h3>Security Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    />
                    <small>Auto-logout after inactivity</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Two-Factor Authentication
                    </label>
                    <small>Require 2FA for admin access</small>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Password Policy</label>
                    <div className="password-policy">
                      <div className="policy-row">
                        <label>Minimum Length:</label>
                        <input
                          type="number"
                          min="6"
                          max="20"
                          value={settings.passwordPolicy.minLength}
                          onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="policy-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={settings.passwordPolicy.requireUppercase}
                            onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          Require Uppercase Letters
                        </label>
                      </div>
                      <div className="policy-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={settings.passwordPolicy.requireNumbers}
                            onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          Require Numbers
                        </label>
                      </div>
                      <div className="policy-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={settings.passwordPolicy.requireSymbols}
                            onChange={(e) => handlePasswordPolicyChange('requireSymbols', e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          Require Special Characters
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}