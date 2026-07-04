import { vendorOrderService } from '~/services/vendor/vendorOrderService'

const getVendorOrders = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorOrderService.getVendorOrders(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy danh sách đơn hàng: ${error.message}` })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { status } = req.body

    const result = await vendorOrderService.updateOrderStatus(userId, Number(id), status)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}` })
  }
}

const handleCancelRequest = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { decision, reason } = req.body

    const result = await vendorOrderService.handleCancelRequest(userId, Number(id), { decision, reason })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xử lý yêu cầu hủy đơn: ${error.message}` })
  }
}

const updateOrderStatusBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderIds, targetStatus } = req.body

    const result = await vendorOrderService.updateOrderStatusBulk(userId, orderIds, targetStatus)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi cập nhật hàng loạt đơn hàng: ${error.message}` })
  }
}

const assignToShipper = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const result = await vendorOrderService.assignToShipper(userId, Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const handleReturnRequest = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { decision, reason } = req.body

    const result = await vendorOrderService.handleReturnRequest(userId, Number(id), { decision, reason })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xử lý yêu cầu trả hàng: ${error.message}` })
  }
}

export const vendorOrderController = {
  getVendorOrders,
  updateOrderStatus,
  handleCancelRequest,
  updateOrderStatusBulk,
  assignToShipper,
  handleReturnRequest
}