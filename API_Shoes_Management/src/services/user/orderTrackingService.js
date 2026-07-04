import { orderTrackingModel } from '~/models/user/order/orderTrackingModel'
import { orderModel } from '~/models/user/order/orderModel'
import { walletModel } from '~/models/user/wallet/walletModel'
import { ORDER_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import pool from '~/config/db'
import { notificationService } from '~/services/notification/notificationService'

// Hàm gửi thông báo cho Vendor
const sendNotificationToVendor = async (storeId, orderId, buyerName, totalAmount, reason, type, title) => {
  try {
    const [storeRows] = await pool.execute('SELECT owner_id, name FROM stores WHERE id = ?', [storeId])
    if (storeRows.length === 0) return

    const ownerId = storeRows[0].owner_id
    const storeName = storeRows[0].name
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)

    let message = ''
    let orderStatus = null

    if (type === NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED) {
      message = `Khách hàng ${buyerName} đã gửi yêu cầu hủy đơn hàng #${orderId} với lý do: "${reason || 'Không có lý do cụ thể'}". Tổng tiền: ${formattedAmount}. Vui lòng xem xét và duyệt yêu cầu.`
      orderStatus = 'cancel_requested'
    } else if (type === NOTIFICATION_TYPES.ORDER_CANCELLED) {
      message = `Đơn hàng #${orderId} từ khách hàng ${buyerName} đã bị hủy trực tiếp với lý do: "${reason || 'Không có lý do cụ thể'}". Tổng tiền: ${formattedAmount}.`
      orderStatus = 'cancelled'
    } else if (type === NOTIFICATION_TYPES.ORDER_PROCESSING) {
      message = `Khách hàng ${buyerName} đã rút lại yêu cầu hủy đơn hàng #${orderId}. Tổng tiền: ${formattedAmount}. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.`
      orderStatus = 'processing'
    }

    await notificationService.createAndPushNotification({
      userId: ownerId,
      title: title,
      content: JSON.stringify({
        message: message,
        orderId: orderId,
        storeName: storeName,
        buyerName: buyerName,
        amount: totalAmount,
        reason: reason,
        orderStatus: orderStatus
      }),
      type: type,
      referenceId: orderId
    })
  } catch (error) {
    console.error(`Lỗi gửi thông báo cho Vendor về đơn hàng #${orderId}:`, error)
  }
}

// Hàm gửi thông báo cho User
const sendNotificationToUser = async (userId, orderId, title, message, type) => {
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
    console.error(`Lỗi gửi thông báo cho User về đơn hàng #${orderId}:`, error)
  }
}

// 1. USER: Lấy lịch sử mua hàng
const getOrderHistory = async (userId, query) => {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.max(1, Number(query.limit) || 5)
  const status = query.status || 'all'

  const { orders, total } = await orderTrackingModel.getOrderHistoryPaginated(userId, page, limit, status)

  for (const order of orders) {
    order.items = await orderTrackingModel.getOrderItemsByOrderId(order.order_id)
  }

  const totalPages = Math.ceil(total / limit)

  const rawCounts = await orderTrackingModel.getOrderStatusCounts(userId)

  const statusCounts = rawCounts.reduce((acc, curr) => {
    acc[curr.status] = curr.count
    return acc
  }, {})

  statusCounts.all = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  return {
    pagination: {
      totalItems: total,
      totalPages: totalPages,
      currentPage: page,
      limit: limit
    },
    statusCounts: statusCounts,
    orders: orders
  }
}

