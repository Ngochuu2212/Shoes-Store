import pool from '~/config/db'

// 1. Lấy danh sách đơn cứu xét
const getAppealsForManager = async ({ status, search, startDate, endDate, limit, offset }) => {
  let query = `
    SELECT a.id, a.store_id, a.appeal_reason, a.evidence_images, a.status, a.manager_note,
           a.created_at, a.updated_at,
           s.name AS store_name, 
           s.logo AS store_logo,
           u.email AS owner_email, 
           u.fullname AS owner_name
    FROM store_appeals a
    JOIN stores s ON a.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (status) {
    query += ' AND a.status = ?'
    queryParams.push(status)
  }

  if (search) {
    query += ' AND (s.name LIKE ? OR u.fullname LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  // Thêm filter theo ngày
  if (startDate) {
    query += ' AND DATE(a.created_at) >= ?'
    queryParams.push(startDate)
  }

  if (endDate) {
    query += ' AND DATE(a.created_at) <= ?'
    queryParams.push(endDate)
  }

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số đơn
const countAppealsForManager = async ({ status, search, startDate, endDate }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM store_appeals a
    JOIN stores s ON a.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (status) {
    query += ' AND a.status = ?'
    queryParams.push(status)
  }

  if (search) {
    query += ' AND (s.name LIKE ? OR u.fullname LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  // Thêm filter theo ngày
  if (startDate) {
    query += ' AND DATE(a.created_at) >= ?'
    queryParams.push(startDate)
  }

  if (endDate) {
    query += ' AND DATE(a.created_at) <= ?'
    queryParams.push(endDate)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Thống kê số liệu đơn cứu xét (giống pattern của Store)
const getAppealsOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalAll,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS totalPending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS totalApproved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS totalRejected
    FROM store_appeals
  `
  const [rows] = await pool.execute(query)
  return {
    totalAll: Number(rows[0].totalAll) || 0,
    totalPending: Number(rows[0].totalPending) || 0,
    totalApproved: Number(rows[0].totalApproved) || 0,
    totalRejected: Number(rows[0].totalRejected) || 0
  }
}

// 4. Xem chi tiết đơn cứu xét
const getAppealDetailById = async (appealId) => {
  const query = `
    SELECT a.*, 
           s.name AS store_name, 
           s.logo AS store_logo,
           s.owner_id, 
           s.is_active AS store_current_status, 
           s.address AS store_address,
           s.bio AS store_bio,
           u.email AS owner_email,
           u.fullname AS owner_name,
           u.phone AS owner_phone
    FROM store_appeals a
    JOIN stores s ON a.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE a.id = ?
  `
  const [rows] = await pool.execute(query, [appealId])
  return rows[0] || null
}

// 5. Cập nhật trạng thái đơn cứu xét
const updateAppealStatus = async (appealId, status, managerNote) => {
  const query = 'UPDATE store_appeals SET status = ?, manager_note = ? WHERE id = ?'
  const [result] = await pool.execute(query, [status, managerNote, appealId])
  return result.affectedRows
}

// 6. Lấy thông tin cửa hàng theo store_id
const getStoreById = async (storeId) => {
  const query = 'SELECT id, name, logo, is_active, owner_id FROM stores WHERE id = ?'
  const [rows] = await pool.execute(query, [storeId])
  return rows[0] || null
}
export const managerAppealModel = {
  getAppealsForManager,
  countAppealsForManager,
  getAppealsOverviewStats,
  getAppealDetailById,
  updateAppealStatus,
  getStoreById
}