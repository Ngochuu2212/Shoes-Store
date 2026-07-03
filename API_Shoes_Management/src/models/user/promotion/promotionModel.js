import pool from '~/config/db'

// Tìm kiếm mã giảm giá còn hiệu lực
const getActivePromotionByCode = async (code, storeId) => {
  // Quét mã giảm giá: Có thể là mã chung của toàn sàn (store_id IS NULL)
  // HOẶC mã riêng của chính shop mà khách đang mua hàng (store_id = ?)
  const query = `
    SELECT id, store_id, name, discount_value, min_order_value, max_discount_amount, start_date, end_date
    FROM promotions
    WHERE name = ? 
      AND (store_id IS NULL OR store_id = ?) 
      AND is_active = TRUE 
      AND NOW() BETWEEN start_date AND end_date
  `
  const [rows] = await pool.execute(query, [code, storeId])
  return rows[0]
}

// Lấy danh sách mã giảm giá đang hoạt động của một cửa hàng cụ thể
const getActivePromotionsByStoreId = async (storeId) => {
  const query = `
    SELECT id, store_id, name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date
    FROM promotions
    WHERE store_id = ? 
      AND is_active = TRUE 
      AND NOW() BETWEEN start_date AND end_date
    ORDER BY created_at DESC
  `
  const [rows] = await pool.execute(query, [storeId])
  return rows
}

// Lấy danh sách mã giảm giá hệ thống đang hoạt động (dành cho User chọn ở giỏ hàng)
const getActiveSystemPromotions = async () => {
  const query = `
    SELECT id, name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date
    FROM promotions
    WHERE store_id IS NULL 
      AND is_active = TRUE 
      AND NOW() BETWEEN start_date AND end_date
    ORDER BY created_at DESC
  `
  const [rows] = await pool.execute(query)
  return rows
}

export const promotionModel = {
  getActivePromotionByCode,
  getActivePromotionsByStoreId,
  getActiveSystemPromotions
}