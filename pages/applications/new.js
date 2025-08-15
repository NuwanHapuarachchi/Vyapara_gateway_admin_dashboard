// pages/applications/new.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function NewApplication() {
  const router = useRouter()
  const [form, setForm] = useState({
    applicant_name: '',
    business_name: '',
    business_type: 'Sole Proprietorship',
    email: '',
    phone: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOkMsg('')
    if (!form.applicant_name || !form.business_name) {
      setError('Applicant name and business name are required.')
      return
    }
    setSubmitting(true)
    const { error: insertErr } = await supabase.from('admin_applications').insert({
      applicant_name: form.applicant_name,
      business_name: form.business_name,
      business_type: form.business_type,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
      status: 'Pending',
    })
    setSubmitting(false)
    if (insertErr) {
      setError(insertErr.message)
      return
    }
    setOkMsg('Application created!')
    // Small pause then go back
    setTimeout(() => router.push('/applications'), 600)
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header" style={{marginBottom: '1rem'}}>
          <div className="header-content">
            <h1>Create New Application</h1>
            <p>Fill the form to add a new application</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="application-card" style={{padding: '1.5rem', maxWidth: 720}}>
          {error && (
            <div className="error-banner" style={{marginBottom: '1rem'}}>
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}
          {okMsg && (
            <div className="status-badge approved" style={{marginBottom: '1rem'}}>
              <i className="fa-solid fa-check"></i> {okMsg}
            </div>
          )}

          <div className="snapshot-grid" style={{padding: 0}}>
            <div className="info-grid">
              <div className="form-group">
                <label>Applicant Name</label>
                <input
                  name="applicant_name"
                  value={form.applicant_name}
                  onChange={onChange}
                  placeholder="John Silva"
                  className="search-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Business Name</label>
                <input
                  name="business_name"
                  value={form.business_name}
                  onChange={onChange}
                  placeholder="Silva Traders"
                  className="search-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Business Type</label>
                <select
                  name="business_type"
                  value={form.business_type}
                  onChange={onChange}
                  className="bulk-select"
                >
                  <option>Sole Proprietorship</option>
                  <option>Partnership</option>
                  <option>LLC</option>
                  <option>Corporation</option>
                </select>
              </div>

              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="john@example.com"
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label>Phone (optional)</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+94 77 123 4567"
                  className="search-input"
                />
              </div>

              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Notes (optional)</label>
                <textarea
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={onChange}
                  placeholder="Any notes for reviewers…"
                  className="search-input"
                  style={{resize: 'vertical'}}
                />
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? (<><i className="fa-solid fa-spinner fa-spin"></i> Creating…</>) : (<><i className="fa-solid fa-plus"></i> Create</>)}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/applications')}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Applications
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
