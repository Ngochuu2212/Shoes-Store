import pool from '~/config/db'
import { ORDER_STATUS } from '~/utils/constants'

// 1. USER lấy lịch sử đơn hàng
const getOrderHistoryPaginated = async (userId, page, limit, status) => {
  const offset = (page - 1) * limit
  let queryData = `
    SELECT o.id AS order_id, o.store_id, o.recipient_name, o.recipient_phone, 
           o.total_amount, o.discount_amount, o.wallet_amount_used, o.shipping_address, 
           o.status, o.payment_status, o.payment_method, o.created_at,
           o.applied_voucher, o.cancel_reason, o.shipping_fee, o.shipping_method,
           s.name AS store_name, s.logo AS store_logo,
           (EXISTS (SELECT 1 FROM product_reviews pr WHERE pr.order_id = o.id)) AS is_reviewed
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    WHERE o.user_id = ?
  `
  let queryCount = 'SELECT COUNT(*) AS total FROM orders o WHERE o.user_id = ?'
  let params = [userId]

  if (status && status !== 'all') {
    queryData += ' AND o.status = ?'
    queryCount += ' AND o.status = ?'
    params.push(status)
  }

  queryData += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'

  const [countResult] = await pool.execute(queryCount, params)
  const total = countResult[0].total

  const finalParams = [...params, String(limit), String(offset)]
  const [orders] = await pool.execute(queryData, finalParams)

  return { orders, total }
}

// 2. USER: Lấy chi tiết các đôi giày nằm trong đơn hàng đó để hiển thị lên UI
const getOrderItemsByOrderId = async (orderId, conn = null) => {
  const connection = conn || pool
  const query = `
    SELECT 
      oi.id AS item_id, 
      oi.quantity, 
      oi.price, 
      pv.size, 
      pv.color, 
      pv.image AS variant_image, 
      p.name AS product_name, 
      p.images AS product_images, 
      p.slug,
      pv.id AS variant_id,
      p.id AS product_id
    FROM order_items oi
    INNER JOIN product_variants pv ON oi.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [items] = await connection.execute(query, [orderId])

  // Parse variant_image nếu là string JSON
  return items.map(item => {
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
      variant_id: item.variant_id || null,
      product_id: item.product_id || null,
      quantity: item.quantity || 0,
      variant_image: parsedVariantImage,
      product_images: parsedProductImages
    }
  })
}

// 3. USER: Tìm thông tin một đơn hàng (Bổ sung đầy đủ các trường dữ liệu bọc lót đối soát)
const getOrderById = async (orderId) => {
  const query = 'SELECT * FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0]
}

// 4. USER: Cập nhật trạng thái khi USER bấm hủy đơn
const updateOrderStatus = async (orderId, status) => {
  const query = 'UPDATE orders SET status = ? WHERE id = ?'
  const [result] = await pool.execute(query, [status, orderId])
  return result
}

// 5. HỆ THỐNG (CRON JOB): Tự động xác nhận đơn hàng sau 30 phút
const autoConfirmOrders = async () => {
  const query = `
    UPDATE orders 
    SET status = ? 
    WHERE status = ? 
    AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 30
  `
  const [result] = await pool.execute(query, [ORDER_STATUS.PROCESSING, ORDER_STATUS.PENDING])
  return result.affectedRows
}

// 6. Rút yêu cầu hủy đơn hàng
const withdrawCancelOrder = async (orderId) => {
  const query = 'UPDATE orders SET status = ? WHERE id = ?'
  const [result] = await pool.execute(query, [ORDER_STATUS.PROCESSING, orderId])
  return result
}

// 7. Lấy số lượng đơn hàng theo từng trạng thái
const getOrderStatusCounts = async (userId) => {
  const query = `
    SELECT status, COUNT(*) as count
    FROM orders
    WHERE user_id = ?
    GROUP BY status
  `
  const [rows] = await pool.execute(query, [userId])
  return rows
}

// 8. Lấy chi tiết đơn hàng theo orderId và userId
const getOrderDetailByIdAndUser = async (orderId, userId) => {
  const query = `
    SELECT o.id AS order_id, o.store_id, o.recipient_name, o.recipient_phone, 
           o.shipping_address, o.total_amount, o.discount_amount, o.applied_voucher,
           o.status, o.cancel_reason, o.payment_status, o.payment_method, o.created_at,
           o.wallet_amount_used, o.shipping_fee, o.shipping_method, o.delivery_proof_images,
           s.name AS store_name, s.logo AS store_logo
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    WHERE o.id = ? AND o.user_id = ?
  `
  const [rows] = await pool.execute(query, [orderId, userId])
  return rows[0]
}

// 9. Cập nhật trạng thái đơn hàng kèm lý do hủy
const updateOrderStatusWithReason = async (orderId, status, cancelReason = null, conn = null) => {
  const connection = conn || pool

  const reason = (cancelReason && typeof cancelReason === 'string' && cancelReason.trim())
    ? cancelReason.trim()
    : null

  const query = 'UPDATE orders SET status = ?, cancel_reason = ? WHERE id = ?'
  const queryParams = [status, reason, orderId]

  const [result] = await connection.execute(query, queryParams)
  return result
}

// 10. Rút yêu cầu hủy và xóa lý do hủy
const withdrawCancelOrderAndClearReason = async (orderId) => {
  const query = 'UPDATE orders SET status = ?, cancel_reason = NULL WHERE id = ?'
  const [result] = await pool.execute(query, [ORDER_STATUS.PROCESSING, orderId])
  return result
}

// 11. Kiểm tra đơn hàng có thuộc quyền sở hữu của user không
const checkOrderOwnership = async (orderId, userId) => {
  const query = 'SELECT id FROM orders WHERE id = ? AND user_id = ?'
  const [rows] = await pool.execute(query, [orderId, userId])
  return rows.length > 0
}

// 12. Lấy trạng thái hiện tại của đơn hàng
const getOrderCurrentStatus = async (orderId) => {
  const query = 'SELECT status FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0]?.status || null
}

const deletePendingOrder = async (orderId, conn = null) => {
  const connection = conn || pool

  try {
    await connection.beginTransaction()

    // Xóa order_items
    await connection.execute('DELETE FROM order_items WHERE order_id = ?', [orderId])

    // Xóa order (chỉ xóa nếu đang ở trạng thái pending)
    await connection.execute('DELETE FROM orders WHERE id = ? AND status = ?', [orderId, ORDER_STATUS.PENDING])

    await connection.commit()
    return { success: true, message: 'Đã xóa đơn hàng pending' }
  } catch (error) {
    await connection.rollback()
    throw error
  }
}

export const orderTrackingModel = {
  getOrderHistoryPaginated,
  getOrderItemsByOrderId,
  getOrderById,
  updateOrderStatus,
  autoConfirmOrders,
  withdrawCancelOrder,
  getOrderStatusCounts,
  getOrderDetailByIdAndUser,
  updateOrderStatusWithReason,
  withdrawCancelOrderAndClearReason,
  checkOrderOwnership,
  getOrderCurrentStatus,
  deletePendingOrder
}