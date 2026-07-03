import pool from '~/config/db'

// Tự động tìm phòng chat cũ, nếu chưa từng chat thì tự động khởi tạo phòng chat mới (UNIQUE duy nhất)
const getOrCreateConversation = async (userId, storeId) => {
  const [existing] = await pool.execute(
    'SELECT id FROM conversations WHERE user_id = ? AND store_id = ?',
    [userId, storeId]
  )
  if (existing.length > 0) return existing[0].id

  const [result] = await pool.execute(
    'INSERT INTO conversations (user_id, store_id) VALUES (?, ?)',
    [userId, storeId]
  )
  return result.insertId
}

// Lưu trữ tin nhắn (Hỗ trợ text và mảng hình ảnh JSON từ Cloudinary)
const saveMessage = async (conversationId, senderId, content, images) => {
  const [result] = await pool.execute(
    'INSERT INTO messages (conversation_id, sender_id, content, images) VALUES (?, ?, ?, ?)',
    [conversationId, senderId, content || null, images ? JSON.stringify(images) : null]
  )
  // Cập nhật lại thời gian updated_at của conversations để đẩy phòng chat lên top ứng dụng
  await pool.execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId])
  return result.insertId
}

const getMessagesByConversation = async (conversationId, limit, offset) => {
  const query = `
    SELECT m.id, m.sender_id, m.content, m.images, m.is_read, m.created_at, u.fullname AS sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.query(query, [conversationId, limit, offset])
  return rows.reverse()
}

// Tải toàn bộ danh sách phòng chat của người dùng hiện tại
const getConversationsList = async (userId) => {
  const query = `
    SELECT 
      c.id AS conversation_id, 
      c.updated_at,
      s.id AS store_id, 
      s.name AS store_name, 
      s.logo AS store_logo, 
      u_store.id AS store_owner_id, 
      u_store.is_online AS store_online, 
      u_store.last_active AS store_last_active,
      u_client.id AS client_id, 
      u_client.fullname AS client_name, 
      u_client.avatar AS client_avatar, 
      u_client.is_online AS client_online, 
      u_client.last_active AS client_last_active,
      (SELECT COUNT(*) FROM messages m 
       WHERE m.conversation_id = c.id 
       AND m.is_read = FALSE 
       AND m.sender_id != ?) AS unread_count
    FROM conversations c
    JOIN stores s ON c.store_id = s.id
    JOIN users u_store ON s.owner_id = u_store.id
    JOIN users u_client ON c.user_id = u_client.id
    WHERE c.user_id = ? OR s.owner_id = ?
    ORDER BY c.updated_at DESC
  `
  const [rows] = await pool.execute(query, [userId, userId, userId])
  return rows
}

const markMessagesAsRead = async (conversationId, userId) => {
  const query = `
    UPDATE messages 
    SET is_read = TRUE 
    WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE
  `
  await pool.execute(query, [conversationId, userId])
}

const getConversationInfoById = async (conversationId) => {
  const [rows] = await pool.execute('SELECT user_id, store_id FROM conversations WHERE id = ?', [conversationId])
  return rows[0]
}

const getStoreOwnerId = async (storeId) => {
  const [rows] = await pool.execute('SELECT owner_id FROM stores WHERE id = ?', [storeId])
  return rows[0]?.owner_id
}

const getStoreByOwnerId = async (ownerId) => {
  const [rows] = await pool.execute('SELECT id FROM stores WHERE owner_id = ?', [ownerId])
  return rows[0]
}

export const chatModel = {
  getOrCreateConversation,
  saveMessage,
  getMessagesByConversation,
  getConversationsList,
  getConversationInfoById,
  getStoreOwnerId,
  getStoreByOwnerId,
  markMessagesAsRead
}