import pool from '~/config/db'

// Lưu thông báo vào cơ sở dữ liệu
const createNotification = async ({ userId, title, content, type, referenceId }) => {
  const query = `
    INSERT INTO notifications (user_id, title, content, type, reference_id)
    VALUES (?, ?, ?, ?, ?)
  `
  const [result] = await pool.execute(query, [userId, title, content, type, referenceId || null])
  return result.insertId
}

// Tải danh sách thông báo của người dùng
const getNotificationsByUserId = async (userId, limit, offset) => {
  const query = `
    SELECT id, title, content, type, reference_id, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.query(query, [userId, limit, offset])
  return rows
}

// Đánh dấu đã đọc toàn bộ thông báo
const markAllAsRead = async (userId) => {
  const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ?'
  const [result] = await pool.execute(query, [userId])
  return result.affectedRows
}

const markAsRead = async (userId, notificationId) => {
  const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND id = ?'
  const [result] = await pool.execute(query, [userId, notificationId])
  return result.affectedRows
}

// Lấy số lượng thông báo chưa đọc
const getUnreadCount = async (userId) => {
  const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE'
  const [rows] = await pool.execute(query, [userId])
  return rows[0].count
}

export const notificationModel = {
  createNotification,
  getNotificationsByUserId,
  markAllAsRead,
  getUnreadCount,
  markAsRead
}