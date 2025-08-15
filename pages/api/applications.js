// pages/api/applications.js
import { getAllApplications, getApplicationStats, searchApplications } from '../../lib/applicationService'

export default async function handler(req, res) {
  try {
    const { method, query } = req

    switch (method) {
      case 'GET':
        if (query.search) {
          // Search applications
          const { data, error } = await searchApplications(query.search, {
            limit: parseInt(query.limit) || 20,
            offset: parseInt(query.offset) || 0
          })
          
          if (error) {
            return res.status(500).json({ error: error.message })
          }
          
          return res.status(200).json({ applications: data })
        } else if (query.stats === 'true') {
          // Get stats
          const { data, error } = await getApplicationStats()
          
          if (error) {
            return res.status(500).json({ error: error.message })
          }
          
          return res.status(200).json({ stats: data })
        } else {
          // Get all applications with filters
          const { data, error, count } = await getAllApplications({
            status: query.status,
            applicantId: query.applicant_id,
            limit: parseInt(query.limit) || 50,
            offset: parseInt(query.offset) || 0,
            sortBy: query.sort_by || 'created_at',
            sortOrder: query.sort_order || 'desc'
          })
          
          if (error) {
            return res.status(500).json({ error: error.message })
          }
          
          return res.status(200).json({ 
            applications: data, 
            total: count,
            page: Math.floor((parseInt(query.offset) || 0) / (parseInt(query.limit) || 50)) + 1,
            per_page: parseInt(query.limit) || 50
          })
        }

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
