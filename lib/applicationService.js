import { supabase } from './supabaseClient'

/**
 * Retrieve all business applications with related data
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by application status
 * @param {string} options.applicantId - Filter by specific applicant
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @param {string} options.sortBy - Sort field (created_at, updated_at, submitted_at)
 * @param {string} options.sortOrder - Sort order (asc, desc)
 * @returns {Promise<{data: Array, error: any, count: number}>}
 */
export async function getAllApplications(options = {}) {
  try {
    const {
      status,
      applicantId,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options

    let query = supabase
      .from('business_applications')
      .select(`
        *,
        businesses(
          id,
          business_name,
          business_type,
          proposed_trade_name,
          nature_of_business,
          business_address,
          business_details
        ),
        user_profiles(
          id,
          full_name,
          email,
          phone,
          nic,
          profile_image_url
        ),
        application_steps(
          id,
          step_name,
          step_order,
          is_completed,
          completed_at,
          required_documents,
          notes
        ),
        business_documents(
          id,
          document_name,
          document_type,
          status,
          current_version,
          uploaded_by,
          reviewed_by,
          review_notes,
          reviewed_at,
          created_at,
          document_versions(
            id,
            version_number,
            file_path,
            file_name,
            file_size,
            mime_type,
            uploaded_at
          )
        ),
        payments(
          id,
          amount,
          currency,
          status,
          payment_reference,
          paid_at
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (applicantId) {
      query = query.eq('applicant_id', applicantId)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching applications:', error)
      return { data: null, error, count: 0 }
    }

    return { data, error: null, count }
  } catch (err) {
    console.error('Unexpected error in getAllApplications:', err)
    return { data: null, error: err, count: 0 }
  }
}

/**
 * Get a specific application by ID with all related data
 * @param {string} applicationId - The application ID
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function getApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('business_applications')
      .select(`
        *,
        businesses(
          id,
          business_name,
          business_type,
          business_type_id,
          proposed_trade_name,
          nature_of_business,
          business_address,
          business_details,
          business_types(
            id,
            type,
            display_name,
            description,
            required_documents,
            estimated_processing_days,
            base_fee
          )
        ),
        user_profiles(
          id,
          full_name,
          email,
          phone,
          nic,
          profile_image_url,
          address,
          is_email_verified,
          is_nic_verified,
          is_phone_verified
        ),
        application_steps(
          id,
          step_name,
          step_order,
          is_completed,
          completed_at,
          required_documents,
          notes,
          assigned_to,
          user_profiles(
            id,
            full_name,
            email
          )
        ),
        business_documents(
          id,
          document_name,
          document_type,
          status,
          current_version,
          uploaded_by,
          reviewed_by,
          review_notes,
          reviewed_at,
          created_at,
          updated_at,
          document_versions(
            id,
            version_number,
            file_path,
            file_name,
            file_size,
            mime_type,
            upload_notes,
            uploaded_at
          )
        ),
        payments(
          id,
          amount,
          currency,
          status,
          payment_reference,
          gateway_transaction_id,
          paid_at,
          created_at,
          payment_method_id,
          payment_methods(
            method_name,
            method_code
          )
        ),
        appointments(
          id,
          appointment_type,
          title,
          description,
          appointment_date,
          start_time,
          end_time,
          status,
          location,
          meeting_link
        )
      `)
      .eq('id', applicationId)
      .single()

    if (error) {
      console.error('Error fetching application:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in getApplicationById:', err)
    return { data: null, error: err }
  }
}

/**
 * Get applications by specific user/applicant
 * @param {string} applicantId - The user ID
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export async function getApplicationsByUser(applicantId, options = {}) {
  const { status, limit = 20, offset = 0 } = options
  
  return getAllApplications({
    applicantId,
    status,
    limit,
    offset,
    ...options
  })
}

/**
 * Get document file URLs from storage bucket
 * @param {string} filePath - The file path in storage
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<{data: {signedUrl: string}|null, error: any}>}
 */
export async function getDocumentUrl(filePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from('documents') // Replace 'documents' with your actual bucket name
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in getDocumentUrl:', err)
    return { data: null, error: err }
  }
}

/**
 * Get multiple document URLs at once
 * @param {Array<string>} filePaths - Array of file paths
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export async function getMultipleDocumentUrls(filePaths, expiresIn = 3600) {
  try {
    const urlPromises = filePaths.map(filePath => getDocumentUrl(filePath, expiresIn))
    const results = await Promise.all(urlPromises)
    
    const successResults = results.filter(result => !result.error)
    const errors = results.filter(result => result.error)
    
    if (errors.length > 0) {
      console.warn('Some document URLs failed to generate:', errors)
    }
    
    return {
      data: successResults.map(result => result.data),
      error: errors.length === results.length ? errors[0].error : null
    }
  } catch (err) {
    console.error('Unexpected error in getMultipleDocumentUrls:', err)
    return { data: null, error: err }
  }
}

/**
 * Get application statistics
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function getApplicationStats() {
  try {
    // Get total applications count
    const { count: totalApplications, error: totalError } = await supabase
      .from('business_applications')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError

    // Get applications by status
    const { data: statusData, error: statusError } = await supabase
      .from('business_applications')
      .select('status')

    if (statusError) throw statusError

    // Count by status
    const statusCounts = statusData.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentApplications, error: recentError } = await supabase
      .from('business_applications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (recentError) throw recentError

    return {
      data: {
        total: totalApplications || 0,
        recent: recentApplications || 0,
        byStatus: statusCounts
      },
      error: null
    }
  } catch (err) {
    console.error('Error getting application stats:', err)
    return { data: null, error: err }
  }
}

/**
 * Search applications by business name or application number
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional options
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export async function searchApplications(searchTerm, options = {}) {
  try {
    const { limit = 20, offset = 0 } = options

    const { data, error } = await supabase
      .from('business_applications')
      .select(`
        *,
        businesses(
          id,
          business_name,
          business_type,
          proposed_trade_name
        ),
        user_profiles(
          id,
          full_name,
          email
        )
      `)
      .or(`application_number.ilike.%${searchTerm}%,businesses.business_name.ilike.%${searchTerm}%,businesses.proposed_trade_name.ilike.%${searchTerm}%`)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching applications:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in searchApplications:', err)
    return { data: null, error: err }
  }
}

/**
 * Update application status (approve, reject, request changes)
 * @param {string} applicationId - The application ID
 * @param {Object} updateData - Update data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function updateApplicationStatus(applicationId, updateData) {
  try {
    const { data, error } = await supabase
      .from('business_applications')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating application status:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating application status:', err)
    return { data: null, error: err }
  }
}

/**
 * Get application history/audit trail
 * @param {string} applicationId - The application ID
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export async function getApplicationHistory(applicationId) {
  try {
    // This would typically come from an audit_logs table
    // For now, return basic info from the application record
    const { data, error } = await supabase
      .from('business_applications')
      .select(`
        id,
        status,
        created_at,
        submitted_at,
        approved_at,
        rejected_at,
        updated_at,
        rejection_reason,
        notes
      `)
      .eq('id', applicationId)
      .single()

    if (error) {
      console.error('Error fetching application history:', error)
      return { data: null, error }
    }

    // Convert to audit trail format
    const history = []
    
    if (data.created_at) {
      history.push({
        timestamp: data.created_at,
        action: 'Application Created',
        status: 'draft',
        details: 'Application was created in the system'
      })
    }
    
    if (data.submitted_at) {
      history.push({
        timestamp: data.submitted_at,
        action: 'Application Submitted',
        status: 'submitted',
        details: 'Application was submitted for review'
      })
    }
    
    if (data.approved_at) {
      history.push({
        timestamp: data.approved_at,
        action: 'Application Approved',
        status: 'approved',
        details: 'Application was approved by admin'
      })
    }
    
    if (data.rejected_at) {
      history.push({
        timestamp: data.rejected_at,
        action: 'Application Rejected',
        status: 'rejected',
        details: data.rejection_reason || 'Application was rejected'
      })
    }

    return { data: history, error: null }
  } catch (err) {
    console.error('Unexpected error fetching application history:', err)
    return { data: null, error: err }
  }
}

/**
 * Get comprehensive application statistics for reports
 * @param {string} dateRange - Date range filter ('7d', '30d', '90d', '1y')
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function getApplicationStatistics(dateRange = '30d') {
  try {
    // Calculate date filter
    const now = new Date()
    const daysBack = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[dateRange] || 30

    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    const startDateISO = startDate.toISOString()

    // Get basic application counts
    const { data: allApplications, error: allError } = await supabase
      .from('business_applications')
      .select('id, status, created_at, submitted_at, approved_at, rejected_at, business_id')
      .gte('created_at', startDateISO)

    if (allError) {
      console.error('Error fetching application statistics:', allError)
      return { data: null, error: allError }
    }

    // Get business type data
    const { data: businessData, error: businessError } = await supabase
      .from('business_applications')
      .select(`
        id,
        created_at,
        businesses(business_type)
      `)
      .gte('created_at', startDateISO)

    if (businessError) {
      console.error('Error fetching business type data:', businessError)
    }

    // Calculate statistics
    const total = allApplications.length
    
    // Debug: log all unique statuses
    const uniqueStatuses = [...new Set(allApplications.map(app => app.status))]
    console.log('Unique statuses found in database:', uniqueStatuses)
    
    const approved = allApplications.filter(app => 
      app.status === 'approved' || app.status === 'Approved'
    ).length
    const rejected = allApplications.filter(app => 
      app.status === 'rejected' || app.status === 'Rejected'
    ).length
    const pending = allApplications.filter(app => 
      app.status === 'submitted' || app.status === 'Submitted' || 
      app.status === 'pending' || app.status === 'Pending'
    ).length
    const inReview = allApplications.filter(app => 
      app.status === 'in_review' || app.status === 'In Review' || 
      app.status === 'document_review' || app.status === 'Document Review'
    ).length
    
    console.log('Application counts:', { total, approved, rejected, pending, inReview })

    // Calculate processing times
    const processedApps = allApplications.filter(app => app.approved_at || app.rejected_at)
    let avgProcessingTime = 0
    if (processedApps.length > 0) {
      const totalProcessingTime = processedApps.reduce((sum, app) => {
        const startDate = new Date(app.submitted_at || app.created_at)
        const endDate = new Date(app.approved_at || app.rejected_at)
        const daysDiff = Math.max(0, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)))
        return sum + daysDiff
      }, 0)
      avgProcessingTime = Math.round((totalProcessingTime / processedApps.length) * 10) / 10
    }

    // Calculate rates
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0
    const slaCompliance = processedApps.length > 0 ? 
      Math.round((processedApps.filter(app => {
        const startDate = new Date(app.submitted_at || app.created_at)
        const endDate = new Date(app.approved_at || app.rejected_at)
        const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
        return daysDiff <= 5 // Assuming 5 days SLA
      }).length / processedApps.length) * 100) : 0

    // Calculate business type distribution
    const businessTypes = {}
    if (businessData && businessData.length > 0) {
      businessData.forEach(app => {
        const type = app.businesses?.business_type || 'Unknown'
        businessTypes[type] = (businessTypes[type] || 0) + 1
      })
    }

    const businessTypeArray = Object.entries(businessTypes).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count)

    // Calculate monthly trends (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthApps = allApplications.filter(app => {
        const appDate = new Date(app.created_at)
        return appDate >= monthStart && appDate <= monthEnd
      })

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        applications: monthApps.length,
        approved: monthApps.filter(app => 
          app.status === 'approved' || app.status === 'Approved'
        ).length,
        rejected: monthApps.filter(app => 
          app.status === 'rejected' || app.status === 'Rejected'
        ).length
      })
    }

    // Calculate growth trends
    const previousPeriodStart = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    const { data: previousApps } = await supabase
      .from('business_applications')
      .select('id')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', startDateISO)

    const previousTotal = previousApps?.length || 0
    const growthRate = previousTotal > 0 ? Math.round(((total - previousTotal) / previousTotal) * 100) : 0

    const statistics = {
      applications: {
        total,
        pending,
        approved,
        rejected,
        inReview
      },
      performance: {
        avgProcessingTime,
        slaCompliance,
        approvalRate,
        rejectionRate
      },
      trends: {
        weeklyGrowth: Math.max(0, Math.min(growthRate, 100)), // Cap at reasonable values
        monthlyGrowth: Math.max(0, Math.min(growthRate, 100)),
        conversionRate: approvalRate
      },
      businessTypes: businessTypeArray,
      monthlyData
    }

    return { data: statistics, error: null }
  } catch (err) {
    console.error('Unexpected error fetching application statistics:', err)
    return { data: null, error: err }
  }
}
