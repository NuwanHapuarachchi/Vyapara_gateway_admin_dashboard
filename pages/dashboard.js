// pages/dashboard.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { getApplicationStatistics } from '../lib/applicationService'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [reportData, setReportData] = useState({
    applications: { total: 0, pending: 0, approved: 0, rejected: 0, inReview: 0 },
    performance: { avgProcessingTime: 0, slaCompliance: 0, approvalRate: 0, rejectionRate: 0 },
    businessTypes: [],
    monthlyData: [],
    trends: { weeklyGrowth: 0, monthlyGrowth: 0, conversionRate: 0 }
  })
  const [error, setError] = useState(null)

  const fetchReportData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getApplicationStatistics(dateRange)
      if (fetchError) {
        setError('Failed to fetch report data: ' + fetchError.message)
        setReportData({
          applications: { total: 0, pending: 0, approved: 0, rejected: 0, inReview: 0 },
          performance: { avgProcessingTime: 0, slaCompliance: 0, approvalRate: 0, rejectionRate: 0 },
          businessTypes: [],
          monthlyData: [],
          trends: { weeklyGrowth: 0, monthlyGrowth: 0, conversionRate: 0 }
        })
      } else if (data) {
        setReportData(data)
      } else {
        setReportData({
          applications: { total: 0, pending: 0, approved: 0, rejected: 0, inReview: 0 },
          performance: { avgProcessingTime: 0, slaCompliance: 0, approvalRate: 0, rejectionRate: 0 },
          businessTypes: [],
          monthlyData: [],
          trends: { weeklyGrowth: 0, monthlyGrowth: 0, conversionRate: 0 }
        })
      }
    } catch (error) {
      console.error('Unexpected error fetching report data:', error)
      setError('An unexpected error occurred while loading report data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

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
      <Layout>
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading dashboard data...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>Dashboard</h1>
            <p>Real-time insights into your application processing</p>
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
              disabled={reportData.applications.total === 0}
            >
              <i className="fas fa-download" />
              Export CSV
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => fetchReportData()}
              disabled={loading}
            >
              <i className="fas fa-sync" />
              Refresh Data
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner" style={{marginBottom: '1rem'}}>
            <i className="fas fa-exclamation-circle" /> {error}
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => fetchReportData()}
              style={{marginLeft: '1rem'}}
            >
              Retry
            </button>
          </div>
        )}

        <div className="reports-content">
          {/* Combined Key Metrics & Application Status */}
          <div className="metrics-section">
            <h2>Key Metrics & Application Status - {getDateRangeLabel()}</h2>
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
                    <i className="fas fa-percentage"></i>
                    {reportData.applications.total > 0 ? 
                      Math.round((reportData.applications.approved / reportData.applications.total) * 100) : 0
                    }% of total ({reportData.performance.approvalRate}% rate)
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
                    <i className="fas fa-percentage"></i>
                    {reportData.applications.total > 0 ? 
                      Math.round((reportData.applications.pending / reportData.applications.total) * 100) : 0
                    }% of total ({reportData.performance.avgProcessingTime} days avg)
                  </div>
                </div>
              </div>

              <div className="metric-card danger">
                <div className="metric-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{reportData.applications.rejected}</div>
                  <div className="metric-label">Rejected</div>
                  <div className="metric-trend negative">
                    <i className="fas fa-percentage"></i>
                    {reportData.applications.total > 0 ? 
                      Math.round((reportData.applications.rejected / reportData.applications.total) * 100) : 0
                    }% of total ({reportData.performance.rejectionRate}% rate)
                  </div>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{reportData.applications.inReview}</div>
                  <div className="metric-label">In Review</div>
                  <div className="metric-trend neutral">
                    <i className="fas fa-percentage"></i>
                    {reportData.applications.total > 0 ? 
                      Math.round((reportData.applications.inReview / reportData.applications.total) * 100) : 0
                    }% of total
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  )
}
