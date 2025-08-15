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
