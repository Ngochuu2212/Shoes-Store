import pool from '~/config/db'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Thêm mới chương trình khuyến mãi
const createPromotion = async (storeId, { name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive }) => {
  const query = `
    INSERT INTO promotions (store_id, name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  const [result] = await pool.execute(query, [
    storeId, name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive ?? 1
  ])
  return result.insertId
}

// 2. Cập nhật thông tin khuyến mãi
const updatePromotion = async (id, storeId, { name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive }) => {
  const query = `
    UPDATE promotions 
    SET name = ?, description = ?, discount_value = ?, min_order_value = ?, max_discount_amount = ?, start_date = ?, end_date = ?, is_active = ?
    WHERE id = ? AND store_id = ?
  `
  const [result] = await pool.execute(query, [
    name, description, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, isActive, id, storeId
  ])
  return result.affectedRows > 0
}

// 3. Xóa khuyến mãi (Hard delete - Bảng product_promotions sẽ tự động xóa nhờ ON DELETE CASCADE)
const deletePromotion = async (id, storeId) => {
  const query = 'DELETE FROM promotions WHERE id = ? AND store_id = ?'
  const [result] = await pool.execute(query, [id, storeId])
  return result.affectedRows > 0
}

// 4. Lấy chi tiết 1 chương trình khuyến mãi
const getPromotionById = async (id, storeId) => {
  const query = 'SELECT * FROM promotions WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [id, storeId])
  return rows[0] || null
}

// 5. Danh sách khuyến mãi + Phân trang + Tìm kiếm + Lọc đa điều kiện
const getVendorPromotions = async (storeId, { search, isActive, startDate, endDate, sortBy, sortOrder, limit, offset }) => {
  let query = 'SELECT * FROM promotions WHERE store_id = ?'
  const queryParams = [storeId]

  // Tìm kiếm theo tên khuyến mãi
  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  // Lọc theo trạng thái ẩn/hiện (1 hoặc 0)
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }
  // Lọc theo ngày bắt đầu
  if (startDate) {
    query += ' AND start_date >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  // Lọc theo ngày kết thúc
  if (endDate) {
    query += ' AND end_date <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const allowSortFields = ['created_at', 'discount_value', 'end_date']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  // Nối chuỗi sắp xếp động vào Query câu lệnh
  query += ` ORDER BY ${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 6. Đếm tổng số khuyến mãi thỏa điều kiện để phân trang
const countVendorPromotions = async (storeId, { search, isActive, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) as total FROM promotions WHERE store_id = ?'
  const queryParams = [storeId]

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

// 7. Thống kê nhanh số liệu khuyến mãi phục vụ các thẻ Widget ở đầu trang
const getPromotionsOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      COUNT(*) AS totalPromotions,
      SUM(CASE WHEN is_active = 1 AND NOW() BETWEEN start_date AND end_date THEN 1 ELSE 0 END) AS activePromotions,
      SUM(CASE WHEN is_active = 0 OR NOW() > end_date THEN 1 ELSE 0 END) AS inactivePromotions,
      SUM(CASE WHEN is_active = 1 AND NOW() BETWEEN start_date AND end_date AND end_date <= DATE_ADD(NOW(), INTERVAL 2 DAY) THEN 1 ELSE 0 END) AS expiringSoonPromotions
    FROM promotions
    WHERE store_id = ?
  `
  const [rows] = await pool.execute(query, [storeId])
  return {
    totalPromotions: Number(rows[0].totalPromotions) || 0,
    activePromotions: Number(rows[0].activePromotions) || 0,
    inactivePromotions: Number(rows[0].inactivePromotions) || 0,
    expiringSoonPromotions: Number(rows[0].expiringSoonPromotions) || 0
  }
}

// 8. Kiểm tra tính chính chủ của một danh sách ID khuyến mãi từ Checkbox
const checkMultiplePromotionsOwnership = async (promotionIds, storeId) => {
  if (!promotionIds || promotionIds.length === 0) return false
  const query = 'SELECT COUNT(*) AS validCount FROM promotions WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [promotionIds, storeId])
  return rows[0].validCount === promotionIds.length
}

// 9. Cập nhật trạng thái (is_active) hàng loạt cho Checkbox
const updatePromotionsStatusBulk = async (promotionIds, isActive, storeId) => {
  const query = 'UPDATE promotions SET is_active = ? WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [isActive, promotionIds, storeId])
  return result.affectedRows
}

// 10. Xóa cứng hàng loạt chương trình khuyến mãi từ Checkbox (product_promotions tự động xóa theo cascade)
const deletePromotionsBulk = async (promotionIds, storeId) => {
  const query = 'DELETE FROM promotions WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [promotionIds, storeId])
  return result.affectedRows
}

// 11. Cập nhật trạng thái ẩn/hiện đơn lẻ (Phục vụ nút gạt Switch trên từng dòng Table)
const updatePromotionStatusSingle = async (id, isActive, storeId) => {
  const query = 'UPDATE promotions SET is_active = ? WHERE id = ? AND store_id = ?'
  const [result] = await pool.execute(query, [isActive, id, storeId])
  return result.affectedRows > 0
}

export const vendorPromotionModel = {
  getStoreByOwnerId,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getVendorPromotions,
  countVendorPromotions,
  getPromotionsOverviewStats,
  checkMultiplePromotionsOwnership,
  updatePromotionsStatusBulk,
  deletePromotionsBulk,
  updatePromotionStatusSingle
}