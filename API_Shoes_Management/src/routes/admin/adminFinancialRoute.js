import express from 'express'
import { adminFinancialController } from '~/controllers/admin/adminFinancialController'
import { authGuard } from '~/middlewares/authGuard'
import { ROLE_ID } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorizeRoles(ROLE_ID.ADMIN))

router.get('/analytics', adminFinancialController.getPlatformFinancialAnalytics)

export const adminFinancialRouter = router