// 2. USER: Xử lý logic hủy đơn hàng
const cancelOrderByUser = async (userId, orderId, cancelReason) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const order = await orderTrackingModel.getOrderById(orderId)

    if (!order) {
      throw new Error('Đơn hàng không tồn tại.')
    }

    if (order.user_id !== userId) {
      throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')
    }

    if ([ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.ACCEPTED_BY_SHIPPER, ORDER_STATUS.SHIPPING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.CANCEL_REQUESTED].includes(order.status)) {
      throw new Error('Đơn hàng đã thay đổi trạng thái, không thể thực hiện yêu cầu hủy.')
    }

    // Lấy thông tin user và store để gửi thông báo
    const [userRows] = await pool.execute('SELECT fullname FROM users WHERE id = ?', [userId])
    const buyerName = userRows.length > 0 ? userRows[0].fullname : 'Khách hàng'
    const [storeRows] = await pool.execute('SELECT owner_id, name FROM stores WHERE id = ?', [order.store_id])
    const storeOwnerId = storeRows.length > 0 ? storeRows[0].owner_id : null
    const storeName = storeRows.length > 0 ? storeRows[0].name : 'Cửa hàng'

    // Kiểm tra nếu đơn hàng đã ở trạng thái PROCESSING thì gửi yêu cầu hủy
    if (order.status === ORDER_STATUS.PROCESSING) {
      const finalCancelReason = cancelReason || 'Khách hàng yêu cầu hủy đơn (đang xử lý)'

      await orderTrackingModel.updateOrderStatusWithReason(
        orderId,
        ORDER_STATUS.CANCEL_REQUESTED,
        finalCancelReason,
        connection
      )

      await connection.commit()

      // Gửi thông báo cho Vendor về yêu cầu hủy
      if (storeOwnerId) {
        await sendNotificationToVendor(
          order.store_id,
          orderId,
          buyerName,
          order.total_amount,
          finalCancelReason,
          NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED,
          'Yêu cầu hủy đơn hàng'
        )
      }

      // Gửi thông báo cho User
      await sendNotificationToUser(
        userId,
        orderId,
        'Đã gửi yêu cầu hủy đơn',
        `Yêu cầu hủy đơn hàng #${orderId} đã được gửi đến ${storeName}. Vui lòng chờ cửa hàng xác nhận.`,
        NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED
      )

      return {
        status: ORDER_STATUS.CANCEL_REQUESTED,
        message: 'Đã gửi yêu cầu hủy đơn hàng đến cửa hàng để chờ duyệt.'
      }
    }

    // Nếu là PENDING
    if (order.status === ORDER_STATUS.PENDING) {
      const orderTime = new Date(order.created_at).getTime()
      const currentTime = new Date().getTime()
      const differenceInMinutes = (currentTime - orderTime) / (1000 * 60)

      // Nếu quá 30 phút thì chuyển sang gửi yêu cầu hủy
      if (differenceInMinutes > 30) {
        const finalCancelReason = cancelReason || 'Khách hàng yêu cầu hủy đơn (quá 30 phút)'

        await orderTrackingModel.updateOrderStatusWithReason(
          orderId,
          ORDER_STATUS.CANCEL_REQUESTED,
          finalCancelReason,
          connection
        )

        await connection.commit()

        // Gửi thông báo cho Vendor về yêu cầu hủy
        if (storeOwnerId) {
          await sendNotificationToVendor(
            order.store_id,
            orderId,
            buyerName,
            order.total_amount,
            finalCancelReason,
            NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED,
            'Yêu cầu hủy đơn hàng (quá 30 phút)'
          )
        }

        // Gửi thông báo cho User
        await sendNotificationToUser(
          userId,
          orderId,
          'Đã gửi yêu cầu hủy đơn',
          `Đơn hàng #${orderId} đã quá 30 phút, yêu cầu hủy đã được gửi đến ${storeName}. Vui lòng chờ cửa hàng xác nhận.`,
          NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED
        )

        return {
          status: ORDER_STATUS.CANCEL_REQUESTED,
          message: 'Đơn hàng đã quá 30 phút kể từ khi tạo, yêu cầu hủy đã được gửi đến cửa hàng để chờ duyệt.'
        }
      }

      // Trong 30 phút - Hủy trực tiếp và hoàn lại stock
      const finalCancelReason = cancelReason || 'Khách hàng yêu cầu hủy đơn (trong 30 phút)'

      await orderTrackingModel.updateOrderStatusWithReason(
        orderId,
        ORDER_STATUS.CANCELLED,
        finalCancelReason,
        connection
      )

      const items = await orderTrackingModel.getOrderItemsByOrderId(orderId, connection)

      for (const item of items) {
        if (!item.variant_id) {
          throw new Error(`Item ${item.item_id} không có variant_id`)
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Item ${item.item_id} có số lượng không hợp lệ: ${item.quantity}`)
        }

        await orderModel.decreaseVariantStock(connection, item.variant_id, -item.quantity)
      }

      // Hoàn tiền ví nếu đơn có sử dụng ví
      // - Nếu đã PAID (thanh toán online) → hoàn toàn bộ total_amount vào ví (bao gồm cả phần gateway)
      // - Nếu UNPAID (COD) → chỉ hoàn phần wallet_amount_used
      const walletAmountUsed = Number(order.wallet_amount_used || 0)
      const refundAmount = order.payment_status === 'paid'
        ? Number(order.total_amount)
        : walletAmountUsed

      if (refundAmount > 0) {
        await walletModel.addToWalletInTransaction(
          connection, userId, refundAmount,
          `Hoàn tiền đơn hàng #${orderId} đã hủy`,
          orderId
        )
      }

      await connection.commit()

      // Gửi thông báo cho Vendor về việc đơn hàng đã bị hủy trực tiếp
      if (storeOwnerId) {
        await sendNotificationToVendor(
          order.store_id,
          orderId,
          buyerName,
          order.total_amount,
          finalCancelReason,
          NOTIFICATION_TYPES.ORDER_CANCELLED,
          'Đơn hàng đã bị hủy'
        )
      }

      // Gửi thông báo cho User
      await sendNotificationToUser(
        userId,
        orderId,
        'Đơn hàng đã được hủy',
        `Đơn hàng #${orderId} đã được hủy thành công. Số lượng sản phẩm đã được hoàn lại vào kho.`,
        NOTIFICATION_TYPES.ORDER_CANCELLED
      )

      return {
        status: ORDER_STATUS.CANCELLED,
        message: 'Đơn hàng của bạn đã được hủy trực tiếp thành công. Số lượng sản phẩm đã được hoàn lại vào kho hàng.'
      }
    }

    throw new Error(`Không thể xử lý hủy đơn với trạng thái hiện tại: ${order.status}`)

  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// 3. HỆ THỐNG: Cron Job tự động xác nhận đơn hàng
