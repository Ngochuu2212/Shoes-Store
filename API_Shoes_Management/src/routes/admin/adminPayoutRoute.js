import express from 'express'
import { adminPayoutValidation } from '~/validations/admin/adminPayoutValidation'
import { adminPayoutController } from '~/controllers/admin/adminPayoutController'
import { authGuard } from '~/middlewares/authGuard'
import { ROLE_ID } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorizeRoles(ROLE_ID.ADMIN))

router.get('/', adminPayoutValidation.getPayoutList, adminPayoutController.getPayoutList)

router.get('/export', adminPayoutController.exportPayoutList)

router.get('/:id', adminPayoutValidation.getPayoutDetail, adminPayoutController.getPayoutDetail)

router.put('/:id/process', adminPayoutValidation.processPayout, adminPayoutController.processPayout)

export const adminPayoutRouter = router