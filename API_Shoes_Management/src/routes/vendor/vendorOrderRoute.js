import express from 'express'
import { vendorOrderController } from '~/controllers/vendor/vendorOrderController'
import { vendorOrderValidation } from '~/validations/vendor/vendorOrderValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', vendorOrderValidation.validateGetOrdersFilters, vendorOrderController.getVendorOrders)
router.put('/:id/update-status', vendorOrderValidation.validateUpdateStatusBody, vendorOrderController.updateOrderStatus)
router.put('/:id/handle-cancel', vendorOrderValidation.validateCancelRequestBody, vendorOrderController.handleCancelRequest)
router.patch('/update-status-bulk', vendorOrderValidation.validateUpdateStatusBulkBody, vendorOrderController.updateOrderStatusBulk)

export const vendorOrderRouter = router