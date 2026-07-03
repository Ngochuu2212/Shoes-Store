import pool from '~/config/db'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// 1. Kiểm tra xem User đã từng thả tim sản phẩm này chưa
const checkFavoriteExist = async (userId, productId) => {
  const query = 'SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?'
  const [rows] = await pool.execute(query, [userId, productId])
  return rows.length > 0
}

// 2. Thêm vào danh sách yêu thích (Thả tim)
const addFavorite = async (userId, productId) => {
  const query = 'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)'
  await pool.execute(query, [userId, productId])
}

// 3. Xóa khỏi danh sách yêu thích (Bỏ thả tim)
const removeFavorite = async (userId, productId) => {
  const query = 'DELETE FROM favorites WHERE user_id = ? AND product_id = ?'
  await pool.execute(query, [userId, productId])
}

// 4. Lấy danh sách tất cả các đôi giày đã thích của một User (Nối sang bảng products và stores)
const getFavoriteProductsByUserId = async (userId) => {
  const query = `
    SELECT p.id AS product_id, p.name, p.slug, p.price, p.images, p.rating_avg, p.sold,
           s.name AS store_name
    FROM favorites f
    INNER JOIN products p ON f.product_id = p.id
    INNER JOIN stores s ON p.store_id = s.id
    WHERE f.user_id = ? 
      AND p.is_active = TRUE 
      AND p.status = ?  
    ORDER BY p.created_at DESC
  `
  const [rows] = await pool.execute(query, [userId, PRODUCT_MODERATION_STATUS.APPROVED])
  return rows
}

export const favoriteModel = {
  checkFavoriteExist,
  addFavorite,
  removeFavorite,
  getFavoriteProductsByUserId
}