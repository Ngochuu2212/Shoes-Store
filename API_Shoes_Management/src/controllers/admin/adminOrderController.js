import { adminOrderService } from '~/services/admin/adminOrderService'

// Xem danh sách toàn bộ đơn hàng
const getAllOrdersSystem = async (req, res) => {
  try {
    const result = await adminOrderService.getAllOrdersSystem(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi hệ thống khi tải đơn hàng vĩ mô: ${error.message}` })
  }
}

// Xem chi tiết đơn hàng
const getOrderDetailSystem = async (req, res) => {
  try {
    const { orderId } = req.params
    const result = await adminOrderService.getOrderDetailSystem(Number(orderId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi hệ thống khi tải chi tiết đơn hàng: ${error.message}` })
  }
}

// Lệnh ép hủy đơn hàng tranh chấp
const forceCancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { adminNote } = req.body

    const result = await adminOrderService.forceCancelOrder(Number(orderId), adminNote)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi hệ thống khi thực thi ép hủy đơn: ${error.message}` })
  }
}

export const adminOrderController = {
  getAllOrdersSystem,
  getOrderDetailSystem,
  forceCancelOrder
}