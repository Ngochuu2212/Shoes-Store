import express from 'express'
import { orderController } from '~/controllers/user/orderController'
import { orderTrackingController } from '~/controllers/user/orderTrackingController'
import { reviewController } from '~/controllers/user/reviewController'
import { orderValidation } from '~/validations/user/orderValidation'
import { orderTrackingValidation } from '~/validations/user/orderTrackingValidation'
import { reviewValidation } from '~/validations/user/reviewValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.get('/vnpay-return', orderController.vnpayReturn)
router.post('/momo-ipn', orderController.momoReturnIPN)
router.get('/momo-return', orderController.momoReturn)

router.use(authGuard.isAuthorized)

router.post('/checkout-cod', orderValidation.validateCheckout, orderController.createOrderCOD)
router.post('/checkout-online', orderValidation.validateCheckout, orderController.createOrderOnline)
router.get('/history', orderTrackingController.getOrderHistory)

router.get('/detail/:orderId',
  orderTrackingValidation.checkOrderIdParam,
  orderTrackingController.getOrderDetail
)
router.put('/cancel/:orderId', orderTrackingValidation.checkOrderIdParam,
  orderTrackingController.cancelOrderByUser)
router.put('/cancel-withdraw/:orderId', orderTrackingValidation.checkOrderIdParam,
  orderTrackingController.withdrawCancelRequest)
router.put('/return/:orderId', orderTrackingValidation.checkOrderIdParam,
  orderTrackingController.requestOrderReturn)
router.delete('/pending-orders', orderTrackingController.deletePendingOrders)

router.post('/:orderId/reviews', reviewValidation.validateProductReviewBody,
  CloudinaryProvider.uploadReviewFields, reviewController.createReview)
router.post('/:orderId/store-reviews', reviewValidation.validateStoreReviewBody,
  reviewController.createStoreReview)

export const orderRouter = router