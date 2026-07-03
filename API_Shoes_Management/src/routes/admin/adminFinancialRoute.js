import express from 'express'
import { adminFinancialController } from '~/controllers/admin/adminFinancialController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/analytics', adminFinancialController.getPlatformFinancialAnalytics)

export const adminFinancialRouter = router