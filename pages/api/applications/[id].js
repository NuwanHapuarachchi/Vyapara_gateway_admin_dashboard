// pages/api/applications/[id].js
import { getApplicationById, getDocumentUrl } from '../../../lib/applicationService'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  try {
    const { method, query, body } = req
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

      case 'PUT':
        // Handle application status updates
        const { status, approved_at, rejected_at, rejection_reason, notes, current_step } = body
        
        if (!status) {
          return res.status(400).json({ error: 'Status is required' })
        }

        const updateData = {
          status,
          updated_at: new Date().toISOString()
        }

        // Add conditional fields based on status
        if (approved_at) updateData.approved_at = approved_at
        if (rejected_at) updateData.rejected_at = rejected_at
        if (rejection_reason) updateData.rejection_reason = rejection_reason
        if (notes) updateData.notes = notes
        if (current_step) updateData.current_step = current_step

        const { data: updatedData, error: updateError } = await supabase
          .from('business_applications')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          return res.status(500).json({ error: updateError.message })
        }

        return res.status(200).json({ 
          message: 'Application updated successfully',
          application: updatedData 
        })

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
