import pool from '~/config/db'
import { PAYOUT_STATUS } from '~/utils/constants'

// A. Lấy thông tin số dư (balance) và trạng thái hiện tại của Store dựa vào owner_id
const getStoreWalletDetail = async (ownerId) => {
  const query = 'SELECT id, name AS store_name, logo, balance, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0] || null
}

// B. Trừ tiền tạm tính và Tạo yêu cầu rút tiền
const createPayoutRequestTransaction = async (storeId, { amount, bankName, accountNumber, accountName }) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // 1. Trừ bớt số tiền rút khỏi ví balance của Store ngay lập tức (Hold tiền chờ duyệt)
    await connection.execute(
      'UPDATE stores SET balance = balance - ? WHERE id = ?',
      [amount, storeId]
    )

    // 2. Thêm mới một dòng ghi nhận vào bảng lịch sử rút tiền payout_requests
    const insertQuery = `
      INSERT INTO payout_requests (store_id, amount, bank_name, account_number, account_name, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const [result] = await connection.execute(insertQuery, [
      storeId,
      amount,
      bankName,
      accountNumber,
      accountName,
      PAYOUT_STATUS.PENDING // Trạng thái mặc định chờ Admin chuyển khoản
    ])

    await connection.commit()
    return result.insertId
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// C. Lấy lịch sử các lệnh rút tiền của riêng Shop này (Phan trang)
const getVendorPayoutHistory = async (storeId, { limit, offset }) => {
  const query = `
    SELECT id, amount, bank_name, account_number, account_name, status, admin_note, created_at
    FROM payout_requests
    WHERE store_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [
    storeId,
    String(limit),
    String(offset)
  ])
  return rows
}

// D. Đếm tổng số lệnh rút tiền của riêng Shop để làm phân trang ở FE
const countVendorPayoutHistory = async (storeId) => {
  const query = 'SELECT COUNT(*) AS total FROM payout_requests WHERE store_id = ?'
  const [rows] = await pool.execute(query, [storeId])
  return rows[0]?.total || 0
}

const getAllVendorPayoutHistory = async (storeId) => {
  const query = `
    SELECT 
      id, 
      amount, 
      bank_name, 
      account_number, 
      account_name, 
      status, 
      admin_note, 
      created_at
    FROM payout_requests
    WHERE store_id = ?
    ORDER BY created_at DESC
  `
  const [rows] = await pool.execute(query, [storeId])
  return rows
}

export const vendorPayoutModel = {
  getStoreWalletDetail,
  createPayoutRequestTransaction,
  getVendorPayoutHistory,
  countVendorPayoutHistory,
  getAllVendorPayoutHistory
}