import express from 'express'
import { adminOrderController } from '~/controllers/admin/adminOrderController'
import { adminOrderValidation } from '~/validations/admin/adminOrderValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', adminOrderValidation.checkFiltersAndId, adminOrderController.getAllOrdersSystem)

router.get('/:orderId', adminOrderValidation.checkFiltersAndId, adminOrderController.getOrderDetailSystem)

router.put('/force-cancel/:orderId', adminOrderValidation.validateForceCancelBody, adminOrderController.forceCancelOrder)

export const adminOrderRouter = router