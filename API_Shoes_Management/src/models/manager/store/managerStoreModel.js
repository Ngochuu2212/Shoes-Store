import pool from '~/config/db'
import { ROLE_ID } from '~/utils/constants'

// 1. Lấy danh sách cửa hàng + Bọc logic cô lập Shop bị Admin khóa
const getStoresForManager = async ({ search, isActive, startDate, endDate, limit, offset }) => {
  let query = `
    SELECT s.id, s.owner_id, u.fullname AS owner_name, u.email AS owner_email,
           s.name AS store_name, s.bio, s.logo, s.banner, s.address, s.balance, 
           s.is_active, s.rating_average, s.created_at, s.reject_reason,
           (SELECT name FROM roles WHERE id = u.role_id) AS owner_role
    FROM stores s
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND (s.name LIKE ? OR u.fullname LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  // Sửa: isActive (đã được truyền từ service)
  if (isActive !== undefined && isActive !== null) {
    query += ' AND s.is_active = ?'
    queryParams.push(Number(isActive))
  }

  if (startDate) {
    query += ' AND s.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND s.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số cửa hàng thỏa mãn bộ lọc
const countStoresForManager = async ({ search, isActive, startDate, endDate }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM stores s
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND (s.name LIKE ? OR u.fullname LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  if (isActive !== undefined && isActive !== null) {
    query += ' AND s.is_active = ?'
    queryParams.push(Number(isActive))
  }

  if (startDate) {
    query += ' AND s.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND s.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Xử lý cập nhật trạng thái hoạt động hàng loạt (Checkbox phê duyệt hoặc Khóa loạt)
const updateStoresStatusBulk = async (storeIds, isActive) => {
  if (!storeIds || storeIds.length === 0) return 0

  const query = `UPDATE stores SET is_active = ?, reject_reason = NULL WHERE id IN (${storeIds.map(() => '?').join(',')})`
  const [result] = await pool.execute(query, [isActive, ...storeIds])
  return result.affectedRows
}

// 3b. Từ chối cửa hàng - cập nhật is_active = 0 và lưu lý do từ chối
const rejectStoresBulk = async (storeIds, rejectReason) => {
  if (!storeIds || storeIds.length === 0) return 0

  const query = `UPDATE stores SET is_active = 0, reject_reason = ? WHERE id IN (${storeIds.map(() => '?').join(',')})`
  const [result] = await pool.execute(query, [rejectReason, ...storeIds])
  return result.affectedRows
}

// 4. Tìm các user_id là chủ của danh sách các store này
const getOwnerIdsByStoreIds = async (storeIds) => {
  if (!storeIds || storeIds.length === 0) return []
  const query = `SELECT owner_id FROM stores WHERE id IN (${storeIds.map(() => '?').join(',')})`
  const [rows] = await pool.execute(query, storeIds)
  return rows.map(row => row.owner_id)
}

// 5. Cập nhật role_id của các chủ shop lên VENDOR khi được duyệt thành công
const updateUserRolesBulk = async (userIds, roleId) => {
  if (!userIds || userIds.length === 0) return 0
  const query = `UPDATE users SET role_id = ? WHERE id IN (${userIds.map(() => '?').join(',')})`
  const [result] = await pool.execute(query, [roleId, ...userIds])
  return result.affectedRows
}

// 6. Lấy id của Role dựa vào tên
const getRoleIdByName = async (roleName) => {
  const query = 'SELECT id FROM roles WHERE name = ?'
  const [rows] = await pool.execute(query, [roleName])
  return rows[0] ? rows[0].id : null
}

const getStoresAndOwnersInfo = async (storeIds) => {
  if (!storeIds || storeIds.length === 0) return []

  const query = `
    SELECT s.id AS store_id, s.name AS store_name, s.logo, s.owner_id, u.fullname, u.email, u.role_id
    FROM stores s
    JOIN users u ON s.owner_id = u.id
    WHERE s.id IN (${storeIds.map(() => '?').join(',')})
  `
  const [rows] = await pool.execute(query, storeIds)
  return rows
}

// Ẩn toàn bộ sản phẩm thuộc danh sách các cửa hàng bị khóa
const disableProductsByStoreIds = async (storeIds) => {
  if (!storeIds || storeIds.length === 0) return 0

  const query = `UPDATE products SET is_active = FALSE WHERE store_id IN (${storeIds.map(() => '?').join(',')})`
  const [result] = await pool.execute(query, storeIds)
  return result.affectedRows
}

// Xóa hoàn toàn các bản ghi store bị từ chối khỏi hệ thống
const deleteStoresBulk = async (storeIds) => {
  if (!storeIds || storeIds.length === 0) return 0
  const query = `DELETE FROM stores WHERE id IN (${storeIds.map(() => '?').join(',')})`
  const [result] = await pool.execute(query, storeIds)
  return result.affectedRows
}

// Thống kê số liệu cửa hàng
const getStoresOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(s.id) AS totalStores,
      SUM(CASE WHEN s.is_active = 1 THEN 1 ELSE 0 END) AS activeStores,
      SUM(CASE WHEN s.is_active = 0 AND u.role_id = (SELECT id FROM roles WHERE name = 'USER' LIMIT 1) THEN 1 ELSE 0 END) AS pendingStores,
      SUM(CASE WHEN s.is_active = 0 AND u.role_id = (SELECT id FROM roles WHERE name = 'VENDOR' LIMIT 1) THEN 1 ELSE 0 END) AS bannedStores
    FROM stores s
    JOIN users u ON s.owner_id = u.id
  `
  const [rows] = await pool.execute(query)
  return {
    totalStores: Number(rows[0].totalStores) || 0,
    activeStores: Number(rows[0].activeStores) || 0,
    pendingStores: Number(rows[0].pendingStores) || 0,
    bannedStores: Number(rows[0].bannedStores) || 0
  }
}

