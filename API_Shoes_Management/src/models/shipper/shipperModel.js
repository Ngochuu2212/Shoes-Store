import pool from '~/config/db'
import { ORDER_STATUS } from '~/utils/constants'

// Lấy danh sách đơn chờ shipper nhận (waiting_for_shipper)
const getAvailableOrders = async ({ limit, offset }) => {
  const query = `
    SELECT o.id, o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method, o.status,
           o.payment_method, o.payment_status, o.created_at,
           s.name AS store_name, s.address AS store_address
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.status = ? AND o.shipper_id IS NULL
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [ORDER_STATUS.WAITING_FOR_SHIPPER, String(limit), String(offset)])
  return rows
}

const countAvailableOrders = async () => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders WHERE status = ? AND shipper_id IS NULL',
    [ORDER_STATUS.WAITING_FOR_SHIPPER]
  )
  return rows[0].total
}

// Shipper nhận đơn: gán shipper_id + chuyển sang accepted_by_shipper
const acceptOrder = async (orderId, shipperId) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Kiểm tra đơn vẫn đang chờ và chưa ai nhận
    const [rows] = await connection.execute(
      'SELECT id, status, shipper_id FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    )
    if (rows.length === 0) throw new Error('Đơn hàng không tồn tại.')
    if (rows[0].status !== ORDER_STATUS.WAITING_FOR_SHIPPER) throw new Error('Đơn hàng không còn ở trạng thái chờ shipper.')
    if (rows[0].shipper_id !== null) throw new Error('Đơn hàng đã được shipper khác nhận.')

    await connection.execute(
      `UPDATE orders 
       SET status = ?, shipper_id = ?, delivery_accepted_at = NOW()
       WHERE id = ?`,
      [ORDER_STATUS.ACCEPTED_BY_SHIPPER, shipperId, orderId]
    )

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Lấy danh sách đơn của shipper (accepted, shipping, delivered)
const getMyDeliveries = async (shipperId, { limit, offset }) => {
  const query = `
    SELECT o.id, o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method, o.status,
           o.payment_method, o.payment_status, o.created_at,
           o.delivery_accepted_at, o.delivery_started_at, o.delivery_completed_at,
           o.delivery_proof_images,
           s.name AS store_name
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.shipper_id = ? AND o.status IN (?,?,?)
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [
    shipperId,
    ORDER_STATUS.ACCEPTED_BY_SHIPPER,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
    String(limit), String(offset)
  ])
  return rows
}

const countMyDeliveries = async (shipperId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders WHERE shipper_id = ? AND status IN (?,?,?)',
    [shipperId, ORDER_STATUS.ACCEPTED_BY_SHIPPER, ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED]
  )
  return rows[0].total
}

// Lịch sử giao hàng (completed + cancelled có shipper_id)
const getDeliveryHistory = async (shipperId, { limit, offset }) => {
  const query = `
    SELECT o.id, o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method, o.status,
           o.payment_method, o.payment_status, o.created_at,
           o.delivery_accepted_at, o.delivery_started_at, o.delivery_completed_at,
           o.delivery_proof_images, o.delivery_note,
           s.name AS store_name
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.shipper_id = ? AND o.status IN (?,?)
    ORDER BY o.delivery_completed_at DESC, o.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [
    shipperId,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
    String(limit), String(offset)
  ])
  return rows
}

const countDeliveryHistory = async (shipperId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders WHERE shipper_id = ? AND status IN (?,?)',
    [shipperId, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]
  )
  return rows[0].total
}

// Lấy chi tiết một đơn hàng cho shipper
const getOrderDetail = async (orderId, shipperId) => {
  // Cho phép xem nếu là shipper của đơn này HOẶC đơn đang chờ (waiting_for_shipper)
  const query = `
    SELECT o.id, o.user_id, o.store_id, o.shipper_id,
           o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method,
           o.status, o.payment_method, o.payment_status,
           o.cancel_reason, o.created_at,
           o.delivery_accepted_at, o.delivery_started_at, o.delivery_completed_at,
           o.delivery_proof_images, o.delivery_note,
           s.name AS store_name, s.address AS store_address, s.phone AS store_phone
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.id = ? AND (o.shipper_id = ? OR (o.status = ? AND o.shipper_id IS NULL))
  `
  const [rows] = await pool.execute(query, [orderId, shipperId, ORDER_STATUS.WAITING_FOR_SHIPPER])
  if (rows.length === 0) return null

  const order = rows[0]

  // Parse delivery_proof_images
  if (order.delivery_proof_images && typeof order.delivery_proof_images === 'string') {
    try { order.delivery_proof_images = JSON.parse(order.delivery_proof_images) } catch { order.delivery_proof_images = [] }
  }

  // Lấy order items
  const itemsQuery = `
    SELECT oi.id, oi.variant_id, p.name AS product_name, p.images AS product_images,
           oi.quantity, oi.price, v.size, v.color, v.image AS variant_image
    FROM order_items oi
    JOIN product_variants v ON oi.variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [items] = await pool.execute(itemsQuery, [orderId])
  order.items = items.map(item => {
    let parsedImages = []
    try { parsedImages = typeof item.product_images === 'string' ? JSON.parse(item.product_images) : item.product_images || [] } catch { parsedImages = [] }
    return { ...item, images: parsedImages }
  })

  return order
}

