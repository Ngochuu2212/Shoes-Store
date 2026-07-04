import { shipperService } from '~/services/shipper/shipperService'

const getDashboard = async (req, res) => {
  try {
    const result = await shipperService.getDashboard(req.jwtDecoded?.id)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi: ${error.message}` })
  }
}

const getAvailableOrders = async (req, res) => {
  try {
    const result = await shipperService.getAvailableOrders(req.jwtDecoded?.id, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi: ${error.message}` })
  }
}

const acceptOrder = async (req, res) => {
  try {
    const result = await shipperService.acceptOrder(req.jwtDecoded?.id, Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const getMyDeliveries = async (req, res) => {
  try {
    const result = await shipperService.getMyDeliveries(req.jwtDecoded?.id, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi: ${error.message}` })
  }
}

const getDeliveryHistory = async (req, res) => {
  try {
    const result = await shipperService.getDeliveryHistory(req.jwtDecoded?.id, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi: ${error.message}` })
  }
}

const getOrderDetail = async (req, res) => {
  try {
    const result = await shipperService.getOrderDetail(req.jwtDecoded?.id, Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}

const startDelivery = async (req, res) => {
  try {
    const result = await shipperService.startDelivery(req.jwtDecoded?.id, Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const markDelivered = async (req, res) => {
  try {
    const result = await shipperService.markDelivered(req.jwtDecoded?.id, Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const uploadDeliveryProof = async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(f => f.path) : []
    const { note } = req.body
    const result = await shipperService.uploadDeliveryProof(req.jwtDecoded?.id, Number(req.params.id), imageUrls, note)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const completeDelivery = async (req, res) => {
  try {
    const result = await shipperService.completeDelivery(req.jwtDecoded?.id, Number(req.params.id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const shipperController = {
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
