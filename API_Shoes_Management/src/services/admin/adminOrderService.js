import { adminOrderModel } from '~/models/admin/order/adminOrderModel'
import { ORDER_STATUS } from '~/utils/constants'

// 1. Tải danh sách đơn hàng toàn sàn (Phân trang tự động)
const getAllOrdersSystem = async (queryParams) => {
  const page = Number(queryParams.page) || 1
  const limit = Number(queryParams.limit) || 10
  const offset = (page - 1) * limit

  // Chạy song song 3 tác vụ để tối ưu hiệu năng tối đa
  const [orders, totalItems, overviewStats] = await Promise.all([
    adminOrderModel.getAllOrdersSystem({
      status: queryParams.status,
      paymentStatus: queryParams.paymentStatus,
      searchOrderId: queryParams.searchOrderId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      limit,
      offset
    }),
    adminOrderModel.countAllOrdersSystem({
      status: queryParams.status,
      paymentStatus: queryParams.paymentStatus,
      searchOrderId: queryParams.searchOrderId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate
    }),
    adminOrderModel.getOrdersOverviewStatsSystem()
  ])

  return {
    overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    orders
  }
}

// 2. Xem chi tiết đơn hàng phục vụ thanh tra
const getOrderDetailSystem = async (orderId) => {
  const order = await adminOrderModel.getOrderDetailSystem(orderId)
  if (!order) {
    throw new Error('Không tìm thấy thông tin chi tiết của mã đơn hàng này.')
  }
  return order
}

// 3. Logic ép hủy đơn tranh chấp cấp độ vĩ mô
const forceCancelOrder = async (orderId, adminNote) => {
  const order = await adminOrderModel.getOrderDetailSystem(orderId)
  if (!order) throw new Error('Đơn hàng cần ép hủy không tồn tại trên hệ thống.')

  // RÀNG BUỘC CỨNG: Nếu đơn đã hoàn thành giao (delivered) hoặc đã hủy từ trước (cancelled) -> Chặn can thiệp
  if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)) {
    throw new Error(`Đơn hàng đã ở trạng thái kết thúc [${order.status}]. Admin không thể can thiệp ép hủy luồng này.`)
  }

  // Kích nổ lệnh hủy vĩ mô qua Transaction hoàn kho + ghi nhận hoàn tiền
  await adminOrderModel.forceCancelOrderTransaction(orderId, adminNote)

  return {
    message: `Lệnh tối cao thực thi thành công: Đơn hàng #${orderId} đã được ép hủy và hoàn kho giày. Trạng thái thanh toán được chuyển sang [refunded] để Ban quản trị tiến hành đối soát hoàn tiền thủ công bên ngoài hệ thống.`
  }
}

export const adminOrderService = {
  getAllOrdersSystem,
  getOrderDetailSystem,
  forceCancelOrder
}