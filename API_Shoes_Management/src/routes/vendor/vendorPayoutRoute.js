import express from 'express'
import { vendorPayoutValidation } from '~/validations/vendor/vendorPayoutValidation'
import { vendorPayoutController } from '~/controllers/vendor/vendorPayoutController'
import { authGuard } from '~/middlewares/authGuard'
import { ROLE_ID } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorizeRoles(ROLE_ID.VENDOR))

router.post('/request', vendorPayoutValidation.createPayoutRequest, vendorPayoutController.createPayoutRequest)

router.get('/history', vendorPayoutValidation.getPayoutHistory, vendorPayoutController.getPayoutHistory)

router.get('/export', vendorPayoutController.exportPayoutHistory)

export const vendorPayoutRouter = router