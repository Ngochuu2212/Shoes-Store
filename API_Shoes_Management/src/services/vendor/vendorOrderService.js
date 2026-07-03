import { vendorOrderModel } from '~/models/vendor/order/vendorOrderModel'
import { orderModel } from '~/models/user/order/orderModel'
import { walletModel } from '~/models/user/wallet/walletModel'
import { notificationService } from '~/services/notification/notificationService'
import { ORDER_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import pool from '~/config/db'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorOrderModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chờ phê duyệt.')
  return store.id
}

const getVendorOrders = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    status: filters.status || null,
    searchOrderId: filters.searchOrderId || null,
    paymentMethod: filters.paymentMethod || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null
  }

  const [orders, totalItems, overviewStats] = await Promise.all([
    vendorOrderModel.getVendorOrders(storeId, { ...filterParams, limit, offset }),
    vendorOrderModel.countVendorOrders(storeId, filterParams),
    vendorOrderModel.getOrdersOverviewStats(storeId)
  ])

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await vendorOrderModel.getOrderItemsByStore(order.id)
      return { ...order, items }
    })
  )

  const totalPages = Math.ceil(totalItems / limit)

  return {
    overview: overviewStats,
    pagination: { totalItems, totalPages, currentPage: page, limit },
    orders: ordersWithItems
  }
}

// Hàm gửi notification cho user
const sendOrderNotification = async (orderId, userId, title, message, type) => {
  try {
    await notificationService.createAndPushNotification({
      userId: userId,
      title: title,
      content: JSON.stringify({
        message: message,
        orderId: orderId
      }),
      type: type,
      referenceId: orderId
    })
  } catch (error) {
    console.error(`Lỗi gửi thông báo cho đơn hàng #${orderId}:`, error)
  }
}

// Hàm gửi thông báo cho Vendor khi xác nhận đơn hàng
const sendNotificationToVendorOnConfirm = async (orderId, storeId) => {
  try {
    // Sử dụng Model thay vì query trực tiếp
    const storeInfo = await vendorOrderModel.getStoreOwnerInfo(storeId)
    if (!storeInfo) return

    const ownerId = storeInfo.owner_id

    await notificationService.createAndPushNotification({
      userId: ownerId,
      title: 'Xác nhận đơn hàng thành công',
      content: JSON.stringify({
        message: `Đơn hàng #${orderId} đã được xác nhận thành công và chuyển sang trạng thái đang xử lý.`,
        orderId: orderId
      }),
      type: NOTIFICATION_TYPES.ORDER_PROCESSING,
      referenceId: orderId
    })
  } catch (error) {
    console.error(`Lỗi gửi thông báo xác nhận đơn hàng #${orderId}:`, error)
  }
}

// Cập nhật hàng loạt đơn lẻ (Có check vết Admin xích đơn)
const updateOrderStatusBulk = async (userId, orderIds, targetStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  const isAllOwner = await vendorOrderModel.checkMultipleOrdersOwnership(orderIds, storeId)
  if (!isAllOwner) {
    throw new Error('Danh sách đơn hàng chứa mã không thuộc quyền quản lý của shop bạn.')
  }

  for (const orderId of orderIds) {
    const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
    if (orderDetail[0]?.cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')) {
      throw new Error(`Đơn hàng #${orderId} đã bị Ban quản trị sàn ép hủy đóng băng hệ thống. Bạn không được phép can thiệp đổi trạng thái nữa.`)
    }
  }

  if (targetStatus === ORDER_STATUS.DELIVERED) {
    let successCount = 0
    let totalCredited = 0

    for (const orderId of orderIds) {
      const currentStatus = await vendorOrderModel.getOrderStatus(orderId)
      const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })

      if (currentStatus === ORDER_STATUS.SHIPPED && orderDetail.length > 0) {
        const cashFlow = await vendorOrderModel.completeOrderAndCreditStore(
          orderId,
          storeId,
          Number(orderDetail[0].total_amount)
        )
        totalCredited += cashFlow.vendorNetProfit
        successCount++

        // Gửi thông báo khi đơn hàng đã giao thành công
        const userId = await orderModel.getOrderUserId(orderId)
        if (userId) {
          await sendOrderNotification(
            orderId,
            userId,
            'Đơn hàng đã giao thành công',
            `Đơn hàng #${orderId} đã được giao thành công. Cảm ơn bạn đã mua sắm!`,
            NOTIFICATION_TYPES.ORDER_DELIVERED
          )
        }
      }
    }

    return {
      message: `Xử lý giao hàng loạt thành công cho ${successCount}/${orderIds.length} đơn hàng đủ điều kiện. Doanh thu sạch đã được cộng vào ví balance.`,
      creditedAmount: totalCredited
    }
  }

  const affectedRows = await vendorOrderModel.updateOrderStatusBulk(orderIds, targetStatus, storeId)

  // Gửi thông báo cho từng đơn hàng
  for (const orderId of orderIds) {
    const userId = await orderModel.getOrderUserId(orderId)
    if (!userId) continue

    let title = ''
    let message = ''
    let type = ''

    switch (targetStatus) {
      case ORDER_STATUS.PROCESSING:
        title = 'Đơn hàng đang xử lý'
        message = `Đơn hàng #${orderId} đang được cửa hàng xác nhận và chuẩn bị.`
        type = NOTIFICATION_TYPES.ORDER_PROCESSING
        break
      case ORDER_STATUS.SHIPPED:
        title = 'Đơn hàng đang giao'
        message = `Đơn hàng #${orderId} đã được giao cho đơn vị vận chuyển.`
        type = NOTIFICATION_TYPES.ORDER_SHIPPED
        break
      case ORDER_STATUS.CANCELLED:
        title = 'Đơn hàng đã hủy'
        message = `Đơn hàng #${orderId} đã bị hủy.`
        type = NOTIFICATION_TYPES.ORDER_CANCELLED
        break
      default:
        continue
    }

    await sendOrderNotification(orderId, userId, title, message, type)
  }

  return { message: `Đã cập nhật trạng thái sang [${targetStatus}] thành công cho ${affectedRows} đơn hàng.` }
}

