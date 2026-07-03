import pool from '~/config/db'

const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Lấy danh sách sản phẩm kèm lượt tim + Đa bộ lọc nâng cao
const getMostFavoritedProducts = async (storeId, { search, categoryId, isActive, minFavorites, maxFavorites, limit, offset }) => {
  let query = `
    SELECT p.id, p.name, p.slug, p.price, p.sold, p.rating_avg, p.images, p.is_active, p.category_id,
           c.name AS category_name,
           COUNT(f.product_id) AS total_favorites,
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
    LEFT JOIN favorites f ON p.id = f.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND p.is_active = ?'
    queryParams.push(Number(isActive))
  }

  query += ' GROUP BY p.id, p.name, p.slug, p.price, p.sold, p.rating_avg, p.images, p.is_active, p.category_id, c.name'

  // Lọc theo số lượng tim sau khi đã GROUP BY (Dùng HAVING)
  if (minFavorites) {
    query += ' HAVING total_favorites >= ?'
    queryParams.push(Number(minFavorites))
  }
  if (maxFavorites) {
    query += minFavorites ? ' AND total_favorites <= ?' : ' HAVING total_favorites <= ?'
    queryParams.push(Number(maxFavorites))
  }

  query += ' ORDER BY total_favorites DESC, p.created_at DESC LIMIT ? OFFSET ?'
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

// 2. Đếm tổng số dòng thỏa mãn bộ lọc để phân trang chuẩn
const countFavoritedProductsUnique = async (storeId, { search, categoryId, isActive }) => {
  let query = 'SELECT COUNT(*) as total FROM products WHERE store_id = ?'
  const queryParams = [storeId]

  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Thống kê siêu Widget (Tìm đôi giày nhiều tim nhất + Tổng số lượt tim)
const getFavoritesOverviewStats = async (storeId) => {
  const queryStats = `
    SELECT 
      COUNT(f.product_id) AS totalStoreFavorites,
      COUNT(DISTINCT f.product_id) AS uniqueProductsFavorited
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE p.store_id = ?
  `
  const queryTopProduct = `
    SELECT p.name, COUNT(f.product_id) AS total_favorites
    FROM products p
    JOIN favorites f ON p.id = f.product_id
    WHERE p.store_id = ?
    GROUP BY p.id
    ORDER BY total_favorites DESC
    LIMIT 1
  `

  const [[rowsStats], [rowsTop]] = await Promise.all([
    pool.execute(queryStats, [storeId]),
    pool.execute(queryTopProduct, [storeId])
  ])

  return {
    totalFavoritesAllTime: Number(rowsStats[0].totalStoreFavorites) || 0,
    uniqueProductsFavorited: Number(rowsStats[0].uniqueProductsFavorited) || 0,
    mostFavoritedProduct: rowsTop[0] ? `${rowsTop[0].name} (${rowsTop[0].total_favorites})` : 'Chưa có'
  }
}

// 4. Lấy danh sách chi tiết những khách hàng đã thả tim vào một sản phẩm cụ thể (Có phân trang)
const getUsersWhoFavoritedProduct = async (productId, { limit, offset }) => {
  const query = `
    SELECT f.user_id, u.fullname, u.email, u.avatar, f.product_id, p.name AS product_name, p.slug AS product_slug
    FROM favorites f
    JOIN users u ON f.user_id = u.id
    JOIN products p ON f.product_id = p.id
    WHERE f.product_id = ?
    ORDER BY u.fullname ASC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [productId, String(limit), String(offset)])
  return rows
}

// 5. Đếm tổng số lượng khách hàng đã thả tim vào sản phẩm đó để tính tổng số trang
const countUsersWhoFavoritedProduct = async (productId) => {
  const query = 'SELECT COUNT(*) AS total FROM favorites WHERE product_id = ?'
  const [rows] = await pool.execute(query, [productId])
  return rows[0].total
}

// 6. Kiểm tra xem một sản phẩm bất kỳ có thuộc quyền sở hữu của Store này không
const checkProductBelongsToStore = async (productId, storeId) => {
  const query = 'SELECT id FROM products WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [productId, storeId])
  return rows.length > 0
}

export const vendorFavoriteModel = {
  getStoreByOwnerId,
  getMostFavoritedProducts,
  countFavoritedProductsUnique,
  getFavoritesOverviewStats,
  getUsersWhoFavoritedProduct,
  countUsersWhoFavoritedProduct,
  checkProductBelongsToStore
}