// Lấy thông tin chi tiết của 1 cửa hàng
const getStoreDetailForManager = async (storeId) => {
  const query = `
    SELECT 
      s.*,
      u.fullname AS owner_name,
      u.email AS owner_email,
      u.phone AS owner_phone,
      u.created_at AS owner_joined_at,
      u.role_id AS owner_role_id,
      (SELECT name FROM roles WHERE id = u.role_id) AS owner_role,
      (SELECT COUNT(*) FROM products WHERE store_id = s.id) AS total_products
    FROM stores s
    JOIN users u ON s.owner_id = u.id
    WHERE s.id = ?
  `
  const [rows] = await pool.execute(query, [storeId])
  return rows[0] || null
}

const updateStoreStatusSingle = async (storeId, isActive) => {
  const query = 'UPDATE stores SET is_active = ?, reject_reason = NULL WHERE id = ?'
  const [result] = await pool.execute(query, [isActive, storeId])
  return result.affectedRows
}

// Cập nhật lý do từ chối cho 1 cửa hàng
const updateRejectReasonSingle = async (storeId, reason) => {
  const query = 'UPDATE stores SET reject_reason = ? WHERE id = ?'
  const [result] = await pool.execute(query, [reason, storeId])
  return result.affectedRows
}

const updateStoreActiveStatus = async (storeId, isActive) => {
  const query = 'UPDATE stores SET is_active = ?, reject_reason = NULL WHERE id = ?'
  const [result] = await pool.execute(query, [isActive ? 1 : 0, storeId])
  return result.affectedRows
}

export const managerStoreModel = {
  getStoresForManager,
  countStoresForManager,
  updateStoresStatusBulk,
  rejectStoresBulk,
  getOwnerIdsByStoreIds,
  updateUserRolesBulk,
  getRoleIdByName,
  getStoresAndOwnersInfo,
  disableProductsByStoreIds,
  deleteStoresBulk,
  getStoresOverviewStats,
  getStoreDetailForManager,
  updateStoreStatusSingle,
  updateRejectReasonSingle,
  updateStoreActiveStatus
}