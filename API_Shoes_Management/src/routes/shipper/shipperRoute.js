import express from 'express'
import { shipperController } from '~/controllers/shipper/shipperController'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

router.use(authGuard.isAuthorized)

// Dashboard
router.get('/dashboard', shipperController.getDashboard)
router.get('/dashboard/charts', shipperController.getDashboardCharts)

// Đơn hàng chờ shipper nhận
router.get('/available-orders', shipperController.getAvailableOrders)
router.put('/available-orders/:id/accept', shipperController.acceptOrder)

// Đơn hàng của tôi (đang giao)
router.get('/my-deliveries', shipperController.getMyDeliveries)
router.get('/orders/:id', shipperController.getOrderDetail)
router.put('/orders/:id/start', shipperController.startDelivery)
router.put('/orders/:id/delivered', shipperController.markDelivered)
router.put('/orders/:id/upload-proof', CloudinaryProvider.uploadDeliveryProofImages, shipperController.uploadDeliveryProof)
router.put('/orders/:id/complete', shipperController.completeDelivery)

// Lịch sử giao hàng
router.get('/history', shipperController.getDeliveryHistory)

export const shipperRouter = router