// Điều chỉnh trạng thái đơn lẻ (Có check vết Admin xích đơn)
const updateOrderStatus = async (userId, orderId, newStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Đơn hàng không chứa sản phẩm thuộc cửa hàng của bạn.')

  const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
  if (orderDetail.length === 0) throw new Error('Đơn hàng không tồn tại.')

  if (orderDetail[0].cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')) {
    throw new Error('Đơn hàng này đã bị Ban quản trị sàn ép hủy tranh chấp vĩ mô. Quyết định của Admin là tối cao, Cửa hàng không có quyền thay đổi trạng thái vận đơn này nữa.')
  }

  const currentStatus = orderDetail[0].status
  if (currentStatus === ORDER_STATUS.DELIVERED || currentStatus === ORDER_STATUS.CANCELLED) {
    throw new Error('Không thể thay đổi trạng thái của đơn hàng đã hoàn thành hoặc đã hủy.')
  }

  // Lấy userId để gửi notification
  const userOrderId = await orderModel.getOrderUserId(orderId)

  if (newStatus === ORDER_STATUS.DELIVERED) {
    if (currentStatus !== ORDER_STATUS.SHIPPED) {
      throw new Error('Đơn hàng phải được chuyển sang trạng thái "Đang giao hàng (shipped)" trước khi xác nhận Giao thành công.')
    }

    const cashFlow = await vendorOrderModel.completeOrderAndCreditStore(
      orderId,
      storeId,
      Number(orderDetail[0].total_amount)
    )

    // Gửi thông báo khi đơn hàng đã giao thành công
    if (userOrderId) {
      await sendOrderNotification(
        orderId,
        userOrderId,
        'Đơn hàng đã giao thành công',
        `Đơn hàng #${orderId} đã được giao thành công. Cảm ơn bạn đã mua sắm!`,
        NOTIFICATION_TYPES.ORDER_DELIVERED
      )
    }

    return {
      message: 'Xác nhận giao hàng thành công! Trạng thái thanh toán đã lật sang [PAID] và tiền doanh thu thực nhận đã được nạp vào ví balance của cửa hàng.',
      data: cashFlow
    }
  }

  await vendorOrderModel.updateOrderStatus(orderId, newStatus)

  // Gửi thông báo cho user khi cập nhật trạng thái
  if (userOrderId) {
    let title = ''
    let message = ''
    let type = ''

    switch (newStatus) {
      case ORDER_STATUS.PROCESSING:
        title = 'Đơn hàng đang xử lý'
        message = `Đơn hàng #${orderId} đang được cửa hàng xác nhận và chuẩn bị.`
        type = NOTIFICATION_TYPES.ORDER_PROCESSING
        break
      case ORDER_STATUS.SHIPPED:
        title = 'Đơn hàng đang giao'
        message = `Đơn hàng #${orderId} đã được giao cho đơn vị vận chuyển.`
        type = NOTIFICATION_TYPES.ORDER_SHIPPED
        break
      case ORDER_STATUS.CANCELLED:
        title = 'Đơn hàng đã hủy'
        message = `Đơn hàng #${orderId} đã bị hủy.`
        type = NOTIFICATION_TYPES.ORDER_CANCELLED
        break
      default:
        break
    }

    if (title) {
      await sendOrderNotification(orderId, userOrderId, title, message, type)
    }
  }

  return { message: `Cập nhật trạng thái đơn hàng sang [${newStatus}] thành công.` }
}

