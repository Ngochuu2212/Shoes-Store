import express from 'express'
import { vendorAnalyticsController } from '~/controllers/vendor/vendorAnalyticsController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/revenue', vendorAnalyticsController.getRevenueAnalytics)

export const vendorAnalyticsRouter = router