// Shipper bắt đầu giao hàng
const startDelivery = async (orderId, shipperId) => {
  const [result] = await pool.execute(
    'UPDATE orders SET status = ?, delivery_started_at = NOW() WHERE id = ? AND shipper_id = ? AND status = ?',
    [ORDER_STATUS.SHIPPING, orderId, shipperId, ORDER_STATUS.ACCEPTED_BY_SHIPPER]
  )
  return result.affectedRows > 0
}

// Shipper đánh dấu đã giao (delivered) - bước trước khi upload proof
const markDelivered = async (orderId, shipperId) => {
  const [result] = await pool.execute(
    'UPDATE orders SET status = ? WHERE id = ? AND shipper_id = ? AND status = ?',
    [ORDER_STATUS.DELIVERED, orderId, shipperId, ORDER_STATUS.SHIPPING]
  )
  return result.affectedRows > 0
}

// Lưu ảnh minh chứng giao hàng
const saveDeliveryProof = async (orderId, shipperId, imageUrls, note) => {
  const [result] = await pool.execute(
    'UPDATE orders SET delivery_proof_images = ?, delivery_note = ? WHERE id = ? AND shipper_id = ? AND status = ?',
    [JSON.stringify(imageUrls), note || null, orderId, shipperId, ORDER_STATUS.DELIVERED]
  )
  return result.affectedRows > 0
}

// Hoàn tất giao hàng - credit vendor store balance
const completeDelivery = async (orderId, shipperId) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute(
      'SELECT o.id, o.store_id, o.total_amount, o.commission_rate_snapshot, o.delivery_proof_images, o.status FROM orders o WHERE o.id = ? AND o.shipper_id = ?',
      [orderId, shipperId]
    )
    if (rows.length === 0) throw new Error('Đơn hàng không tồn tại hoặc không thuộc quyền của bạn.')

    const order = rows[0]
    if (order.status !== ORDER_STATUS.DELIVERED) throw new Error('Đơn hàng chưa ở trạng thái "Đã giao". Không thể hoàn tất.')

    let proofImages = order.delivery_proof_images
    if (typeof proofImages === 'string') {
      try { proofImages = JSON.parse(proofImages) } catch { proofImages = [] }
    }
    if (!proofImages || proofImages.length === 0) throw new Error('Bạn phải upload ảnh minh chứng giao hàng trước khi hoàn tất đơn.')

    const totalAmount = Number(order.total_amount)
    const commissionRate = Number(order.commission_rate_snapshot) || 10
    const adminCommission = totalAmount * (commissionRate / 100)
    const vendorNetProfit = totalAmount - adminCommission

    // Cập nhật trạng thái hoàn thành + thanh toán
    await connection.execute(
      `UPDATE orders SET status = ?, payment_status = 'paid', delivery_completed_at = NOW() WHERE id = ?`,
      [ORDER_STATUS.COMPLETED, orderId]
    )

    // Credit doanh thu vào ví store
    await connection.execute(
      'UPDATE stores SET balance = balance + ? WHERE id = ?',
      [vendorNetProfit, order.store_id]
    )

    await connection.commit()
    return { adminCommission, vendorNetProfit }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Thống kê dashboard của shipper
const getDashboardStats = async (shipperId) => {
  const [rows] = await pool.execute(`
    SELECT
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS waitingOrders,
      SUM(CASE WHEN status IN (?,?,?) AND shipper_id = ? THEN 1 ELSE 0 END) AS activeDeliveries,
      SUM(CASE WHEN status = ? AND shipper_id = ? THEN 1 ELSE 0 END) AS completedToday,
      SUM(CASE WHEN status = ? AND shipper_id = ? THEN 1 ELSE 0 END) AS totalCompleted
    FROM orders
  `, [
    ORDER_STATUS.WAITING_FOR_SHIPPER,
    ORDER_STATUS.ACCEPTED_BY_SHIPPER, ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED, shipperId,
    ORDER_STATUS.COMPLETED, shipperId,
    ORDER_STATUS.COMPLETED, shipperId
  ])
  return {
    waitingOrders: Number(rows[0].waitingOrders) || 0,
    activeDeliveries: Number(rows[0].activeDeliveries) || 0,
    completedToday: Number(rows[0].completedToday) || 0,
    totalCompleted: Number(rows[0].totalCompleted) || 0
  }
}

export const shipperModel = {
  getAvailableOrders,
  countAvailableOrders,
  acceptOrder,
  getMyDeliveries,
  countMyDeliveries,
  getDeliveryHistory,
  countDeliveryHistory,
  getOrderDetail,
  startDelivery,
  markDelivered,
  saveDeliveryProof,
  completeDelivery,
  getDashboardStats
}
