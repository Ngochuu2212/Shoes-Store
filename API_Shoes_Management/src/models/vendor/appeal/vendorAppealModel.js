import pool from '~/config/db'
import { APPEAL_STATUS } from '~/utils/constants'

// Lấy thông tin cửa hàng theo owner_id
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, name, logo, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0] || null
}

// Kiểm tra đơn pending - SỬA LẠI
const getPendingAppealByStoreId = async (storeId) => {
  // Sử dụng prepared statement với placeholder
  const query = 'SELECT id FROM store_appeals WHERE store_id = ? AND status = ?'
  const [rows] = await pool.execute(query, [storeId, APPEAL_STATUS.PENDING])
  return rows[0] || null
}

// Tạo đơn khiếu nại
const createAppeal = async ({ storeId, appealReason, evidenceImages }) => {
  const query = `
    INSERT INTO store_appeals (store_id, appeal_reason, evidence_images) 
    VALUES (?, ?, ?)
  `
  const [result] = await pool.execute(query, [storeId, appealReason, evidenceImages])
  return result.insertId
}

// Lấy danh sách đơn của cửa hàng
const getAppealsByStoreId = async (storeId, { limit, offset }) => {
  const query = `
    SELECT id, appeal_reason, evidence_images, status, manager_note, created_at, updated_at
    FROM store_appeals
    WHERE store_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [storeId, String(limit), String(offset)])
  return rows
}

// Đếm số đơn của cửa hàng
const countAppealsByStoreId = async (storeId) => {
  const query = 'SELECT COUNT(*) AS total FROM store_appeals WHERE store_id = ?'
  const [rows] = await pool.execute(query, [storeId])
  return rows[0].total
}

// Lấy chi tiết đơn
const getAppealDetail = async (appealId, storeId) => {
  const query = `
    SELECT a.*, 
           s.name AS store_name, 
           s.logo AS store_logo
    FROM store_appeals a
    JOIN stores s ON a.store_id = s.id
    WHERE a.id = ? AND a.store_id = ?
  `
  const [rows] = await pool.execute(query, [appealId, storeId])
  return rows[0] || null
}

export const vendorAppealModel = {
  getStoreByOwnerId,
  getPendingAppealByStoreId,
  createAppeal,
  getAppealsByStoreId,
  countAppealsByStoreId,
  getAppealDetail
}