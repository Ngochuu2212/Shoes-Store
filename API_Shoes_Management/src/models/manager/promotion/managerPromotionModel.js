import pool from '~/config/db'

// 1. Thêm mới mã khuyến mãi hệ thống (store_id = NULL)
const createPromotion = async ({ name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive }) => {
  const query = `
    INSERT INTO promotions (store_id, name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active)
    VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  const [result] = await pool.execute(query, [
    name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive ?? 1
  ])
  return result.insertId
}

// 2. Cập nhật mã khuyến mãi hệ thống
const updatePromotion = async (id, { name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive }) => {
  const query = `
    UPDATE promotions 
    SET name = ?, description = ?, discount_value = ?, min_order_value = ?, max_discount_amount = ?, start_date = ?, end_date = ?, is_active = ?
    WHERE id = ? AND store_id IS NULL
  `
  const [result] = await pool.execute(query, [
    name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive, id
  ])
  return result.affectedRows > 0
}

// 3. Xóa mã khuyến mãi hệ thống (Hard delete)
const deletePromotion = async (id) => {
  const query = 'DELETE FROM promotions WHERE id = ? AND store_id IS NULL'
  const [result] = await pool.execute(query, [id])
  return result.affectedRows > 0
}

// 4. Lấy chi tiết 1 mã khuyến mãi hệ thống
const getPromotionById = async (id) => {
  const query = 'SELECT * FROM promotions WHERE id = ? AND store_id IS NULL'
  const [rows] = await pool.execute(query, [id])
  return rows[0] || null
}

// 5. Danh sách khuyến mãi hệ thống + Phân trang + Tìm kiếm + Lọc
const getSystemPromotions = async ({ search, isActive, startDate, endDate, sortBy, sortOrder, limit, offset }) => {
  let query = 'SELECT * FROM promotions WHERE store_id IS NULL'
  const queryParams = []

  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (startDate) {
    query += ' AND start_date >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND end_date <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const allowSortFields = ['created_at', 'discount_value', 'end_date']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY ${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 6. Đếm tổng số mã hệ thống thỏa điều kiện để phân trang
const countSystemPromotions = async ({ search, isActive, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) as total FROM promotions WHERE store_id IS NULL'
  const queryParams = []

  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (startDate) {
    query += ' AND start_date >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND end_date <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 7. Thống kê nhanh số liệu khuyến mãi hệ thống phục vụ Widget
const getPromotionsOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalPromotions,
      SUM(CASE WHEN is_active = 1 AND NOW() BETWEEN start_date AND end_date THEN 1 ELSE 0 END) AS activePromotions,
      SUM(CASE WHEN is_active = 0 OR NOW() > end_date THEN 1 ELSE 0 END) AS inactivePromotions,
      SUM(CASE WHEN is_active = 1 AND NOW() BETWEEN start_date AND end_date AND end_date <= DATE_ADD(NOW(), INTERVAL 2 DAY) THEN 1 ELSE 0 END) AS expiringSoonPromotions
    FROM promotions
    WHERE store_id IS NULL
  `
  const [rows] = await pool.execute(query)
  return {
    totalPromotions: Number(rows[0].totalPromotions) || 0,
    activePromotions: Number(rows[0].activePromotions) || 0,
    inactivePromotions: Number(rows[0].inactivePromotions) || 0,
    expiringSoonPromotions: Number(rows[0].expiringSoonPromotions) || 0
  }
}

// 8. Kiểm tra sự tồn tại của một danh sách ID khuyến mãi hệ thống (Checkbox)
const checkMultiplePromotionsExistence = async (promotionIds) => {
  if (!promotionIds || promotionIds.length === 0) return false
  const query = 'SELECT COUNT(*) AS validCount FROM promotions WHERE id IN (?) AND store_id IS NULL'
  const [rows] = await pool.query(query, [promotionIds])
  return rows[0].validCount === promotionIds.length
}

// 9. Cập nhật trạng thái (is_active) hàng loạt
const updatePromotionsStatusBulk = async (promotionIds, isActive) => {
  const query = 'UPDATE promotions SET is_active = ? WHERE id IN (?) AND store_id IS NULL'
  const [result] = await pool.query(query, [isActive, promotionIds])
  return result.affectedRows
}

// 10. Xóa cứng hàng loạt
const deletePromotionsBulk = async (promotionIds) => {
  const query = 'DELETE FROM promotions WHERE id IN (?) AND store_id IS NULL'
  const [result] = await pool.query(query, [promotionIds])
  return result.affectedRows
}

// 11. Cập nhật trạng thái ẩn/hiện đơn lẻ (Switch)
const updatePromotionStatusSingle = async (id, isActive) => {
  const query = 'UPDATE promotions SET is_active = ? WHERE id = ? AND store_id IS NULL'
  const [result] = await pool.execute(query, [isActive, id])
  return result.affectedRows > 0
}

export const managerPromotionModel = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getSystemPromotions,
  countSystemPromotions,
  getPromotionsOverviewStats,
  checkMultiplePromotionsExistence,
  updatePromotionsStatusBulk,
  deletePromotionsBulk,
  updatePromotionStatusSingle
}
