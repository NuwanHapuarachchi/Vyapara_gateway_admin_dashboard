// Corrected file after accidental corruption
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import FilterPanel from '../components/FilterPanel'
import ApplicationsTable from '../components/ApplicationsTable'
import { supabase } from '../lib/supabaseClient'

export default function Applications() {
  const router = useRouter()
  const [initializing, setInitializing] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [applications, setApplications] = useState([])
  const [errMsg, setErrMsg] = useState('')
  const [filters, setFilters] = useState({ status: 'all', type: 'all', search: '' })

  useEffect(() => { setInitializing(false) }, [router])

  useEffect(() => { if (!initializing) loadApplications() }, [filters, initializing])

  async function loadApplications() {
    setFetching(true)
    setErrMsg('')
    try {
      let query = supabase
        .from('business_applications')
        .select(`
          id,
          application_number,
          status,
          submitted_at,
          business:business_id ( business_name, business_type ),
          applicant:applicant_id ( full_name ),
          steps:application_steps ( assigned_to, is_completed, step_order )
        `)
        .order('submitted_at', { ascending: false })

      if (filters.status !== 'all') query = query.eq('status', filters.status)
      if (filters.type !== 'all') query = query.eq('business.business_type', filters.type)

      const { data, error } = await query
      if (error) {
        console.warn('Data query failed:', error.message)
        setErrMsg('Could not load live data. Check RLS / permissions / table names.')
      }

      let rowsRaw = data || []
      if (filters.search) {
        const s = filters.search.toLowerCase()
        rowsRaw = rowsRaw.filter(r =>
          (r.business?.business_name || '').toLowerCase().includes(s) ||
          (r.applicant?.full_name || '').toLowerCase().includes(s) ||
          (r.application_number || '').toLowerCase().includes(s)
        )
      }
      mapAndSetApplications(rowsRaw)
    } catch (e) {
      console.error(e)
      setErrMsg('Unexpected error loading applications.')
      setApplications([])
    } finally {
      setFetching(false)
    }
  }

  function mapAndSetApplications(rowsRaw) {
    const now = Date.now()
    const rows = (rowsRaw || []).map(r => {
      const submitted = r.submitted_at ? new Date(r.submitted_at) : null
      const aging = submitted ? Math.max(0, Math.floor((now - submitted.getTime()) / 86400000)) : 0
      let assignee = 'Unassigned'
      if (Array.isArray(r.steps)) {
        const step = r.steps.find(s => !s.is_completed && s.assigned_to) || r.steps.find(s => s.assigned_to)
        if (step?.assigned_to) assignee = step.assigned_to
      }
      return {
        id: r.id,
        applicantName: r.applicant?.full_name || '—',
        businessName: r.business?.business_name || '—',
        businessType: r.business?.business_type || '—',
        status: r.status,
        submittedDate: r.submitted_at,
        assignee,
        aging,
      }
    })
    setApplications(rows)
  }

  const csvText = useMemo(() => {
    const cols = ['Application ID','Applicant Name','Business Name','Business Type','Status','Submitted Date','Assignee','Aging (days)']
    const rows = applications.map(a => [a.id,a.applicantName,a.businessName,a.businessType,a.status,a.submittedDate ? new Date(a.submittedDate).toISOString() : '',a.assignee, String(a.aging)])
    return [cols, ...rows].map(r => r.map(escapeCsv).join(',')).join('\n')
  }, [applications])

  function handleExportCsv() {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (initializing) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>Applications</h1>
            <p>Manage and review business registration applications</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-ghost" onClick={handleExportCsv} disabled={fetching}>
              <i className="fas fa-download" />
              Export CSV
            </button>
            <Link href="/applications/new" className="btn btn-primary">
              <i className="fas fa-plus" />
              New Application
            </Link>
          </div>
        </div>
        {errMsg && <div className="error-banner" style={{marginBottom:'1rem'}}><i className="fas fa-exclamation-circle" /> {errMsg}</div>}
        <div className="applications-content">
          <FilterPanel filters={filters} setFilters={setFilters} />
          <div style={{ flex:1, position:'relative' }}>
            {fetching && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.6)',zIndex:10}}><div className="spinner" /></div>}
            <ApplicationsTable applications={applications} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

function escapeCsv(value){
  const s = value ?? ''
  const needsQuotes = /[",\n]/.test(s)
  const cleaned = String(s).replace(/"/g,'""')
  return needsQuotes ? `"${cleaned}"` : cleaned
}
