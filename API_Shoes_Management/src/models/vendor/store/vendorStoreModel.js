import pool from '~/config/db'

// Kiểm tra xem User này đã đăng ký cửa hàng nào chưa
const checkStoreExistByOwnerId = async (ownerId) => {
  const query = 'SELECT id FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows.length > 0
}

// Lưu dữ liệu Shop mới vào MySQL
const createStore = async ({ ownerId, name, bio, logo, banner, address, commissionRate }) => {
  const query = `
    INSERT INTO stores (owner_id, name, bio, logo, banner, address, is_active, balance, rating_average, commission_rate) 
    VALUES (?, ?, ?, ?, ?, ?, FALSE, 0.00, 0.00, ?)
  `
  const [result] = await pool.execute(query, [ownerId, name, bio, logo, banner, address, commissionRate])
  return result
}

// Lấy thông tin chi tiết gian hàng của chính mình (Dựa vào owner_id)
const getStoreByOwnerId = async (ownerId) => {
  const query = `
    SELECT id, owner_id, name, bio, logo, banner, address, balance, is_active, rating_average, created_at, commission_rate
    FROM stores 
    WHERE owner_id = ?
  `
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0] // Trả về object chứa thông tin shop
}

// Cập nhật thông tin profile shop
const updateStoreProfile = async (ownerId, { name, bio, logo, banner, address }) => {
  const query = `
    UPDATE stores 
    SET name = ?, bio = ?, logo = ?, banner = ?, address = ?
    WHERE owner_id = ?
  `
  const [result] = await pool.execute(query, [name, bio, logo, banner, address, ownerId])
  return result
}

export const vendorStoreModel = {
  checkStoreExistByOwnerId,
  createStore,
  getStoreByOwnerId,
  updateStoreProfile
}