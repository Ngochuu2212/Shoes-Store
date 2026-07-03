import pool from '~/config/db'
import { ORDER_STATUS } from '~/utils/constants'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

const getStoreOwnerInfo = async (storeId) => {
  const query = 'SELECT owner_id, name FROM stores WHERE id = ?'
  const [rows] = await pool.execute(query, [storeId])
  return rows[0] || null
}

// 1. Lấy danh sách đơn hàng thuộc về Shop (Phân trang + Lọc trạng thái + Nạp thông tin khuyến mãi)
const getVendorOrders = async (storeId, { status, searchOrderId, paymentMethod, startDate, endDate, limit, offset }) => {
  let query = `
    SELECT id, user_id, recipient_name, recipient_phone, total_amount, discount_amount, 
           commission_rate_snapshot, status, payment_status, payment_method, 
           shipping_address, cancel_reason, created_at
    FROM orders
    WHERE store_id = ?
  `
  const queryParams = [storeId]

  // A. Lọc theo trạng thái đơn hàng (Dropdown)
  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }

  // B. Tìm kiếm đích danh theo mã đơn hàng (Ô Tìm kiếm nhanh)
  if (searchOrderId) {
    query += ' AND id = ?'
    queryParams.push(Number(searchOrderId))
  }

  // C. Lọc theo phương thức thanh toán (Dropdown)
  if (paymentMethod) {
    query += ' AND payment_method = ?'
    queryParams.push(paymentMethod)
  }

  // D. Lọc theo khoảng thời gian đặt hàng (Bộ chọn ngày)
  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  // Sắp xếp đơn hàng mới nhất lên đầu và phân trang
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số đơn hàng của shop thỏa mãn các điều kiện lọc ở trên
const countVendorOrders = async (storeId, { status, searchOrderId, paymentMethod, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) as total FROM orders WHERE store_id = ?'
  const queryParams = [storeId]

  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }
  if (searchOrderId) {
    query += ' AND id = ?'
    queryParams.push(Number(searchOrderId))
  }
  if (paymentMethod) {
    query += ' AND payment_method = ?'
    queryParams.push(paymentMethod)
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
  return rows[0].total
}

// Lấy chi tiết các mặt hàng giày trong đơn hàng từ bảng order_items và product_variants (kèm ảnh từ variants)
const getOrderItemsByStore = async (orderId) => {
  const query = `
    SELECT oi.id, oi.variant_id, p.name AS product_name, 
           p.images AS product_images, p.slug,
           oi.quantity, oi.price, v.size, v.color, v.image AS variant_image
    FROM order_items oi
    JOIN product_variants v ON oi.variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [rows] = await pool.execute(query, [orderId])

  // Parse images cho từng sản phẩm và xử lý ảnh từ variants
  const itemsWithParsedImages = rows.map(item => {
    let parsedImages = []

    // Parse variant_image nếu có
    let parsedVariantImage = null
    if (item.variant_image) {
      try {
        parsedVariantImage = typeof item.variant_image === 'string'
          ? JSON.parse(item.variant_image)
          : item.variant_image
      } catch (e) {
        parsedVariantImage = null
      }
    }

    // Parse product_images
    try {
      parsedImages = typeof item.product_images === 'string'
        ? JSON.parse(item.product_images)
        : (Array.isArray(item.product_images) ? item.product_images : [])
    } catch (e) {
      parsedImages = []
    }

    return {
      ...item,
      images: parsedImages,
      variant_image: parsedVariantImage // Giữ nguyên cấu trúc object JSON
    }
  })

  return itemsWithParsedImages
}

// 3. Cập nhật trạng thái vận đơn và ghi nhận lý do hủy nếu có
const updateOrderStatus = async (orderId, status, cancelReason = null) => {
  let query = 'UPDATE orders SET status = ?'
  const queryParams = [status]

  if (cancelReason !== null) {
    query += ', cancel_reason = ?'
    queryParams.push(cancelReason)
  }

  query += ' WHERE id = ?'
  queryParams.push(orderId)

  const [result] = await pool.execute(query, queryParams)
  return result
}

// Kiểm tra quyền sở hữu đơn hàng (Xác minh đơn này có đúng là đặt tại store này không)
const checkOrderOwnership = async (orderId, storeId) => {
  const query = 'SELECT id FROM orders WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [orderId, storeId])
  return rows.length > 0
}

// Lấy trạng thái hiện tại của một đơn hàng
const getOrderStatus = async (orderId) => {
  const query = 'SELECT status FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0] ? rows[0].status : null
}

// Thống kê nhanh các số liệu đơn hàng phục vụ các thẻ Widget ở đầu trang
const getOrdersOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS processingOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS shippedOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS deliveredOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS cancelRequestedOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS cancelledOrders
    FROM orders
    WHERE store_id = ?
  `
  const [rows] = await pool.execute(query, [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCEL_REQUESTED,
    ORDER_STATUS.CANCELLED,
    storeId
  ])

  return {
    pendingOrders: Number(rows[0].pendingOrders) || 0,
    processingOrders: Number(rows[0].processingOrders) || 0,
    shippedOrders: Number(rows[0].shippedOrders) || 0,
    deliveredOrders: Number(rows[0].deliveredOrders) || 0,
    cancelRequestedOrders: Number(rows[0].cancelRequestedOrders) || 0,
    cancelledOrders: Number(rows[0].cancelledOrders) || 0
  }
}

