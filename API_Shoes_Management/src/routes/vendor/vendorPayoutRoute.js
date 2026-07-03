import express from 'express'
import { vendorPayoutValidation } from '~/validations/vendor/vendorPayoutValidation'
import { vendorPayoutController } from '~/controllers/vendor/vendorPayoutController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/request', vendorPayoutValidation.createPayoutRequest, vendorPayoutController.createPayoutRequest)

router.get('/history', vendorPayoutValidation.getPayoutHistory, vendorPayoutController.getPayoutHistory)

router.get('/export', vendorPayoutController.exportPayoutHistory)

export const vendorPayoutRouter = router