// Giải quyết đơn yêu cầu hủy (Có check vết Admin xích đơn)
const handleCancelRequest = async (userId, orderId, { decision, reason }) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Bạn không có quyền xử lý đơn hàng này.')

  const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
  if (orderDetail.length === 0) throw new Error('Đơn hàng không tồn tại.')

  if (orderDetail[0].cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')) {
    throw new Error('Đơn hàng này đã bị Ban quản trị sàn ép hủy đóng băng. Bạn không thể thực hiện phê duyệt hay từ chối hủy luồng đơn này.')
  }

  const currentStatus = orderDetail[0].status
  const userOrderId = await orderModel.getOrderUserId(orderId)

  if (currentStatus === ORDER_STATUS.PENDING) {
    const finalReason = reason ? `HỦY TỰ ĐỘNG (PENDING): ${reason}` : 'HỦY TỰ ĐỘNG: Hệ thống hủy đơn trực tiếp từ trạng thái chờ duyệt.'
    await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, finalReason)

    // Gửi thông báo khi đơn hàng bị hủy
    if (userOrderId) {
      await sendOrderNotification(
        orderId,
        userOrderId,
        'Đơn hàng đã hủy',
        `Đơn hàng #${orderId} đã bị hủy. Lý do: ${finalReason}`,
        NOTIFICATION_TYPES.ORDER_CANCELLED
      )
    }

    return { message: 'Đơn hàng đang ở trạng thái chờ duyệt, hệ thống đã thực hiện hủy trực tiếp.' }
  }

  if (currentStatus === ORDER_STATUS.CANCEL_REQUESTED) {
    if (decision === 'accept') {
      const finalReason = reason ? reason : 'Người bán chấp nhận yêu cầu hủy từ khách hàng.'
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, finalReason)

      // Hoàn tiền vào ví
      const [orderRows] = await pool.execute(
        'SELECT user_id, payment_status, total_amount, wallet_amount_used FROM orders WHERE id = ?',
        [orderId]
      )
      if (orderRows.length > 0) {
        const { user_id, payment_status, total_amount, wallet_amount_used } = orderRows[0]
        const refundAmount = payment_status === 'paid'
          ? Number(total_amount)
          : Number(wallet_amount_used || 0)
        if (refundAmount > 0) {
          await walletModel.refundToWallet(user_id, refundAmount,
            `Hoàn tiền đơn hàng #${orderId} đã hủy (cửa hàng chấp nhận)`, orderId)
        }
      }

      // Gửi thông báo khi chấp nhận hủy đơn
      if (userOrderId) {
        await sendOrderNotification(
          orderId,
          userOrderId,
          'Đơn hàng đã hủy',
          `Đơn hàng #${orderId} đã được hủy theo yêu cầu của bạn. Tiền đã được hoàn vào ví của bạn (nếu đã thanh toán).`,
          NOTIFICATION_TYPES.ORDER_CANCELLED
        )
      }

      return { message: 'Đã chấp nhận yêu cầu hủy đơn hàng từ khách hàng.' }

    } else if (decision === 'reject') {
      const rejectNote = reason ? reason : 'Hàng đã được đóng gói và bàn giao cho đơn vị vận chuyển.'
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.PROCESSING, rejectNote)

      // Gửi thông báo khi từ chối hủy đơn
      if (userOrderId) {
        await sendOrderNotification(
          orderId,
          userOrderId,
          'Yêu cầu hủy đơn bị từ chối',
          `Yêu cầu hủy đơn hàng #${orderId} đã bị từ chối. Lý do: ${rejectNote}`,
          NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED
        )
      }

      return { message: 'Đã từ chối yêu cầu hủy đơn hàng, trạng thái đơn hàng quay về Đang xử lý.' }
    }
  }

  if (currentStatus === ORDER_STATUS.PROCESSING) {
    throw new Error('Đơn hàng này chưa gửi yêu cầu hủy. Không thể thực hiện phê duyệt.')
  } else {
    throw new Error('Đơn hàng đã chuyển sang giai đoạn vận chuyển, không thể xử lý hủy.')
  }
}

export const vendorOrderService = {
  getVendorOrders,
  updateOrderStatus,
  handleCancelRequest,
  updateOrderStatusBulk
}