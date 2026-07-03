import pool from '~/config/db'
import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constants'

// 1. Admin lấy danh sách đơn hàng toàn sàn
const getAllOrdersSystem = async ({ status, paymentStatus, searchOrderId, startDate, endDate, limit, offset }) => {
  let query = `
    SELECT 
      o.id AS order_id, 
      o.user_id, 
      o.store_id, 
      o.total_amount, 
      o.discount_amount,
      o.status, 
      o.payment_status, 
      o.payment_method, 
      o.created_at,
      o.cancel_reason,
      o.recipient_name,
      o.recipient_phone,
      o.shipping_address,
      s.name AS store_name,
      s.logo AS store_logo,
      u.fullname AS buyer_name,
      u.avatar AS buyer_avatar
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    INNER JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (status) {
    query += ' AND o.status = ?'
    queryParams.push(status)
  }
  if (paymentStatus) {
    query += ' AND o.payment_status = ?'
    queryParams.push(paymentStatus)
  }
  if (searchOrderId) {
    query += ' AND o.id = ?'
    queryParams.push(Number(searchOrderId))
  }
  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số đơn hàng
const countAllOrdersSystem = async ({ status, paymentStatus, searchOrderId, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) AS total FROM orders WHERE 1=1'
  const queryParams = []

  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }
  if (paymentStatus) {
    query += ' AND payment_status = ?'
    queryParams.push(paymentStatus)
  }
  if (searchOrderId) {
    query += ' AND id = ?'
    queryParams.push(Number(searchOrderId))
  }
  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0]?.total || 0
}

// 3. Xem chi tiết một đơn hàng
const getOrderDetailSystem = async (orderId) => {
  const orderQuery = `
    SELECT 
      o.*, 
      s.name AS store_name, 
      s.logo AS store_logo,
      s.address AS store_address,
      u.fullname AS buyer_name, 
      u.email AS buyer_email,
      u.phone AS buyer_phone,
      u.avatar AS buyer_avatar,
      u.address AS buyer_address,
      -- Thông tin người nhận (từ order)
      o.recipient_name,
      o.recipient_phone,
      o.shipping_address,
      -- Thông tin chủ cửa hàng
      owner.fullname AS owner_name,
      owner.phone AS owner_phone,
      owner.email AS owner_email
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    INNER JOIN users u ON o.user_id = u.id
    LEFT JOIN users owner ON s.owner_id = owner.id
    WHERE o.id = ?
  `
  const [orderRows] = await pool.execute(orderQuery, [orderId])
  const order = orderRows[0]

  if (!order) return null

  const itemsQuery = `
    SELECT 
      oi.id AS item_id, 
      oi.variant_id, 
      oi.quantity, 
      oi.price, 
      pv.size, 
      pv.color, 
      pv.image AS variant_image,
      p.name AS product_name,
      p.images AS product_images,
      -- Lấy tất cả variants của sản phẩm để FE match ảnh
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv2.id,
            'size', pv2.size,
            'color', pv2.color,
            'stock', pv2.stock,
            'image', pv2.image
          )
        )
        FROM product_variants pv2
        WHERE pv2.product_id = p.id
      ) AS all_variants
    FROM order_items oi
    INNER JOIN product_variants pv ON oi.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [items] = await pool.execute(itemsQuery, [orderId])

  // Parse dữ liệu cho từng item
  order.items = items.map(item => {
    // Parse variant_image
    let parsedVariantImage = item.variant_image
    if (item.variant_image && typeof item.variant_image === 'string') {
      try {
        parsedVariantImage = JSON.parse(item.variant_image)
      } catch (e) {
        parsedVariantImage = null
      }
    }

    // Parse product_images
    let parsedProductImages = item.product_images
    if (item.product_images && typeof item.product_images === 'string') {
      try {
        parsedProductImages = JSON.parse(item.product_images)
      } catch (e) {
        parsedProductImages = []
      }
    }

    let allVariants = []
    if (item.all_variants) {
      try {
        allVariants = typeof item.all_variants === 'string'
          ? JSON.parse(item.all_variants)
          : item.all_variants
        // Parse image trong từng variant
        allVariants = allVariants.map(variant => {
          if (variant.image && typeof variant.image === 'string') {
            try {
              variant.image = JSON.parse(variant.image)
            } catch (e) {
              variant.image = null
            }
          }
          return variant
        })
      } catch (e) {
        allVariants = []
      }
    }

    return {
      ...item,
      variant_image: parsedVariantImage,
      product_images: parsedProductImages,
      all_variants: allVariants
    }
  })

  return order
}

// 4. Ép hủy đơn + Lật trạng thái hoàn tiền + Hoàn kho
const forceCancelOrderTransaction = async (orderId, adminNote) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [orderRows] = await connection.execute(
      'SELECT payment_status FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    )
    const order = orderRows[0]
    if (!order) throw new Error('Đơn hàng không tồn tại trên hệ thống.')

    const nextPaymentStatus = order.payment_status === PAYMENT_STATUS.PAID
      ? PAYMENT_STATUS.REFUNDED
      : order.payment_status

    await connection.execute(
      `UPDATE orders 
       SET status = ?, payment_status = ?, cancel_reason = ? 
       WHERE id = ?`,
      [ORDER_STATUS.CANCELLED, nextPaymentStatus, `[ADMIN FORCE CANCEL] ${adminNote}`, orderId]
    )

    const [items] = await connection.execute(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    )

    for (const item of items) {
      await connection.execute(
        'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.variant_id]
      )
    }

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Thống kê nhanh số liệu đơn hàng toàn sàn
const getOrdersOverviewStatsSystem = async () => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processingOrders,
      SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shippedOrders,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders,
      COUNT(id) AS totalOrders 
    FROM orders
  `
  const [rows] = await pool.execute(query)

  return {
    pendingOrders: Number(rows[0].pendingOrders) || 0,
    processingOrders: Number(rows[0].processingOrders) || 0,
    shippedOrders: Number(rows[0].shippedOrders) || 0,
    deliveredOrders: Number(rows[0].deliveredOrders) || 0,
    cancelledOrders: Number(rows[0].cancelledOrders) || 0,
    totalOrders: Number(rows[0].totalOrders) || 0
  }
}

export const adminOrderModel = {
  getAllOrdersSystem,
  countAllOrdersSystem,
  getOrderDetailSystem,
  forceCancelOrderTransaction,
  getOrdersOverviewStatsSystem
}