import pool from '~/config/db'

// 1. Lấy số dư ví của user
const getWalletBalance = async (userId) => {
  const [rows] = await pool.execute('SELECT wallet_balance FROM users WHERE id = ?', [userId])
  return Number(rows[0]?.wallet_balance || 0)
}

// 2. Cộng tiền vào ví (trong transaction) — dùng khi hoàn tiền đơn hàng
const addToWalletInTransaction = async (connection, userId, amount, description, orderId = null) => {
  await connection.execute(
    'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
    [amount, userId]
  )
  await connection.execute(
    'INSERT INTO wallet_transactions (user_id, type, amount, description, order_id) VALUES (?, ?, ?, ?, ?)',
    [userId, 'REFUND', amount, description, orderId]
  )
}

// 3. Trừ tiền ví (trong transaction) — dùng khi đặt hàng
const deductFromWalletInTransaction = async (connection, userId, amount, description, orderId = null) => {
  const [rows] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ?', [userId])
  const currentBalance = Number(rows[0]?.wallet_balance || 0)
  if (currentBalance < amount) {
    throw new Error(`Số dư ví không đủ. Số dư hiện tại: ${currentBalance.toLocaleString('vi-VN')}đ`)
  }
  await connection.execute(
    'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
    [amount, userId]
  )
  await connection.execute(
    'INSERT INTO wallet_transactions (user_id, type, amount, description, order_id) VALUES (?, ?, ?, ?, ?)',
    [userId, 'SPEND', amount, description, orderId]
  )
}

// 4. Hoàn tiền vào ví trực tiếp (không cần transaction bên ngoài) — dùng ở vendor/admin cancel
const refundToWallet = async (userId, amount, description, orderId = null) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [amount, userId]
    )
    await connection.execute(
      'INSERT INTO wallet_transactions (user_id, type, amount, description, order_id) VALUES (?, ?, ?, ?, ?)',
      [userId, 'REFUND', amount, description, orderId]
    )
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// 5. Lấy lịch sử giao dịch ví (có phân trang)
const getWalletTransactions = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  const [transactions] = await pool.execute(
    'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, String(limit), String(offset)]
  )
  const [countResult] = await pool.execute(
    'SELECT COUNT(*) AS total FROM wallet_transactions WHERE user_id = ?',
    [userId]
  )
  return { transactions, total: countResult[0].total }
}

export const walletModel = {
  getWalletBalance,
  addToWalletInTransaction,
  deductFromWalletInTransaction,
  refundToWallet,
  getWalletTransactions
}
