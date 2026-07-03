import pool from '~/config/db'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, name AS store_name, logo, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Lấy danh sách Đánh giá sản phẩm (Có Phân trang, Tìm kiếm comment, Lọc sao) - Kèm ảnh từ variants
const getProductReviews = async (storeId, { search, rating, isActive, isReported, limit, offset }) => {
  let query = `
    SELECT pr.id, pr.user_id, u.fullname, u.avatar, pr.product_id, p.name AS product_name, 
           p.images AS product_images, pr.order_id, pr.rating, pr.comment, pr.images, 
           pr.is_active, pr.is_reported, pr.report_reason, pr.created_at,
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
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN users u ON pr.user_id = u.id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND pr.is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (isReported !== undefined && isReported !== null) {
    query += ' AND pr.is_reported = ?'
    queryParams.push(Number(isReported))
  }

  query += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?'
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

// Đếm tổng số đánh giá sản phẩm
const countProductReviews = async (storeId, { search, rating, isActive, isReported }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND pr.is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (isReported !== undefined && isReported !== null) {
    query += ' AND pr.is_reported = ?'
    queryParams.push(Number(isReported))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 2. Lấy danh sách Đánh giá cửa hàng
const getStoreReviews = async (storeId, { search, rating, isActive, isReported, limit, offset }) => {
  let query = `
    SELECT sr.id, sr.user_id, u.fullname, u.avatar, sr.rating, sr.comment, sr.is_active, 
           sr.is_reported, sr.report_reason, sr.created_at
    FROM store_reviews sr
    JOIN users u ON sr.user_id = u.id
    WHERE sr.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND sr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND sr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND sr.is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (isReported !== undefined && isReported !== null) {
    query += ' AND sr.is_reported = ?'
    queryParams.push(Number(isReported))
  }

  query += ' ORDER BY sr.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số đánh giá cửa hàng
const countStoreReviews = async (storeId, { search, rating, isActive, isReported }) => {
  let query = 'SELECT COUNT(*) as total FROM store_reviews WHERE store_id = ?'
  const queryParams = [storeId]

  if (search) {
    query += ' AND comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND rating = ?'
    queryParams.push(Number(rating))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (isReported !== undefined && isReported !== null) {
    query += ' AND is_reported = ?'
    queryParams.push(Number(isReported))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Xem chi tiết một đánh giá sản phẩm - Kèm ảnh từ variants
const getProductReviewDetail = async (reviewId, storeId) => {
  const query = `
    SELECT pr.*, u.fullname, u.email, u.avatar, p.name AS product_name, p.images AS product_images,
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
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN users u ON pr.user_id = u.id
    WHERE pr.id = ? AND p.store_id = ?
  `
  const [rows] = await pool.execute(query, [reviewId, storeId])

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

// 4. Xem chi tiết một đánh giá cửa hàng
const getStoreReviewDetail = async (reviewId, storeId) => {
  const query = `
    SELECT sr.*, u.fullname, u.email, u.avatar
    FROM store_reviews sr
    JOIN users u ON sr.user_id = u.id
    WHERE sr.id = ? AND sr.store_id = ?
  `
  const [rows] = await pool.execute(query, [reviewId, storeId])
  return rows[0] || null
}

// 5. Gửi báo cáo vi phạm đối với Đánh giá sản phẩm
const reportProductReview = async (reviewId, storeId, reportReason) => {
  const query = `
    UPDATE product_reviews pr
    JOIN products p ON pr.product_id = p.id
    SET pr.is_reported = TRUE, pr.report_reason = ?
    WHERE pr.id = ? AND p.store_id = ?
  `
  const [result] = await pool.execute(query, [reportReason, reviewId, storeId])
  return result.affectedRows > 0
}

// 6. Gửi báo cáo vi phạm đối với Đánh giá cửa hàng
const reportStoreReview = async (reviewId, storeId, reportReason) => {
  const query = `
    UPDATE store_reviews 
    SET is_reported = TRUE, report_reason = ?
    WHERE id = ? AND store_id = ?
  `
  const [result] = await pool.execute(query, [reportReason, reviewId, storeId])
  return result.affectedRows > 0
}

// 7. Thống kê Widget đầu trang (Lấy tổng hợp từ cả product_reviews và store_reviews)
const getReviewsOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      -- Tổng số đánh giá sản phẩm
      (SELECT COUNT(*) FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.id 
       WHERE p.store_id = ?) AS totalProductReviews,
      
      -- Tổng số đánh giá cửa hàng
      (SELECT COUNT(*) FROM store_reviews sr WHERE sr.store_id = ?) AS totalStoreReviews,
      
      -- Điểm trung bình đánh giá sản phẩm (chỉ tính những review đang hiển thị)
      (SELECT AVG(pr.rating) FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.id 
       WHERE p.store_id = ? AND pr.is_active = TRUE) AS avgProductRating,
      
      -- Điểm trung bình đánh giá cửa hàng (chỉ tính những review đang hiển thị)
      (SELECT AVG(sr.rating) FROM store_reviews sr 
       WHERE sr.store_id = ? AND sr.is_active = TRUE) AS avgStoreRating,
      
      -- Tổng số đánh giá sản phẩm đang bị ẩn
      (SELECT COUNT(*) FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.id 
       WHERE p.store_id = ? AND pr.is_active = FALSE) AS inactiveProductReviews,
      
      -- Tổng số đánh giá cửa hàng đang bị ẩn
      (SELECT COUNT(*) FROM store_reviews sr 
       WHERE sr.store_id = ? AND sr.is_active = FALSE) AS inactiveStoreReviews,
      
      -- Tổng số đánh giá sản phẩm đã bị báo cáo
      (SELECT COUNT(*) FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.id 
       WHERE p.store_id = ? AND pr.is_reported = TRUE) AS reportedProductReviews,
      
      -- Tổng số đánh giá cửa hàng đã bị báo cáo
      (SELECT COUNT(*) FROM store_reviews sr 
       WHERE sr.store_id = ? AND sr.is_reported = TRUE) AS reportedStoreReviews,
      
      -- Tổng số đánh giá đang bị ẩn (từ cả 2 bảng) - giữ lại cho tương thích cũ
      (SELECT COUNT(*) FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.id 
       WHERE p.store_id = ? AND pr.is_active = FALSE) +
      (SELECT COUNT(*) FROM store_reviews sr 
       WHERE sr.store_id = ? AND sr.is_active = FALSE) AS totalInactiveReviews,
      
      -- Tổng số đánh giá đã bị báo cáo (từ cả 2 bảng) - giữ lại cho tương thích cũ
      (SELECT COUNT(*) FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.id 
       WHERE p.store_id = ? AND pr.is_reported = TRUE) +
      (SELECT COUNT(*) FROM store_reviews sr 
       WHERE sr.store_id = ? AND sr.is_reported = TRUE) AS totalReportedReviews
  `
  const [rows] = await pool.execute(query, [
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId,
    storeId
  ])

  const totalReviews = Number(rows[0].totalProductReviews) + Number(rows[0].totalStoreReviews)

  // Tính điểm trung bình tổng hợp (có trọng số)
  let averageRating = '0.0'
  const productCount = Number(rows[0].totalProductReviews)
  const storeCount = Number(rows[0].totalStoreReviews)
  const productAvg = Number(rows[0].avgProductRating) || 0
  const storeAvg = Number(rows[0].avgStoreRating) || 0

  if (totalReviews > 0) {
    const totalWeightedScore = (productAvg * productCount) + (storeAvg * storeCount)
    averageRating = (totalWeightedScore / totalReviews).toFixed(1)
  }

  return {
    totalReviews: totalReviews,
    averageRating: averageRating,
    totalInactiveReviews: Number(rows[0].totalInactiveReviews) || 0,
    totalReportedReviews: Number(rows[0].totalReportedReviews) || 0,

    totalProductReviews: Number(rows[0].totalProductReviews) || 0,
    avgProductRating: productAvg.toFixed(1),
    inactiveProductReviews: Number(rows[0].inactiveProductReviews) || 0,
    reportedProductReviews: Number(rows[0].reportedProductReviews) || 0,

    totalStoreReviews: Number(rows[0].totalStoreReviews) || 0,
    avgStoreRating: storeAvg.toFixed(1),
    inactiveStoreReviews: Number(rows[0].inactiveStoreReviews) || 0,
    reportedStoreReviews: Number(rows[0].reportedStoreReviews) || 0
  }
}

// 8. Kiểm tra chính chủ hàng loạt đối với Đánh giá sản phẩm
const checkMultipleProductReviewsOwnership = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return false
  const query = `
    SELECT COUNT(*) AS validCount 
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    WHERE pr.id IN (?) AND p.store_id = ?
  `
  const [rows] = await pool.query(query, [reviewIds, storeId])
  return rows[0].validCount === reviewIds.length
}

// 9. Báo cáo vi phạm HÀNG LOẠT đối với Đánh giá sản phẩm
const reportProductReviewsBulk = async (reviewIds, storeId, reportReason) => {
  const query = `
    UPDATE product_reviews pr
    JOIN products p ON pr.product_id = p.id
    SET pr.is_reported = TRUE, pr.report_reason = ?
    WHERE pr.id IN (?) AND p.store_id = ?
  `
  const [result] = await pool.query(query, [reportReason, reviewIds, storeId])
  return result.affectedRows
}

// 10. Kiểm tra chính chủ hàng loạt đối với Đánh giá cửa hàng
const checkMultipleStoreReviewsOwnership = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return false
  const query = 'SELECT COUNT(*) AS validCount FROM store_reviews WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [reviewIds, storeId])
  return rows[0].validCount === reviewIds.length
}

// 11. Báo cáo vi phạm HÀNG LOẠT đối với Đánh giá cửa hàng
const reportStoreReviewsBulk = async (reviewIds, storeId, reportReason) => {
  const query = 'UPDATE store_reviews SET is_reported = TRUE, report_reason = ? WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [reportReason, reviewIds, storeId])
  return result.affectedRows
}

// 12. Gửi yêu cầu mở lại Đánh giá sản phẩm bị ẩn
const requestProductReviewReopenBulk = async (reviewIds, storeId, reason) => {
  const placeholders = reviewIds.map(() => '?').join(', ')
  const query = `
    UPDATE product_reviews pr
    JOIN products p ON pr.product_id = p.id
    SET pr.is_reported = TRUE, pr.report_reason = ?
    WHERE pr.id IN (${placeholders}) AND p.store_id = ? AND pr.is_active = FALSE AND pr.is_reported = FALSE
  `
  const [result] = await pool.query(query, [reason, ...reviewIds, storeId])
  return result.affectedRows
}

// 13. Gửi yêu cầu mở lại Đánh giá cửa hàng bị ẩn
const requestStoreReviewReopenBulk = async (reviewIds, storeId, reason) => {
  const placeholders = reviewIds.map(() => '?').join(', ')
  const query = `
    UPDATE store_reviews 
    SET is_reported = TRUE, report_reason = ?
    WHERE id IN (${placeholders}) AND store_id = ? AND is_active = FALSE AND is_reported = FALSE
  `
  const [result] = await pool.query(query, [reason, ...reviewIds, storeId])
  return result.affectedRows
}

// 14. Lấy thông tin chi tiết nhiều đánh giá sản phẩm cùng lúc - Kèm ảnh từ variants
const getMultipleProductReviewsInfo = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return []
  const placeholders = reviewIds.map(() => '?').join(',')
  const query = `
    SELECT pr.id, pr.comment, pr.rating, pr.product_id, p.name AS product_name, pr.images,
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
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    WHERE pr.id IN (${placeholders}) AND p.store_id = ?
  `
  const [rows] = await pool.execute(query, [...reviewIds, storeId])

  // Parse variants cho từng row
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

// 15. Lấy thông tin chi tiết nhiều đánh giá cửa hàng cùng lúc
const getMultipleStoreReviewsInfo = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return []
  const placeholders = reviewIds.map(() => '?').join(',')
  const query = `
    SELECT id, comment, rating, store_id
    FROM store_reviews
    WHERE id IN (${placeholders}) AND store_id = ?
  `
  const [rows] = await pool.execute(query, [...reviewIds, storeId])
  return rows
}

// 16. Lấy thông tin chi tiết nhiều đánh giá sản phẩm đang bị ẩn (để gửi yêu cầu mở lại) - Kèm ảnh từ variants
const getMultipleInactiveProductReviewsInfo = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return []
  const placeholders = reviewIds.map(() => '?').join(',')
  const query = `
    SELECT pr.id, pr.comment, pr.rating, pr.product_id, p.name AS product_name, pr.images, pr.is_active,
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
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    WHERE pr.id IN (${placeholders}) AND p.store_id = ? AND pr.is_active = FALSE
  `
  const [rows] = await pool.execute(query, [...reviewIds, storeId])

  // Parse variants cho từng row
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

// 17. Lấy thông tin chi tiết nhiều đánh giá cửa hàng đang bị ẩn (để gửi yêu cầu mở lại)
const getMultipleInactiveStoreReviewsInfo = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return []
  const placeholders = reviewIds.map(() => '?').join(',')
  const query = `
    SELECT id, comment, rating, store_id, is_active
    FROM store_reviews
    WHERE id IN (${placeholders}) AND store_id = ? AND is_active = FALSE
  `
  const [rows] = await pool.execute(query, [...reviewIds, storeId])
  return rows
}

export const vendorReviewModel = {
  getStoreByOwnerId,
  getProductReviews,
  countProductReviews,
  getStoreReviews,
  countStoreReviews,
  getProductReviewDetail,
  getStoreReviewDetail,
  reportProductReview,
  reportStoreReview,
  getReviewsOverviewStats,
  checkMultipleProductReviewsOwnership,
  reportProductReviewsBulk,
  checkMultipleStoreReviewsOwnership,
  reportStoreReviewsBulk,
  requestProductReviewReopenBulk,
  requestStoreReviewReopenBulk,
  getMultipleProductReviewsInfo,
  getMultipleStoreReviewsInfo,
  getMultipleInactiveProductReviewsInfo,
  getMultipleInactiveStoreReviewsInfo
}