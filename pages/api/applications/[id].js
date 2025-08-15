// pages/api/applications/[id].js
import { getApplicationById, getDocumentUrl } from '../../../lib/applicationService'

export default async function handler(req, res) {
  try {
    const { method, query } = req
    const { id } = query

    if (!id) {
      return res.status(400).json({ error: 'Application ID is required' })
    }

    switch (method) {
      case 'GET':
        const { data, error } = await getApplicationById(id)
        
        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Application not found' })
          }
          return res.status(500).json({ error: error.message })
        }
        
        return res.status(200).json({ application: data })

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
