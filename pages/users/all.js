import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AllUsers() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    dateRange: 'all'
  })
  const [sortConfig, setSortConfig] = useState({ field: 'created_at', direction: 'desc' })

  // Auth guard
  useEffect(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true'
    if (!authed) router.replace('/')
    else fetchUsers()
  }, [router, filters, sortConfig])

  const fetchUsers = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('users') // Assuming you have a users table
        .select(`
          *,
          user_profiles(business_name, business_type),
          applications(count)
        `)
        .order(sortConfig.field, { ascending: sortConfig.direction === 'asc' })
        .limit(100)

      // Apply filters
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
      }
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      
      if (filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }

      const { data, error } = await query

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      // If users table doesn't exist, show mock data
      setUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const mockUsers = [
    {
      id: 1,
      email: 'john.silva@email.com',
      full_name: 'John Silva',
      status: 'active',
      role: 'business_owner',
      created_at: '2024-07-15T10:30:00Z',
      last_login: '2024-08-14T15:20:00Z',
      user_profiles: { business_name: 'Silva Enterprises', business_type: 'retail' },
      applications: { count: 2 }
    },
    {
      id: 2,
      email: 'maria.perera@email.com',
      full_name: 'Maria Perera',
      status: 'pending',
      role: 'business_owner',
      created_at: '2024-07-20T09:15:00Z',
      last_login: '2024-08-13T11:45:00Z',
      user_profiles: { business_name: 'Perera Trading', business_type: 'wholesale' },
      applications: { count: 1 }
    },
    {
      id: 3,
      email: 'admin@vyapara.lk',
      full_name: 'Admin User',
      status: 'active',
      role: 'admin',
      created_at: '2024-06-01T08:00:00Z',
      last_login: '2024-08-15T08:30:00Z',
      user_profiles: null,
      applications: { count: 0 }
    }
  ]

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          user.email?.toLowerCase().includes(searchLower) ||
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.user_profiles?.business_name?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      return true
    })
  }, [users, filters])

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Status', 'Role', 'Business Name', 'Created At', 'Last Login']
    const rows = filteredUsers.map(user => [
      user.id,
      user.full_name || '',
      user.email || '',
      user.status || '',
      user.role || '',
      user.user_profiles?.business_name || '',
      user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      user.last_login ? new Date(user.last_login).toLocaleDateString() : ''
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>All Users</h1>
            <p>Browse and manage all registered users ({filteredUsers.length} users)</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-ghost" onClick={handleExportCsv}>
              <i className="fas fa-download" />
              Export CSV
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-user-plus" />
              Invite User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-card" style={{ marginBottom: '1rem' }}>
          <div className="filter-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}></i>
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ paddingLeft: '40px', width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All Roles</option>
              <option value="business_owner">Business Owner</option>
              <option value="admin">Admin</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="dashboard-card">
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer' }}>
                    Name {sortConfig.field === 'full_name' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                    Email {sortConfig.field === 'email' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th>Business</th>
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    Status {sortConfig.field === 'status' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                    Role {sortConfig.field === 'role' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                    Joined {sortConfig.field === 'created_at' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <i className="fas fa-user-circle" style={{ fontSize: '32px', color: '#666' }}></i>
                        </div>
                        <div>
                          <div className="user-name">{user.full_name}</div>
                          <div className="user-id" style={{ fontSize: '12px', color: '#666' }}>ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.user_profiles ? (
                        <div>
                          <div>{user.user_profiles.business_name}</div>
                          <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
                            {user.user_profiles.business_type}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                    <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-ghost btn-sm" title="View Profile">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Edit User">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-ghost btn-sm" title="More Actions">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-users" style={{ fontSize: '48px', color: '#ccc', marginBottom: '1rem' }}></i>
                <p>No users found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </Layout>
  )
}