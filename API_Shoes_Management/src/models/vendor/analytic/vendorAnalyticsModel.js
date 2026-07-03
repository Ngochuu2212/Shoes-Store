import pool from '~/config/db'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active, commission_rate FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Thống kê số liệu tổng quan (Widgets đầu trang)
const getRevenueOverview = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      IFNULL(SUM(total_amount), 0) AS totalRevenue,
      COUNT(id) AS totalOrdersSuccess
    FROM orders
    WHERE store_id = ? AND status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return {
    totalRevenue: Number(rows[0].totalRevenue),
    totalOrdersSuccess: Number(rows[0].totalOrdersSuccess)
  }
}

// 2. Thống kê tổng số lượng đôi giày đã bán ra thực tế
const getTotalProductsSold = async (storeId, startDate, endDate) => {
  let query = `
    SELECT IFNULL(SUM(oi.quantity), 0) AS totalProductSold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ? AND o.status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return Number(rows[0].totalProductSold)
}

// 3. Lấy dữ liệu doanh thu theo từng ngày để Frontend vẽ biểu đồ (Line/Bar Chart)
const getRevenueChartData = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      DATE(created_at) AS date,
      IFNULL(SUM(total_amount), 0) AS dailyRevenue,
      COUNT(id) AS dailyOrders
    FROM orders
    WHERE store_id = ? AND status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC'

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 4. Top 5 sản phẩm bán chạy nhất kèm doanh thu và ảnh từ variants
const getTopSellingProducts = async (storeId, startDate, endDate) => {
  // 1. Lấy danh sách top products (chỉ lấy sản phẩm thuộc store)
  let query = `
    SELECT 
      p.id, 
      p.name, 
      p.images,
      IFNULL(SUM(oi.quantity), 0) AS total_sold,
      IFNULL(SUM(oi.quantity * oi.price), 0) AS total_revenue
    FROM order_items oi
    JOIN product_variants pv ON oi.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ? 
      AND o.status = 'delivered'
      AND p.store_id = ? 
  `
  const queryParams = [storeId, storeId]

  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += `
    GROUP BY p.id
    ORDER BY total_sold DESC, total_revenue DESC
    LIMIT 5
  `

  const [rows] = await pool.execute(query, queryParams)

  // 2. Lấy variants cho từng product (cũng kiểm tra store_id)
  if (rows.length > 0) {
    const productIds = rows.map(p => p.id)
    const placeholders = productIds.map(() => '?').join(',')
    const vQuery = `
      SELECT pv.product_id, pv.id, pv.size, pv.color, pv.stock, pv.image 
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.product_id IN (${placeholders}) 
        AND p.store_id = ?  
    `
    const [variantRows] = await pool.execute(vQuery, [...productIds, storeId])

    // Group variants theo product_id
    const variantsMap = {}
    variantRows.forEach(v => {
      if (!variantsMap[v.product_id]) {
        variantsMap[v.product_id] = []
      }

      let parsedImage = v.image
      if (v.image) {
        if (typeof v.image === 'string') {
          try {
            parsedImage = JSON.parse(v.image)
          } catch (e) {
            parsedImage = null
          }
        }
        // Nếu đã là object thì giữ nguyên
      } else {
        parsedImage = null
      }

      variantsMap[v.product_id].push({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        image: parsedImage
      })
    })

    // Gắn variants vào từng product
    return rows.map(row => ({
      ...row,
      variants: variantsMap[row.id] || []
    }))
  }

  return rows
}

// 5. Thống kê doanh thu theo Danh mục (Phục vụ vẽ Pie Chart)
const getRevenueByCategory = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      IFNULL(SUM(oi.quantity * oi.price), 0) AS revenue
    FROM order_items oi
    JOIN product_variants pv ON oi.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ? AND o.status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' GROUP BY c.id'

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 6. KIỂM TRA SẢN PHẨM CÓ THUỘC CỬA HÀNG KHÔNG
const checkProductBelongsToStore = async (productId, storeId) => {
  const query = 'SELECT id FROM products WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [productId, storeId])
  return rows.length > 0
}

// 7. KIỂM TRA NHIỀU SẢN PHẨM CÓ THUỘC CỬA HÀNG KHÔNG
const checkMultipleProductsBelongsToStore = async (productIds, storeId) => {
  if (!productIds || productIds.length === 0) return false
  const query = 'SELECT COUNT(*) AS count FROM products WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [productIds, storeId])
  return rows[0].count === productIds.length
}

export const vendorAnalyticsModel = {
  getStoreByOwnerId,
  getRevenueOverview,
  getTotalProductsSold,
  getRevenueChartData,
  getTopSellingProducts,
  getRevenueByCategory,
  checkProductBelongsToStore,
  checkMultipleProductsBelongsToStore
}