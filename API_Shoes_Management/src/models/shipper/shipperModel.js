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
    WHERE o.status IN (?, ?) AND o.shipper_id IS NULL
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [
    ORDER_STATUS.WAITING_FOR_SHIPPER,
    ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER,
    String(limit), String(offset)
  ])
  return rows
}

const countAvailableOrders = async () => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders WHERE status IN (?, ?) AND shipper_id IS NULL',
    [ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER]
  )
  return rows[0].total
}

// Shipper nhận đơn: gán shipper_id + chuyển sang accepted_by_shipper / return_accepted_by_shipper
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
    if (
      rows[0].status !== ORDER_STATUS.WAITING_FOR_SHIPPER && 
      rows[0].status !== ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER
    ) {
      throw new Error('Đơn hàng không còn ở trạng thái chờ shipper.')
    }
    if (rows[0].shipper_id !== null) throw new Error('Đơn hàng đã được shipper khác nhận.')

    const targetStatus = rows[0].status === ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER
      ? ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER
      : ORDER_STATUS.ACCEPTED_BY_SHIPPER

    await connection.execute(
      `UPDATE orders 
       SET status = ?, shipper_id = ?, delivery_accepted_at = NOW()
       WHERE id = ?`,
      [targetStatus, shipperId, orderId]
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

// Lấy danh sách đơn của shipper (accepted, shipping, delivered bao gồm cả Trả hàng)
const getMyDeliveries = async (shipperId, { limit, offset }) => {
  const query = `
    SELECT o.id, o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method, o.status,
           o.payment_method, o.payment_status, o.created_at,
           o.delivery_accepted_at, o.delivery_started_at, o.delivery_completed_at,
           o.delivery_proof_images, o.return_evidence_images,
           s.name AS store_name, s.address AS store_address
     FROM orders o
     LEFT JOIN stores s ON o.store_id = s.id
     WHERE o.shipper_id = ? AND o.status IN (?,?,?,?,?,?)
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?
   `
  const [rows] = await pool.execute(query, [
    shipperId,
    ORDER_STATUS.ACCEPTED_BY_SHIPPER,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER,
    ORDER_STATUS.RETURN_SHIPPING,
    ORDER_STATUS.RETURN_DELIVERED,
    String(limit), String(offset)
  ])
  return rows
}

const countMyDeliveries = async (shipperId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders WHERE shipper_id = ? AND status IN (?,?,?,?,?,?)',
    [
      shipperId,
      ORDER_STATUS.ACCEPTED_BY_SHIPPER,
      ORDER_STATUS.SHIPPING,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER,
      ORDER_STATUS.RETURN_SHIPPING,
      ORDER_STATUS.RETURN_DELIVERED
    ]
  )
  return rows[0].total
}

