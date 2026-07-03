import pool from '~/config/db'

const getReviewsByProductSlug = async (slug) => {
  const query = `
    SELECT 
      pr.id AS review_id,
      pr.rating,
      pr.comment,
      pr.images AS review_images,
      pr.created_at,
      u.fullname AS user_name,
      u.avatar AS user_avatar
    FROM product_reviews pr
    INNER JOIN products p ON pr.product_id = p.id
    LEFT JOIN users u ON pr.user_id = u.id
    WHERE p.slug = ? AND p.is_active = TRUE
    ORDER BY pr.created_at DESC
  `
  const [rows] = await pool.execute(query, [slug])
  return rows
}

const getOrderItemsWithVariants = async (orderId) => {
  const query = `
    SELECT 
      oi.id AS item_id,
      oi.quantity,
      oi.price,
      pv.size,
      pv.color,
      pv.image AS variant_image,
      p.id AS product_id,
      p.name AS product_name,
      p.slug,
      p.images AS product_images
    FROM order_items oi
    INNER JOIN product_variants pv ON oi.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [rows] = await pool.execute(query, [orderId])

  // Parse variant_image và product_images
  return rows.map(item => {
    let parsedVariantImage = item.variant_image
    if (item.variant_image && typeof item.variant_image === 'string') {
      try {
        parsedVariantImage = JSON.parse(item.variant_image)
      } catch (e) {
        parsedVariantImage = null
      }
    }

    let parsedProductImages = item.product_images
    if (item.product_images && typeof item.product_images === 'string') {
      try {
        parsedProductImages = JSON.parse(item.product_images)
      } catch (e) {
        parsedProductImages = []
      }
    }

    return {
      ...item,
      variant_image: parsedVariantImage,
      product_images: parsedProductImages
    }
  })
}

const getOrderForReview = async (orderId, userId) => {
  const query = 'SELECT id, status, store_id FROM orders WHERE id = ? AND user_id = ?'
  const [rows] = await pool.execute(query, [orderId, userId])
  return rows[0]
}

// 3. Lấy danh sách các sản phẩm (product_id) nằm trong đơn hàng đó dựa vào variant_id
const getProductIdsByOrderId = async (orderId) => {
  const query = `
    SELECT DISTINCT pv.product_id 
    FROM order_items oi
    INNER JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE oi.order_id = ?
  `
  const [rows] = await pool.execute(query, [orderId])
  return rows
}

// 4. Thêm một bản ghi đánh giá mới vào DB
const createProductReview = async (connection, { userId, productId, orderId, rating, comment, images }) => {
  const query = `
    INSERT INTO product_reviews (user_id, product_id, order_id, rating, comment, images) 
    VALUES (?, ?, ?, ?, ?, ?)
  `
  // Ép mảng images thành chuỗi JSON string để lưu vào cột JSON dưới DB
  await connection.execute(query, [userId, productId, orderId, rating, comment, JSON.stringify(images)])
}

// 5. Tự động tính toán lại điểm trung bình rating_avg của sản phẩm sau khi có người đánh giá mới
const updateProductRatingAvg = async (connection, productId) => {
  const query = `
    UPDATE products 
    SET rating_avg = (SELECT AVG(rating) FROM product_reviews WHERE product_id = ?) 
    WHERE id = ?
  `
  await connection.execute(query, [productId, productId])
}

const createStoreReview = async (connection, { userId, storeId, orderId, rating, comment }) => {
  const query = `
    INSERT INTO store_reviews (user_id, store_id, order_id, rating, comment) 
    VALUES (?, ?, ?, ?, ?)
  `
  await connection.execute(query, [userId, storeId, orderId, rating, comment])
}

const updateStoreRatingAvg = async (connection, storeId) => {
  const query = `
    UPDATE stores 
    SET rating_average = (SELECT AVG(rating) FROM store_reviews WHERE store_id = ?) 
    WHERE id = ?
  `
  await connection.execute(query, [storeId, storeId])
}

export const reviewModel = {
  getReviewsByProductSlug,
  getOrderForReview,
  getProductIdsByOrderId,
  createProductReview,
  updateProductRatingAvg,
  createStoreReview,
  updateStoreRatingAvg,
  getOrderItemsWithVariants
}