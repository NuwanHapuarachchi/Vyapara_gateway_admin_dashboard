// components/PendingTable.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function PendingTable() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('admin_applications')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false })
      .limit(10)
    if (!error) setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id) => {
    await supabase.from('admin_applications').update({ status: 'Approved' }).eq('id', id)
    await load()
  }

  if (loading) {
    return (
      <div className="table-container">
        <div className="spinner" style={{margin: '1rem auto'}}></div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Email</th>
              <th>Business</th>
              <th>Type</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{padding: '1rem', color: 'var(--gray-500)'}}>No pending applications</td></tr>
            )}
            {rows.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar small"><i className="fas fa-user"></i></div>
                    <span>{app.applicant_name}</span>
                  </div>
                </td>
                <td>{app.email || '-'}</td>
                <td>{app.business_name}</td>
                <td><span className="business-type-badge">{app.business_type}</span></td>
                <td>{new Date(app.created_at).toLocaleDateString()}</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-primary" onClick={() => approve(app.id)}>Approve</button>
                    <Link href={`/applications/${app.id}`} className="btn btn-sm btn-ghost">View</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
