import express from 'express'
import { adminOrderController } from '~/controllers/admin/adminOrderController'
import { adminOrderValidation } from '~/validations/admin/adminOrderValidation'
import { authGuard } from '~/middlewares/authGuard'
import { ROLE_ID } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorizeRoles(ROLE_ID.ADMIN))

router.get('/', adminOrderValidation.checkFiltersAndId, adminOrderController.getAllOrdersSystem)

router.get('/:orderId', adminOrderValidation.checkFiltersAndId, adminOrderController.getOrderDetailSystem)

router.put('/force-cancel/:orderId', adminOrderValidation.validateForceCancelBody, adminOrderController.forceCancelOrder)

export const adminOrderRouter = router