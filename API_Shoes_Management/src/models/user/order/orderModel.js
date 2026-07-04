import pool from '~/config/db'

// 1. Lấy thông tin chi tiết các item trong giỏ kèm giá, tồn kho và store_id (Có bốc thêm commission_rate hiện tại của shop)
const getCartItemsForCheckout = async (userId) => {
  const query = `
    SELECT c.variant_id, c.quantity, pv.stock, pv.product_id, p.price, p.store_id, s.commission_rate
    FROM cart c
    INNER JOIN product_variants pv ON c.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    INNER JOIN stores s ON p.store_id = s.id 
    WHERE c.user_id = ?
  `
  const [rows] = await pool.execute(query, [userId])
  return rows
}

// 2. Tạo một đơn hàng mới lưu vết Khuyến mãi, Người nhận và Snapshot hoa hồng
const createOrder = async (connection, {
  userId, recipientName, recipientPhone, storeId, totalAmount, discount_amount, commission_rate_snapshot, shippingAddress, paymentMethod, appliedVoucher, wallet_amount_used, shipping_method, shipping_fee
}) => {
  const query = `
    INSERT INTO orders (
      user_id, recipient_name, recipient_phone, store_id, 
      total_amount, discount_amount, commission_rate_snapshot, 
      shipping_address, status, payment_status, payment_method, applied_voucher, wallet_amount_used,
      shipping_method, shipping_fee
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?, ?, ?, ?) 
  `
  const [result] = await connection.execute(query, [
    userId,
    recipientName,
    recipientPhone,
    storeId,
    totalAmount,
    discount_amount || 0.00,
    commission_rate_snapshot,
    shippingAddress,
    paymentMethod || 'COD',
    appliedVoucher || null,
    wallet_amount_used || 0.00,
    shipping_method || 'standard',
    shipping_fee || 0.00
  ])
  return result.insertId
}

// 3. Tạo chi tiết mặt hàng trong đơn (order_items)
const createOrderItem = async (connection, { orderId, variantId, quantity, price }) => {
  const query = `
    INSERT INTO order_items (order_id, variant_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `
  await connection.execute(query, [orderId, variantId, quantity, price])
}

// 4. Trừ số lượng kho của biến thể giày
const decreaseVariantStock = async (conn, variantId, quantity) => {
  const connection = conn?.execute ? conn : conn
  if (!variantId) {
    return
  }
  const query = 'UPDATE product_variants SET stock = stock - ? WHERE id = ?'
  await connection.execute(query, [quantity, variantId])
}

// 5. Tăng số lượng đã bán (sold) ở bảng sản phẩm tổng quát - Giữ nguyên của b
const increaseProductSold = async (connection, productId, quantity) => {
  const query = 'UPDATE products SET sold = sold + ? WHERE id = ?'
  await connection.execute(query, [quantity, productId])
}

// 6. Dọn sạch giỏ hàng của User sau khi đặt thành công
const clearUserCart = async (connection, userId) => {
  const query = 'DELETE FROM cart WHERE user_id = ?'
  await connection.execute(query, [userId])
}

// 7. Cập nhật trạng thái thanh toán hàng loạt sau khi VNPAY gọi Webhook
const updatePaymentStatusBulk = async (orderIds, paymentStatus, orderStatus) => {
  if (!orderIds || orderIds.length === 0) return
  const placeholders = orderIds.map(() => '?').join(',')
  const query = `UPDATE orders SET payment_status = ?, status = ? WHERE id IN (${placeholders})`
  await pool.execute(query, [paymentStatus, orderStatus, ...orderIds])
}

// Lấy user_id của đơn hàng
const getOrderUserId = async (orderId) => {
  const query = 'SELECT user_id FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0]?.user_id || null
}

// Lấy thông tin đơn hàng và user_id
const getOrderWithUserId = async (orderId) => {
  const query = 'SELECT id, user_id, status, payment_status FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0] || null
}

const clearCartByOrderIds = async (orderIds) => {
  if (!orderIds || orderIds.length === 0) return

  // Lấy tất cả variant_id từ các order
  const placeholders = orderIds.map(() => '?').join(',')
  const query = `
    DELETE FROM cart 
    WHERE user_id IN (
      SELECT DISTINCT user_id FROM orders WHERE id IN (${placeholders})
    )
    AND variant_id IN (
      SELECT DISTINCT variant_id FROM order_items WHERE order_id IN (${placeholders})
    )
  `
  const [result] = await pool.execute(query, [...orderIds, ...orderIds])
  return result
}

export const orderModel = {
  getCartItemsForCheckout,
  createOrder,
  createOrderItem,
  decreaseVariantStock,
  increaseProductSold,
  clearUserCart,
  updatePaymentStatusBulk,
  getOrderUserId,
  getOrderWithUserId,
  clearCartByOrderIds
}