import { shipperModel } from '~/models/shipper/shipperModel'
import { orderModel } from '~/models/user/order/orderModel'
import { notificationService } from '~/services/notification/notificationService'
import { NOTIFICATION_TYPES, ROLE_ID } from '~/utils/constants'
import pool from '~/config/db'

// Kiểm tra user có role Shipper không
const verifyShipperRole = async (userId) => {
  const [rows] = await pool.execute('SELECT role_id FROM users WHERE id = ?', [userId])
  if (rows.length === 0) throw new Error('Người dùng không tồn tại.')
  if (Number(rows[0].role_id) !== ROLE_ID.SHIPPER) throw new Error('Bạn không có quyền truy cập chức năng Shipper.')
  return true
}

const sendNotification = async (userId, title, message, type, orderId) => {
  try {
    await notificationService.createAndPushNotification({
      userId,
      title,
      content: JSON.stringify({ message, orderId }),
      type,
      referenceId: orderId
    })
  } catch (error) {
    console.error(`Lỗi gửi notification đơn #${orderId}:`, error.message)
  }
}

const getDashboard = async (userId) => {
  await verifyShipperRole(userId)
  return shipperModel.getDashboardStats(userId)
}

const getAvailableOrders = async (userId, { page = 1, limit = 10 }) => {
  await verifyShipperRole(userId)
  const offset = (page - 1) * limit
  const [orders, total] = await Promise.all([
    shipperModel.getAvailableOrders({ limit: Number(limit), offset }),
    shipperModel.countAvailableOrders()
  ])
  return {
    orders,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  }
}

const acceptOrder = async (userId, orderId) => {
  await verifyShipperRole(userId)
  await shipperModel.acceptOrder(orderId, userId)

  // Notify user
  const userOrderId = await orderModel.getOrderUserId(orderId)
  if (userOrderId) {
    await sendNotification(
      userOrderId,
      'Shipper đã nhận đơn hàng',
      `Đơn hàng #${orderId} đã được shipper nhận và đang chuẩn bị giao đến bạn.`,
      NOTIFICATION_TYPES.ORDER_ACCEPTED_BY_SHIPPER,
      orderId
    )
  }
  return { message: `Đã nhận đơn hàng #${orderId} thành công.` }
}

const getMyDeliveries = async (userId, { page = 1, limit = 10 }) => {
  await verifyShipperRole(userId)
  const offset = (page - 1) * limit
  const [orders, total] = await Promise.all([
    shipperModel.getMyDeliveries(userId, { limit: Number(limit), offset }),
    shipperModel.countMyDeliveries(userId)
  ])
  return {
    orders,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  }
}

const getDeliveryHistory = async (userId, { page = 1, limit = 10 }) => {
  await verifyShipperRole(userId)
  const offset = (page - 1) * limit
  const [orders, total] = await Promise.all([
    shipperModel.getDeliveryHistory(userId, { limit: Number(limit), offset }),
    shipperModel.countDeliveryHistory(userId)
  ])
  return {
    orders,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  }
}

const getOrderDetail = async (userId, orderId) => {
  await verifyShipperRole(userId)
  const order = await shipperModel.getOrderDetail(orderId, userId)
  if (!order) throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền xem.')
  return order
}

const startDelivery = async (userId, orderId) => {
  await verifyShipperRole(userId)
  const updated = await shipperModel.startDelivery(orderId, userId)
  if (!updated) throw new Error('Không thể bắt đầu giao hàng. Đơn hàng chưa được nhận hoặc đã thay đổi trạng thái.')

  const userOrderId = await orderModel.getOrderUserId(orderId)
  if (userOrderId) {
    await sendNotification(
      userOrderId,
      'Đơn hàng đang được giao',
      `Đơn hàng #${orderId} đang trên đường giao đến bạn. Vui lòng chú ý điện thoại.`,
      NOTIFICATION_TYPES.ORDER_SHIPPING,
      orderId
    )
  }
  return { message: 'Bắt đầu giao hàng thành công.' }
}

const markDelivered = async (userId, orderId) => {
  await verifyShipperRole(userId)
  const updated = await shipperModel.markDelivered(orderId, userId)
  if (!updated) throw new Error('Không thể đánh dấu đã giao. Vui lòng kiểm tra trạng thái đơn hàng.')

  const userOrderId = await orderModel.getOrderUserId(orderId)
  if (userOrderId) {
    await sendNotification(
      userOrderId,
      'Đơn hàng đã được giao',
      `Đơn hàng #${orderId} đã được giao thành công. Shipper đang xác nhận hoàn tất.`,
      NOTIFICATION_TYPES.ORDER_DELIVERED,
      orderId
    )
  }
  return { message: 'Đã đánh dấu giao hàng thành công. Vui lòng upload ảnh minh chứng.' }
}

const uploadDeliveryProof = async (userId, orderId, imageUrls, note) => {
  await verifyShipperRole(userId)
  if (!imageUrls || imageUrls.length === 0) throw new Error('Vui lòng upload ít nhất 1 ảnh minh chứng giao hàng.')
  const updated = await shipperModel.saveDeliveryProof(orderId, userId, imageUrls, note)
  if (!updated) throw new Error('Không thể lưu ảnh minh chứng. Đơn hàng chưa ở trạng thái "Đã giao".')
  return { message: 'Đã lưu ảnh minh chứng giao hàng thành công.' }
}

const completeDelivery = async (userId, orderId) => {
  await verifyShipperRole(userId)
  const result = await shipperModel.completeDelivery(orderId, userId)

  const userOrderId = await orderModel.getOrderUserId(orderId)
  if (userOrderId) {
    await sendNotification(
      userOrderId,
      'Đơn hàng hoàn tất',
      `Đơn hàng #${orderId} đã hoàn tất. Cảm ơn bạn đã tin tưởng mua sắm!`,
      NOTIFICATION_TYPES.ORDER_COMPLETED,
      orderId
    )
  }
  return {
    message: 'Hoàn tất giao hàng thành công! Doanh thu đã được cộng vào tài khoản cửa hàng.',
    data: result
  }
}

export const shipperService = {
  getDashboard,
  getAvailableOrders,
  acceptOrder,
  getMyDeliveries,
  getDeliveryHistory,
  getOrderDetail,
  startDelivery,
  markDelivered,
  uploadDeliveryProof,
  completeDelivery
}