const handleAutoConfirmOrders = async () => {
  return await orderTrackingModel.autoConfirmOrders()
}

// 4. Rút yêu cầu hủy
const withdrawCancelRequest = async (userId, orderId) => {
  const order = await orderTrackingModel.getOrderById(orderId)

  if (!order) {
    throw new Error('Đơn hàng không tồn tại trên hệ thống.')
  }

  if (order.user_id !== userId) {
    throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')
  }

  if (order.status !== ORDER_STATUS.CANCEL_REQUESTED) {
    throw new Error('Đơn hàng không ở trạng thái chờ hủy, không thể rút lại yêu cầu hủy.')
  }

  // Lấy thông tin user và store để gửi thông báo
  const [userRows] = await pool.execute('SELECT fullname FROM users WHERE id = ?', [userId])
  const buyerName = userRows.length > 0 ? userRows[0].fullname : 'Khách hàng'

  const [storeRows] = await pool.execute('SELECT owner_id, name FROM stores WHERE id = ?', [order.store_id])
  const storeOwnerId = storeRows.length > 0 ? storeRows[0].owner_id : null
  const storeName = storeRows.length > 0 ? storeRows[0].name : 'Cửa hàng'

  // Rút yêu cầu hủy và xóa lý do hủy, chuyển về PROCESSING
  await orderTrackingModel.withdrawCancelOrderAndClearReason(orderId)

  // Gửi thông báo cho Vendor khi rút yêu cầu hủy
  if (storeOwnerId) {
    await sendNotificationToVendor(
      order.store_id,
      orderId,
      buyerName,
      order.total_amount,
      null,
      NOTIFICATION_TYPES.ORDER_PROCESSING,
      'Khách hàng đã rút yêu cầu hủy đơn hàng'
    )
  }

  // Gửi thông báo cho User khi rút yêu cầu hủy thành công
  await sendNotificationToUser(
    userId,
    orderId,
    'Đã rút yêu cầu hủy đơn',
    `Bạn đã rút lại yêu cầu hủy đơn hàng #${orderId}. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.`,
    NOTIFICATION_TYPES.ORDER_PROCESSING
  )

  return {
    status: ORDER_STATUS.PROCESSING,
    message: 'Rút lại yêu cầu hủy đơn thành công! Đơn hàng đã được đưa quay trở lại danh sách chuẩn bị hàng.'
  }
}

// 5. Lấy chi tiết đơn hàng
const getOrderDetail = async (userId, orderId) => {
  const order = await orderTrackingModel.getOrderDetailByIdAndUser(orderId, userId)

  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.')
  }

  const items = await orderTrackingModel.getOrderItemsByOrderId(orderId)
  order.items = items

  return order
}

const deletePendingOrders = async (userId, orderIds, sendNotification = true) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const deletedOrders = []

    for (const orderId of orderIds) {
      const order = await orderTrackingModel.getOrderById(orderId)

      if (!order) {
        throw new Error(`Đơn hàng #${orderId} không tồn tại`)
      }

      if (order.user_id !== userId) {
        throw new Error(`Bạn không có quyền xóa đơn hàng #${orderId}`)
      }

      if (order.status === ORDER_STATUS.PENDING) {
        deletedOrders.push({
          orderId: orderId,
          storeId: order.store_id,
          totalAmount: order.total_amount,
          walletAmountUsed: Number(order.wallet_amount_used || 0)
        })

        // Hoàn lại tiền ví trong transaction trước khi xóa đơn
        if (Number(order.wallet_amount_used || 0) > 0) {
          await walletModel.addToWalletInTransaction(
            connection, userId, Number(order.wallet_amount_used),
            `Hoàn tiền ví do thanh toán thất bại - đơn hàng #${orderId}`,
            orderId
          )
        }

        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [orderId])
        await connection.execute('DELETE FROM orders WHERE id = ? AND status = ?', [orderId, ORDER_STATUS.PENDING])
      }
    }

    await connection.commit()

    // CHỈ gửi thông báo khi sendNotification = true
    if (sendNotification) {
      for (const deleted of deletedOrders) {
        const [storeRows] = await pool.execute('SELECT name FROM stores WHERE id = ?', [deleted.storeId])
        const storeName = storeRows.length > 0 ? storeRows[0].name : 'Cửa hàng'

        await sendNotificationToUser(
          userId,
          deleted.orderId,
          'Thanh toán thất bại',
          `Đơn hàng #${deleted.orderId} tại ${storeName} đã bị hủy do thanh toán thất bại hoặc bị hủy. Vui lòng thử lại.`,
          NOTIFICATION_TYPES.ORDER_CANCELLED
        )
      }
    }

    return {
      success: true,
      message: `Đã xóa ${deletedOrders.length} đơn hàng pending thành công`
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const orderTrackingService = {
  getOrderHistory,
  cancelOrderByUser,
  handleAutoConfirmOrders,
  withdrawCancelRequest,
  getOrderDetail,
  deletePendingOrders
}