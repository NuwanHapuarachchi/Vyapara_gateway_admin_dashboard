import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TestConnection() {
  const [status, setStatus] = useState('Testing...')
  const [results, setResults] = useState({})

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      console.log('Testing Supabase connection...')
      
      // Test 1: Get all table names
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_schema_tables') // This might not work, but we'll try
        .select()

      console.log('Tables test:', { tables, tablesError })

      // Test 2: Try to access user_profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)

      console.log('User profiles test:', { profiles, profilesError })

      // Test 3: Try business_applications table (which we know works)
      const { data: applications, error: appsError } = await supabase
        .from('business_applications')
        .select('*')
        .limit(1)

      console.log('Business applications test:', { applications, appsError })

      setResults({
        profilesData: profiles,
        profilesError,
        appsData: applications,
        appsError
      })

      if (profilesError) {
        setStatus(`Error accessing user_profiles: ${profilesError.message}`)
      } else {
        setStatus(`Success! Found ${profiles?.length || 0} profiles`)
      }

    } catch (error) {
      console.error('Connection test failed:', error)
      setStatus(`Connection failed: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Database Connection Test</h1>
      <p>Status: {status}</p>
      
      <h3>Results:</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(results, null, 2)}
      </pre>

      <button onClick={testConnection} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
        Test Again
      </button>
    </div>
  )
}
