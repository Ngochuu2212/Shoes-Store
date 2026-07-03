import pool from '~/config/db'
import { PAYOUT_STATUS } from '~/utils/constants'

// A. Lấy danh sách lệnh rút tiền toàn sàn (Có phân trang, lọc theo status và tìm kiếm)
const getPayoutRequests = async ({ status, search, limit, offset }) => {
  let query = `
    SELECT 
      pr.*, 
      s.name AS store_name, 
      s.logo,  
      u.fullname AS vendor_name, 
      u.email AS vendor_email,
      u.avatar  
    FROM payout_requests pr
    JOIN stores s ON pr.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  // Lọc theo status
  if (status) {
    query += ' AND pr.status = ?'
    queryParams.push(status)
  }

  if (search) {
    query += ' AND ('
    query += ' pr.id LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR s.name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.bank_name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.account_number LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.account_name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR u.fullname LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR u.email LIKE ?'
    queryParams.push(`%${search}%`)
    query += ')'
  }

  query += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(limit, offset)

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// B. Đếm tổng số lượng lệnh rút tiền phục vụ phân trang
const countPayoutRequests = async ({ status, search }) => {
  let query = 'SELECT COUNT(*) AS total FROM payout_requests pr WHERE 1=1'
  const queryParams = []

  if (status) {
    query += ' AND pr.status = ?'
    queryParams.push(status)
  }

  if (search) {
    query += ' AND ('
    query += ' pr.id LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.bank_name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.account_number LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.account_name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ')'
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0]?.total || 0
}

// C. Lấy chi tiết thông tin một lệnh rút tiền
const getPayoutDetail = async (payoutId) => {
  const query = `
    SELECT 
      pr.*, 
      s.name AS store_name, 
      s.logo,  
      s.owner_id, 
      u.fullname AS vendor_name, 
      u.email AS vendor_email,
      u.avatar  
    FROM payout_requests pr
    JOIN stores s ON pr.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE pr.id = ?
  `
  const [rows] = await pool.execute(query, [payoutId])
  return rows[0] || null
}

// D. Xử lý phê duyệt hoặc từ chối lệnh rút tiền (Sử dụng Transaction bảo mật dòng tiền)
const processPayoutTransaction = async (payoutId, storeId, amount, targetStatus, adminNote) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // 1. Cập nhật trạng thái của lệnh rút tiền trong bảng payout_requests
    await connection.execute(
      'UPDATE payout_requests SET status = ?, admin_note = ? WHERE id = ?',
      [targetStatus, adminNote || null, payoutId]
    )

    // 2. Nếu Admin bấm TỪ CHỐI (rejected) -> Hoàn trả lại tiền vào ví balance của Store
    if (targetStatus === PAYOUT_STATUS.REJECTED) {
      await connection.execute(
        'UPDATE stores SET balance = balance + ? WHERE id = ?',
        [amount, storeId]
      )
    }

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// E. Lấy TOÀN BỘ lịch sử rút tiền để export
const getAllPayoutRequestsForExport = async ({ status, search }) => {
  let query = `
    SELECT 
      pr.id,
      pr.amount,
      pr.bank_name,
      pr.account_number,
      pr.account_name,
      pr.status,
      pr.admin_note,
      pr.created_at,
      s.name AS store_name,
      u.fullname AS vendor_name,
      u.email AS vendor_email
    FROM payout_requests pr
    JOIN stores s ON pr.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (status) {
    query += ' AND pr.status = ?'
    queryParams.push(status)
  }

  if (search) {
    query += ' AND ('
    query += ' pr.id LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR s.name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.bank_name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.account_number LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR pr.account_name LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR u.fullname LIKE ?'
    queryParams.push(`%${search}%`)
    query += ' OR u.email LIKE ?'
    queryParams.push(`%${search}%`)
    query += ')'
  }

  query += ' ORDER BY pr.created_at DESC'

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

export const adminPayoutModel = {
  getPayoutRequests,
  countPayoutRequests,
  getPayoutDetail,
  processPayoutTransaction,
  getAllPayoutRequestsForExport
}