// Lịch sử giao hàng (completed + cancelled + return_completed có shipper_id)
const getDeliveryHistory = async (shipperId, { limit, offset }) => {
  const query = `
    SELECT o.id, o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method, o.status,
           o.payment_method, o.payment_status, o.created_at,
           o.delivery_accepted_at, o.delivery_started_at, o.delivery_completed_at,
           o.delivery_proof_images, o.return_evidence_images, o.delivery_note,
           s.name AS store_name, s.address AS store_address
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.shipper_id = ? AND o.status IN (?,?,?)
    ORDER BY o.delivery_completed_at DESC, o.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute(query, [
    shipperId,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.RETURN_COMPLETED,
    String(limit), String(offset)
  ])
  return rows
}

const countDeliveryHistory = async (shipperId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM orders WHERE shipper_id = ? AND status IN (?,?,?)',
    [shipperId, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURN_COMPLETED]
  )
  return rows[0].total
}

// Lấy chi tiết một đơn hàng cho shipper
const getOrderDetail = async (orderId, shipperId) => {
  // Cho phép xem nếu là shipper của đơn này HOẶC đơn đang chờ (waiting_for_shipper / return_waiting_for_shipper)
  const query = `
    SELECT o.id, o.user_id, o.store_id, o.shipper_id,
           o.recipient_name, o.recipient_phone, o.shipping_address,
           o.total_amount, o.shipping_fee, o.shipping_method,
           o.status, o.payment_method, o.payment_status,
           o.cancel_reason, o.created_at,
           o.delivery_accepted_at, o.delivery_started_at, o.delivery_completed_at,
           o.delivery_proof_images, o.return_evidence_images, o.delivery_note,
           s.name AS store_name, s.address AS store_address, s.phone AS store_phone
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.id = ? AND (o.shipper_id = ? OR (o.status IN (?, ?) AND o.shipper_id IS NULL))
  `
  const [rows] = await pool.execute(query, [
    orderId,
    shipperId,
    ORDER_STATUS.WAITING_FOR_SHIPPER,
    ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER
  ])
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

// Shipper bắt đầu giao hàng (hoặc bắt đầu đi lấy hàng trả)
const startDelivery = async (orderId, shipperId) => {
  const [order] = await pool.execute('SELECT status FROM orders WHERE id = ? AND shipper_id = ?', [orderId, shipperId])
  if (order.length === 0) return false
  const currentStatus = order[0].status
  const nextStatus = currentStatus === ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER
    ? ORDER_STATUS.RETURN_SHIPPING
    : ORDER_STATUS.SHIPPING

  const [result] = await pool.execute(
    'UPDATE orders SET status = ?, delivery_started_at = NOW() WHERE id = ? AND shipper_id = ?',
    [nextStatus, orderId, shipperId]
  )
  return result.affectedRows > 0
}

// Shipper đánh dấu đã giao hàng (hoặc đã giao trả cho shop) - bước trước khi upload proof
const markDelivered = async (orderId, shipperId) => {
  const [order] = await pool.execute('SELECT status FROM orders WHERE id = ? AND shipper_id = ?', [orderId, shipperId])
  if (order.length === 0) return false
  const currentStatus = order[0].status
  const nextStatus = currentStatus === ORDER_STATUS.RETURN_SHIPPING
    ? ORDER_STATUS.RETURN_DELIVERED
    : ORDER_STATUS.DELIVERED

  const [result] = await pool.execute(
    'UPDATE orders SET status = ? WHERE id = ? AND shipper_id = ?',
    [nextStatus, orderId, shipperId]
  )
  return result.affectedRows > 0
}

// Lưu ảnh minh chứng giao hàng (giao cho khách hoặc giao trả cho shop)
const saveDeliveryProof = async (orderId, shipperId, imageUrls, note) => {
  const [order] = await pool.execute('SELECT status FROM orders WHERE id = ? AND shipper_id = ?', [orderId, shipperId])
  if (order.length === 0) return false
  const currentStatus = order[0].status
  if (currentStatus !== ORDER_STATUS.DELIVERED && currentStatus !== ORDER_STATUS.RETURN_DELIVERED) return false

  const columnName = currentStatus === ORDER_STATUS.RETURN_DELIVERED ? 'return_evidence_images' : 'delivery_proof_images'
  const [result] = await pool.execute(
    `UPDATE orders SET ${columnName} = ?, delivery_note = ? WHERE id = ? AND shipper_id = ?`,
    [JSON.stringify(imageUrls), note || null, orderId, shipperId]
  )
  return result.affectedRows > 0
}

// Hoàn tất giao hàng:
// - Đơn thường: Chuyển COMPLETED + Cộng tiền store
// - Đơn trả hàng: Chuyển RETURN_COMPLETED + Trừ tiền store + Hoàn tiền ví User
const completeDelivery = async (orderId, shipperId) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute(
      'SELECT o.id, o.user_id, o.store_id, o.total_amount, o.commission_rate_snapshot, o.delivery_proof_images, o.return_evidence_images, o.status FROM orders o WHERE o.id = ? AND o.shipper_id = ?',
      [orderId, shipperId]
    )
    if (rows.length === 0) throw new Error('Đơn hàng không tồn tại hoặc không thuộc quyền của bạn.')

    const order = rows[0]
    if (order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.RETURN_DELIVERED) {
      throw new Error('Đơn hàng chưa ở trạng thái "Đã giao" hoặc "Trả hàng - Đã giao Shop". Không thể hoàn tất.')
    }

    const isReturn = order.status === ORDER_STATUS.RETURN_DELIVERED
    let proofImages = isReturn ? order.return_evidence_images : order.delivery_proof_images
    if (typeof proofImages === 'string') {
      try { proofImages = JSON.parse(proofImages) } catch { proofImages = [] }
    }
    if (!proofImages || proofImages.length === 0) throw new Error('Bạn phải upload ảnh minh chứng trước khi hoàn tất đơn.')

    const totalAmount = Number(order.total_amount)
    const commissionRate = Number(order.commission_rate_snapshot) || 10
    const adminCommission = totalAmount * (commissionRate / 100)
    const vendorNetProfit = totalAmount - adminCommission

    if (order.status === ORDER_STATUS.RETURN_DELIVERED) {
      // 1. Cập nhật trạng thái hoàn tất Trả hàng
      await connection.execute(
        `UPDATE orders SET status = ?, delivery_completed_at = NOW() WHERE id = ?`,
        [ORDER_STATUS.RETURN_COMPLETED, orderId]
      )

      // 2. Khấu trừ doanh thu đã cộng trước đó từ ví của shop
      await connection.execute(
        'UPDATE stores SET balance = balance - ? WHERE id = ?',
        [vendorNetProfit, order.store_id]
      )

      // 3. Hoàn lại 100% tiền đơn hàng vào ví người dùng (User)
      await connection.execute(
        'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
        [totalAmount, order.user_id]
      )

      // 4. Lưu vết giao dịch hoàn ví
      await connection.execute(
        'INSERT INTO wallet_transactions (user_id, type, amount, description, order_id) VALUES (?, ?, ?, ?, ?)',
        [order.user_id, 'REFUND', totalAmount, `Hoàn tiền ví do trả hàng - đơn hàng #${orderId}`, orderId]
      )

      await connection.commit()
      return { adminCommission, vendorNetProfit, isReturn: true }
    } else {
      // Đơn hàng giao thường
      await connection.execute(
        `UPDATE orders SET status = ?, payment_status = 'paid', delivery_completed_at = NOW() WHERE id = ?`,
        [ORDER_STATUS.COMPLETED, orderId]
      )

      await connection.execute(
        'UPDATE stores SET balance = balance + ? WHERE id = ?',
        [vendorNetProfit, order.store_id]
      )

      await connection.commit()
      return { adminCommission, vendorNetProfit, isReturn: false }
    }
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
      SUM(CASE WHEN status IN (?, ?) AND shipper_id IS NULL THEN 1 ELSE 0 END) AS waitingOrders,
      SUM(CASE WHEN status IN (?,?,?,?,?,?) AND shipper_id = ? THEN 1 ELSE 0 END) AS activeDeliveries,
      SUM(CASE WHEN status IN (?, ?) AND shipper_id = ? AND DATE(delivery_completed_at) = CURDATE() THEN 1 ELSE 0 END) AS completedToday,
      SUM(CASE WHEN status IN (?, ?) AND shipper_id = ? THEN 1 ELSE 0 END) AS totalCompleted
    FROM orders
  `, [
    ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER,
    ORDER_STATUS.ACCEPTED_BY_SHIPPER, ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED,
    ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER, ORDER_STATUS.RETURN_SHIPPING, ORDER_STATUS.RETURN_DELIVERED,
    shipperId,
    ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURN_COMPLETED, shipperId,
    ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURN_COMPLETED, shipperId
  ])
  return {
    waitingOrders: Number(rows[0].waitingOrders) || 0,
    activeDeliveries: Number(rows[0].activeDeliveries) || 0,
    completedToday: Number(rows[0].completedToday) || 0,
    totalCompleted: Number(rows[0].totalCompleted) || 0
  }
}

// Thống kê 7 ngày gần nhất cho chart
const getDailyStats = async (shipperId) => {
  const [rows] = await pool.execute(`
    SELECT 
      DATE(delivery_completed_at) AS delivery_date,
      COUNT(*) AS count
    FROM orders
    WHERE shipper_id = ? 
      AND status = ?
      AND delivery_completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(delivery_completed_at)
    ORDER BY delivery_date ASC
  `, [shipperId, ORDER_STATUS.COMPLETED])

  // Điền đủ 7 ngày (kể cả ngày không có giao hàng)
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = rows.find(r => {
      const rd = new Date(r.delivery_date)
      return rd.toISOString().split('T')[0] === dateStr
    })
    result.push({ date: dateStr, count: found ? Number(found.count) : 0 })
  }
  return result
}

// Thống kê trạng thái đơn của shipper
const getStatusBreakdown = async (shipperId) => {
  const [rows] = await pool.execute(`
    SELECT status, COUNT(*) AS count
    FROM orders
    WHERE shipper_id = ?
    GROUP BY status
  `, [shipperId])
  return rows.map(r => ({ status: r.status, count: Number(r.count) }))
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
  getDashboardStats,
  getDailyStats,
  getStatusBreakdown
}
