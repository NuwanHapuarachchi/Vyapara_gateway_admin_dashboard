// pages/reports/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function Reports() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [reportData, setReportData] = useState({
    applications: {
      total: 156,
      pending: 24,
      approved: 98,
      rejected: 18,
      inReview: 16
    },
    performance: {
      avgProcessingTime: 2.3,
      slaCompliance: 87,
      approvalRate: 72,
      rejectionRate: 13
    },
    trends: {
      weeklyGrowth: 12,
      monthlyGrowth: 28,
      conversionRate: 68
    },
    businessTypes: [
      { type: 'Sole Proprietorship', count: 67, percentage: 43 },
      { type: 'Limited Company', count: 45, percentage: 29 },
      { type: 'Partnership', count: 31, percentage: 20 },
      { type: 'NGO', count: 13, percentage: 8 }
    ],
    monthlyData: [
      { month: 'Jan', applications: 45, approved: 32, rejected: 8 },
      { month: 'Feb', applications: 52, approved: 38, rejected: 9 },
      { month: 'Mar', applications: 48, approved: 35, rejected: 7 },
      { month: 'Apr', applications: 61, approved: 44, rejected: 10 },
      { month: 'May', applications: 58, approved: 41, rejected: 9 },
      { month: 'Jun', applications: 67, approved: 48, rejected: 12 }
    ]
  })

  useEffect(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true'
    if (!authed) {
      router.replace('/')
      return
    }
    fetchReportData()
  }, [router, dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // In a real implementation, you'd fetch from Supabase
      // For now, using mock data with some variation based on date range
      const multiplier = dateRange === '7d' ? 0.3 : dateRange === '90d' ? 2.5 : 1
      
      setReportData(prev => ({
        ...prev,
        applications: {
          total: Math.floor(156 * multiplier),
          pending: Math.floor(24 * multiplier),
          approved: Math.floor(98 * multiplier),
          rejected: Math.floor(18 * multiplier),
          inReview: Math.floor(16 * multiplier)
        }
      }))
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    }
    setLoading(false)
  }

  const exportReport = async (format) => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `vyapara_report_${dateRange}_${timestamp}`

    if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value'],
        ['Total Applications', reportData.applications.total],
        ['Pending Applications', reportData.applications.pending],
        ['Approved Applications', reportData.applications.approved],
        ['Rejected Applications', reportData.applications.rejected],
        ['Applications in Review', reportData.applications.inReview],
        ['Average Processing Time (days)', reportData.performance.avgProcessingTime],
        ['SLA Compliance (%)', reportData.performance.slaCompliance],
        ['Approval Rate (%)', reportData.performance.approvalRate],
        ['Rejection Rate (%)', reportData.performance.rejectionRate],
        ['Weekly Growth (%)', reportData.trends.weeklyGrowth],
        ['Monthly Growth (%)', reportData.trends.monthlyGrowth],
        ['Conversion Rate (%)', reportData.trends.conversionRate]
      ]

      const csvContent = csvData.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const getDateRangeLabel = () => {
    const labels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      '1y': 'Last Year'
    }
    return labels[dateRange] || 'Last 30 Days'
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>Reports & Analytics</h1>
            <p>Comprehensive insights into your application processing</p>
          </div>
          <div className="header-actions">
            <select 
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button 
              className="btn btn-ghost"
              onClick={() => exportReport('csv')}
            >
              <i className="fas fa-download" />
              Export CSV
            </button>
            
            <button className="btn btn-primary">
              <i className="fas fa-chart-line" />
              Advanced Analytics
            </button>
          </div>
        </div>

        <div className="reports-content">
          {/* Key Metrics */}
          <div className="metrics-section">
            <h2>Key Metrics - {getDateRangeLabel()}</h2>
            <div className="metrics-grid">
              <div className="metric-card primary">
                <div className="metric-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{reportData.applications.total.toLocaleString()}</div>
                  <div className="metric-label">Total Applications</div>
                  <div className="metric-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    +{reportData.trends.monthlyGrowth}% vs last period
                  </div>
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{reportData.applications.approved}</div>
                  <div className="metric-label">Approved</div>
                  <div className="metric-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    {reportData.performance.approvalRate}% approval rate
                  </div>
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{reportData.applications.pending}</div>
                  <div className="metric-label">Pending Review</div>
                  <div className="metric-trend neutral">
                    <i className="fas fa-minus"></i>
                    {reportData.performance.avgProcessingTime} days avg
                  </div>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{reportData.performance.slaCompliance}%</div>
                  <div className="metric-label">SLA Compliance</div>
                  <div className="metric-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    +5% improvement
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-row">
              {/* Application Status Distribution */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Application Status Distribution</h3>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-expand"></i>
                  </button>
                </div>
                <div className="chart-placeholder donut-chart">
                  <div className="donut-segments">
                    <div 
                      className="donut-segment approved" 
                      style={{ '--percentage': `${(reportData.applications.approved / reportData.applications.total) * 100}%` }}
                    ></div>
                    <div 
                      className="donut-segment pending"
                      style={{ '--percentage': `${(reportData.applications.pending / reportData.applications.total) * 100}%` }}
                    ></div>
                    <div 
                      className="donut-segment rejected"
                      style={{ '--percentage': `${(reportData.applications.rejected / reportData.applications.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="donut-center">
                    <div className="donut-total">{reportData.applications.total}</div>
                    <div className="donut-label">Total</div>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color approved"></div>
                    <span>Approved ({reportData.applications.approved})</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color pending"></div>
                    <span>Pending ({reportData.applications.pending})</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color rejected"></div>
                    <span>Rejected ({reportData.applications.rejected})</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color review"></div>
                    <span>In Review ({reportData.applications.inReview})</span>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Monthly Application Trends</h3>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
                <div className="chart-placeholder bar-chart">
                  {reportData.monthlyData.map((data, index) => (
                    <div key={index} className="bar-group">
                      <div className="bar-container">
                        <div 
                          className="bar applications"
                          style={{ height: `${(data.applications / 70) * 100}%` }}
                          title={`${data.applications} applications`}
                        ></div>
                        <div 
                          className="bar approved"
                          style={{ height: `${(data.approved / 70) * 100}%` }}
                          title={`${data.approved} approved`}
                        ></div>
                      </div>
                      <div className="bar-label">{data.month}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color applications"></div>
                    <span>Total Applications</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color approved"></div>
                    <span>Approved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Types and Performance */}
            <div className="chart-row">
              {/* Business Types */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Applications by Business Type</h3>
                </div>
                <div className="business-types-list">
                  {reportData.businessTypes.map((type, index) => (
                    <div key={index} className="business-type-item">
                      <div className="business-type-info">
                        <span className="business-type-name">{type.type}</span>
                        <span className="business-type-count">{type.count} applications</span>
                      </div>
                      <div className="business-type-bar">
                        <div 
                          className="business-type-fill"
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                      <div className="business-type-percentage">{type.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Performance Indicators</h3>
                </div>
                <div className="performance-metrics">
                  <div className="performance-item">
                    <div className="performance-label">Average Processing Time</div>
                    <div className="performance-value">
                      {reportData.performance.avgProcessingTime} days
                    </div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill good"
                        style={{ width: `${100 - (reportData.performance.avgProcessingTime * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="performance-item">
                    <div className="performance-label">SLA Compliance Rate</div>
                    <div className="performance-value">
                      {reportData.performance.slaCompliance}%
                    </div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill excellent"
                        style={{ width: `${reportData.performance.slaCompliance}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="performance-item">
                    <div className="performance-label">First-Time Approval Rate</div>
                    <div className="performance-value">
                      {reportData.trends.conversionRate}%
                    </div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill good"
                        style={{ width: `${reportData.trends.conversionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="performance-item">
                    <div className="performance-label">Document Completeness</div>
                    <div className="performance-value">92%</div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill excellent"
                        style={{ width: '92%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <button className="quick-action-card" onClick={() => router.push('/applications?status=pending')}>
                <div className="quick-action-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Review Pending</h4>
                  <p>{reportData.applications.pending} applications awaiting review</p>
                </div>
                <div className="quick-action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button className="quick-action-card" onClick={() => router.push('/reports/detailed')}>
                <div className="quick-action-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Detailed Reports</h4>
                  <p>Access comprehensive analytics and custom reports</p>
                </div>
                <div className="quick-action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button className="quick-action-card" onClick={() => router.push('/settings')}>
                <div className="quick-action-icon">
                  <i className="fas fa-cog"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Configure SLA</h4>
                  <p>Adjust processing targets and notification settings</p>
                </div>
                <div className="quick-action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>

              <button className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Send Report</h4>
                  <p>Email this report to stakeholders</p>
                </div>
                <div className="quick-action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  )
}