// Toàn bộ danh sách mã đơn hàng này có phải đều đặt tại Shop này không
const checkMultipleOrdersOwnership = async (orderIds, storeId) => {
  if (!orderIds || orderIds.length === 0) return false

  const query = 'SELECT COUNT(*) AS validCount FROM orders WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [orderIds, storeId])

  return rows[0].validCount === orderIds.length
}

// Cập nhật trạng thái hàng loạt cho mảng ID đơn hàng từ Checkbox
const updateOrderStatusBulk = async (orderIds, status, storeId) => {
  const query = 'UPDATE orders SET status = ? WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [status, orderIds, storeId])
  return result.affectedRows
}

// Lấy chi tiết đơn hàng theo ID (kèm thông tin người nhận và ảnh sản phẩm từ variants)
const getVendorOrderDetail = async (orderId, storeId) => {
  // Lấy thông tin đơn hàng
  const orderQuery = `
    SELECT id, user_id, recipient_name, recipient_phone, total_amount, discount_amount,
           commission_rate_snapshot, status, payment_status, payment_method,
           shipping_address, cancel_reason, created_at, updated_at
    FROM orders
    WHERE id = ? AND store_id = ?
  `
  const [orderRows] = await pool.execute(orderQuery, [orderId, storeId])

  if (orderRows.length === 0) return null

  const order = orderRows[0]

  // Lấy danh sách sản phẩm trong đơn (đã bao gồm ảnh từ variants)
  order.items = await getOrderItemsByStore(orderId)

  return order
}

// Bẻ sang đọc trực tiếp Snapshot tài chính của Đơn hàng
const completeOrderAndCreditStore = async (orderId, storeId, totalAmount) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // 1. Đọc trực tiếp tỷ lệ chiết khấu snapshot được neo vào đơn hàng lúc mua
    const [orderRows] = await connection.execute(
      'SELECT commission_rate_snapshot FROM orders WHERE id = ?',
      [orderId]
    )
    if (orderRows.length === 0) throw new Error('Không tìm thấy thông tin đơn hàng đối soát.')
    const commissionRate = Number(orderRows[0].commission_rate_snapshot) || 10.00

    // 2. Tính toán dòng tiền sạch: total_amount này chính là số tiền người mua thực trả sau khi áp mã
    const adminCommission = totalAmount * (commissionRate / 100)
    const vendorNetProfit = totalAmount - adminCommission

    // 3. Cập nhật đơn hàng sang hoàn thành và lật thanh toán sang PAID
    await connection.execute(
      `UPDATE orders 
       SET status = ?, payment_status = 'paid' 
       WHERE id = ?`,
      [ORDER_STATUS.DELIVERED, orderId]
    )

    // 4. Bơm khoản doanh thu thực nhận (Net Profit) vào ví tài khoản cho Store
    await connection.execute(
      `UPDATE stores 
       SET balance = balance + ? 
       WHERE id = ?`,
      [vendorNetProfit, storeId]
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

export const vendorOrderModel = {
  getStoreByOwnerId,
  getVendorOrders,
  countVendorOrders,
  getOrderItemsByStore,
  updateOrderStatus,
  checkOrderOwnership,
  getOrderStatus,
  getOrdersOverviewStats,
  checkMultipleOrdersOwnership,
  updateOrderStatusBulk,
  getVendorOrderDetail,
  completeOrderAndCreditStore,
  getStoreOwnerInfo
}