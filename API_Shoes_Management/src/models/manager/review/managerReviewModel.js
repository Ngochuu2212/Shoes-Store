import pool from '~/config/db'

// 1. Lấy danh sách tố cáo Đánh giá sản phẩm (Phân trang + Lọc đa điều kiện vĩ mô + Sắp xếp động)
const getReportedProductReviews = async ({ search, rating, storeId, startDate, endDate, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT pr.id, pr.user_id, u.fullname AS user_name, 
           u.avatar AS user_avatar,
           pr.product_id, p.name AS product_name, p.images AS product_images,
           pr.order_id, pr.rating, pr.comment, pr.images AS review_images, 
           pr.is_active, pr.is_reported, pr.report_reason, pr.created_at, 
           s.id AS store_id, s.name AS store_name, s.logo AS store_logo
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON pr.user_id = u.id
    WHERE pr.is_reported = TRUE
  `
  const queryParams = []

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (storeId) {
    query += ' AND s.id = ?'
    queryParams.push(Number(storeId))
  }
  if (startDate) {
    query += ' AND pr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND pr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const allowSortFields = ['created_at', 'rating']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY pr.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số lượng tố cáo Đánh giá sản phẩm
const countReportedProductReviews = async ({ search, rating, storeId, startDate, endDate }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN stores s ON p.store_id = s.id
    WHERE pr.is_reported = TRUE
  `
  const queryParams = []

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (storeId) {
    query += ' AND s.id = ?'
    queryParams.push(Number(storeId))
  }
  if (startDate) {
    query += ' AND pr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND pr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 2. Xem chi tiết đích danh một Đánh giá sản phẩm bị tố cáo
const getProductReviewDetail = async (reviewId) => {
  const query = `
    SELECT pr.id AS review_id, pr.rating, pr.comment, pr.images AS review_images, 
           pr.is_active, pr.is_reported, pr.report_reason, pr.created_at,
           u.id AS user_id, u.fullname AS user_name, u.email AS user_email, u.avatar AS user_avatar,
           p.id AS product_id, p.name AS product_name, p.slug AS product_slug, p.images AS product_images,
           s.id AS store_id, s.name AS store_name, s.logo AS store_logo
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON pr.user_id = u.id
    WHERE pr.id = ?
  `
  const [rows] = await pool.execute(query, [reviewId])
  return rows[0] || null
}

// 3. Xử lý hàng loạt Đánh giá sản phẩm
const handleProductReviewsBulk = async (reviewIds, action) => {
  const placeholders = reviewIds.map(() => '?').join(', ')

  let query = ''
  if (action === 'approved') {
    query = `
      UPDATE product_reviews 
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  } else {
    query = `
      UPDATE product_reviews 
      SET is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  }

  const [result] = await pool.execute(query, [...reviewIds])
  return result.affectedRows
}

// 4. Lấy danh sách tố cáo Đánh giá cửa hàng
const getReportedStoreReviews = async ({ search, rating, storeId, startDate, endDate, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT sr.id, sr.user_id, u.fullname AS user_name, u.avatar AS user_avatar,
           sr.store_id, s.name AS store_name, s.logo AS store_logo,
           sr.rating, sr.comment, sr.is_active, sr.is_reported, sr.report_reason, sr.created_at
    FROM store_reviews sr
    JOIN stores s ON sr.store_id = s.id
    JOIN users u ON sr.user_id = u.id
    WHERE sr.is_reported = TRUE
  `
  const queryParams = []

  if (search) {
    query += ' AND sr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND sr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (storeId) {
    query += ' AND s.id = ?'
    queryParams.push(Number(storeId))
  }
  if (startDate) {
    query += ' AND sr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND sr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const allowSortFields = ['created_at', 'rating']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY sr.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số lượng tố cáo Đánh giá cửa hàng
const countReportedStoreReviews = async ({ search, rating, storeId, startDate, endDate }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM store_reviews sr
    JOIN stores s ON sr.store_id = s.id
    WHERE sr.is_reported = TRUE
  `
  const queryParams = []

  if (search) {
    query += ' AND sr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND sr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (storeId) {
    query += ' AND s.id = ?'
    queryParams.push(Number(storeId))
  }
  if (startDate) {
    query += ' AND sr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND sr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 5. Xem chi tiết đích danh một Đánh giá cửa hàng bị tố cáo
const getStoreReviewDetail = async (reviewId) => {
  const query = `
    SELECT sr.id AS review_id, sr.rating, sr.comment, sr.is_active, sr.is_reported, sr.report_reason, sr.created_at,
           u.id AS user_id, u.fullname AS user_name, u.email AS user_email, u.avatar AS user_avatar,
           s.id AS store_id, s.name AS store_name, s.logo AS store_logo, s.banner AS store_banner
    FROM store_reviews sr
    JOIN stores s ON sr.store_id = s.id
    JOIN users u ON sr.user_id = u.id
    WHERE sr.id = ?
  `
  const [rows] = await pool.execute(query, [reviewId])
  return rows[0] || null
}

// 6. Xử lý hàng loạt Đánh giá cửa hàng
const handleStoreReviewsBulk = async (reviewIds, action) => {
  const placeholders = reviewIds.map(() => '?').join(', ')

  let query = ''
  if (action === 'approved') {
    query = `
      UPDATE store_reviews 
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  } else {
    query = `
      UPDATE store_reviews 
      SET is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  }

  const [result] = await pool.execute(query, [...reviewIds])
  return result.affectedRows
}

// 7. Thống kê tổng quan
const getManagerReviewsOverviewStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM product_reviews WHERE is_reported = TRUE) AS pendingProductReports,
      (SELECT COUNT(*) FROM store_reviews WHERE is_reported = TRUE) AS pendingStoreReports,
      (SELECT COUNT(*) FROM product_reviews WHERE is_active = FALSE) AS bannedProductReviews,
      (SELECT COUNT(*) FROM store_reviews WHERE is_active = FALSE) AS bannedStoreReviews
  `
  const [rows] = await pool.execute(query)
  return {
    pendingProductReports: Number(rows[0].pendingProductReports) || 0,
    pendingStoreReports: Number(rows[0].pendingStoreReports) || 0,
    totalBannedReviews: (Number(rows[0].bannedProductReviews) + Number(rows[0].bannedStoreReviews)) || 0
  }
}

// 8. Lấy thông tin chủ sở hữu của review để gửi notification
const getReviewOwnersInfoBulk = async (reviewIds, reviewType) => {
  if (!reviewIds || reviewIds.length === 0) return []
  const placeholders = reviewIds.map(() => '?').join(',')
  let query = ''

  if (reviewType === 'product') {
    query = `
      SELECT pr.id AS review_id, pr.is_active, p.name AS target_name, u.fullname AS reviewer_name, s.owner_id
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      JOIN users u ON pr.user_id = u.id
      WHERE pr.id IN (${placeholders})
    `
  } else {
    query = `
      SELECT sr.id AS review_id, sr.is_active, s.name AS target_name, u.fullname AS reviewer_name, s.owner_id
      FROM store_reviews sr
      JOIN stores s ON sr.store_id = s.id
      JOIN users u ON sr.user_id = u.id
      WHERE sr.id IN (${placeholders})
    `
  }
  const [rows] = await pool.execute(query, reviewIds)
  return rows
}

export const managerReviewModel = {
  getReportedProductReviews,
  countReportedProductReviews,
  getProductReviewDetail,
  handleProductReviewsBulk,
  getReportedStoreReviews,
  countReportedStoreReviews,
  getStoreReviewDetail,
  handleStoreReviewsBulk,
  getManagerReviewsOverviewStats,
  getReviewOwnersInfoBulk
}