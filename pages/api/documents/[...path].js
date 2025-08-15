// pages/api/documents/[...path].js
import { getDocumentUrl } from '../../../lib/applicationService'

export default async function handler(req, res) {
  try {
    const { method, query } = req
    const filePath = Array.isArray(query.path) ? query.path.join('/') : query.path

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' })
    }

    switch (method) {
      case 'GET':
        const expiresIn = parseInt(query.expires_in) || 3600 // 1 hour default
        const { data, error } = await getDocumentUrl(filePath, expiresIn)
        
        if (error) {
          return res.status(500).json({ error: error.message })
        }
        
        if (query.redirect === 'true') {
          // Redirect to the signed URL
          return res.redirect(302, data.signedUrl)
        } else {
          // Return the signed URL as JSON
          return res.status(200).json({ url: data.signedUrl })
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
