import pool from '~/config/db'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// A. Lấy danh sách sản phẩm toàn sàn kèm phân trang và đa bộ lọc (kèm variants)
const getProductsForManager = async ({ search, categoryId, storeId, status, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT p.id, p.name AS product_name, p.slug, p.price, p.sold, p.is_active, p.status, p.created_at,
           p.rating_avg, p.images, p.reject_reason,
           s.name AS store_name, c.name AS category_name,
           (
             SELECT JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', pv.id,
                 'size', pv.size,
                 'color', pv.color,
                 'stock', pv.stock,
                 'image', pv.image
               )
             )
             FROM product_variants pv
             WHERE pv.product_id = p.id
           ) AS variants
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(String(categoryId))
  }
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(String(storeId))
  }
  if (status) {
    query += ' AND p.status = ?'
    queryParams.push(status)
  }

  // XỬ LÝ LOGIC SẮP XẾP AN TOÀN (WHITE-LIST VALIDATION)
  const allowSortFields = ['price', 'product_name', 'sold', 'created_at', 'rating_avg']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY p.${finalSortBy === 'product_name' ? 'name' : finalSortBy} ${finalSortOrder}`
  query += ' LIMIT ? OFFSET ?'

  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)

  // Parse variants từ JSON string sang array
  return rows.map(row => {
    if (row.variants) {
      try {
        if (typeof row.variants === 'string') {
          row.variants = JSON.parse(row.variants)
        }
        if (!row.variants) {
          row.variants = []
        }
      } catch (e) {
        row.variants = []
      }
    } else {
      row.variants = []
    }
    return row
  })
}

// B. Đếm tổng số sản phẩm thỏa mãn bộ lọc để phân trang chuẩn
const countProductsForManager = async ({ search, categoryId, storeId, status }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(String(categoryId))
  }
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(String(storeId))
  }
  if (status) {
    query += ' AND p.status = ?'
    queryParams.push(status)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0]?.total || 0
}

// C. Thống kê chi tiết số lượng sản phẩm theo từng thẻ trạng thái của vòng đời mới
const getProductsOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalAll,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.PENDING}' THEN 1 ELSE 0 END) AS totalPending,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.APPROVED}' THEN 1 ELSE 0 END) AS totalApproved,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.REJECTED}' THEN 1 ELSE 0 END) AS totalRejected,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.BANNED}' THEN 1 ELSE 0 END) AS totalBanned,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL}' THEN 1 ELSE 0 END) AS totalPendingReapproval
    FROM products
  `
  const [rows] = await pool.execute(query)
  return rows[0] || { totalAll: 0, totalPending: 0, totalApproved: 0, totalRejected: 0, totalBanned: 0, totalPendingReapproval: 0 }
}

// D. Lấy thông tin chi tiết một sản phẩm kèm thông tin chủ shop để gửi Email đơn lẻ
const getProductAndOwnerInfo = async (productId) => {
  const query = `
    SELECT p.name AS product_name, p.status, p.images, s.name AS store_name, u.fullname, u.email, u.id AS owner_id
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.id = ?
  `
  const [rows] = await pool.execute(query, [productId])
  return rows[0] || null
}

// E. Hàm cập nhật trạng thái đơn lẻ (có lưu reject_reason)
const updateProductModerationStatus = async (productId, status, rejectReason = null) => {
  const isActiveTarget = (status === PRODUCT_MODERATION_STATUS.APPROVED) ? 1 : 0

  let query = 'UPDATE products SET status = ?, is_active = ?'
  const queryParams = [status, isActiveTarget]

  // Nếu có reject_reason và status là REJECTED hoặc BANNED, lưu lại
  if (rejectReason && (status === PRODUCT_MODERATION_STATUS.REJECTED || status === PRODUCT_MODERATION_STATUS.BANNED)) {
    query += ', reject_reason = ?'
    queryParams.push(rejectReason)
  } else if (status === PRODUCT_MODERATION_STATUS.APPROVED) {
    // Khi approve, xóa reject_reason cũ
    query += ', reject_reason = NULL'
  }

  query += ' WHERE id = ?'
  queryParams.push(productId)

  const [result] = await pool.execute(query, queryParams)
  return result.affectedRows
}

// F. Hàm cập nhật trạng thái hàng loạt (có lưu reject_reason)
const updateProductsStatusBulk = async (productIds, status, rejectReason = null) => {
  const placeholders = productIds.map(() => '?').join(', ')
  const isActiveTarget = (status === PRODUCT_MODERATION_STATUS.APPROVED) ? 1 : 0

  let query = 'UPDATE products SET status = ?, is_active = ?'
  const queryParams = [status, isActiveTarget]

  // Nếu có reject_reason và status là REJECTED hoặc BANNED
  if (rejectReason && (status === PRODUCT_MODERATION_STATUS.REJECTED || status === PRODUCT_MODERATION_STATUS.BANNED)) {
    query += ', reject_reason = ?'
    queryParams.push(rejectReason)
  } else if (status === PRODUCT_MODERATION_STATUS.APPROVED) {
    query += ', reject_reason = NULL'
  }

  query += ` WHERE id IN (${placeholders})`
  queryParams.push(...productIds)

  const [result] = await pool.execute(query, queryParams)
  return result.affectedRows
}

// G. Lấy thông tin chủ các shop phục vụ việc gom nhóm gửi Mail hàng loạt
const getProductsAndOwnersInfoBulk = async (productIds) => {
  const placeholders = productIds.map(() => '?').join(', ')
  const query = `
    SELECT p.id AS product_id, p.name AS product_name, p.images, s.name AS store_name, u.fullname, u.email, u.id AS owner_id
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.id IN (${placeholders})
  `
  const [rows] = await pool.execute(query, productIds)
  return rows
}

// H. Xem chi tiết thông tin sâu của một sản phẩm phục vụ Modal popup xem trước của Manager (kèm variants)
const getProductDetailForManager = async (productId) => {
  const query = `
    SELECT 
      p.*,
      s.id AS store_id,
      s.name AS store_name,
      s.address AS store_address,
      s.bio AS store_bio,
      s.logo AS store_logo,
      s.banner AS store_banner,
      s.rating_average AS store_rating,
      u.id AS owner_id,
      u.fullname AS owner_name,
      u.email AS owner_email,
      u.phone AS owner_phone,
      u.created_at AS owner_joined_at,
      c.name AS category_name,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id,
            'size', pv.size,
            'color', pv.color,
            'stock', pv.stock,
            'image', pv.image
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.id = ?
  `
  const [rows] = await pool.execute(query, [productId])

  if (rows.length === 0) return null

  const row = rows[0]
  // Parse variants
  if (row.variants) {
    try {
      if (typeof row.variants === 'string') {
        row.variants = JSON.parse(row.variants)
      }
      if (!row.variants) {
        row.variants = []
      }
    } catch (e) {
      row.variants = []
    }
  } else {
    row.variants = []
  }

  return row
}

const getProductVariants = async (productId) => {
  const query = `
    SELECT id, size, color, stock, image
    FROM product_variants
    WHERE product_id = ?
    ORDER BY size, color
  `
  const [rows] = await pool.execute(query, [productId])
  return rows
}

export const managerProductModel = {
  getProductsForManager,
  countProductsForManager,
  getProductsOverviewStats,
  getProductAndOwnerInfo,
  updateProductModerationStatus,
  updateProductsStatusBulk,
  getProductsAndOwnersInfoBulk,
  getProductDetailForManager,
  getProductVariants
}