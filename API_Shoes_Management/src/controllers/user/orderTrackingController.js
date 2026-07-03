import { orderTrackingService } from '~/services/user/orderTrackingService'

const getOrderHistory = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await orderTrackingService.getOrderHistory(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải lịch sử mua hàng: ${error.message}` })
  }
}

const cancelOrderByUser = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params
    const { reason } = req.body

    const result = await orderTrackingService.cancelOrderByUser(userId, Number(orderId), reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý yêu cầu hủy đơn: ${error.message}` })
  }
}

const withdrawCancelRequest = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params

    const result = await orderTrackingService.withdrawCancelRequest(userId, Number(orderId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi rút yêu cầu hủy đơn: ${error.message}` })
  }
}

const getOrderDetail = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params

    const result = await orderTrackingService.getOrderDetail(userId, Number(orderId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}

const deletePendingOrders = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderIds } = req.body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        message: 'Vui lòng cung cấp danh sách orderId cần xóa'
      })
    }

    const result = await orderTrackingService.deletePendingOrders(userId, orderIds, true)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi xóa đơn hàng pending: ${error.message}`
    })
  }
}

export const orderTrackingController = {
  getOrderHistory,
  cancelOrderByUser,
  withdrawCancelRequest,
  getOrderDetail,
  deletePendingOrders
}