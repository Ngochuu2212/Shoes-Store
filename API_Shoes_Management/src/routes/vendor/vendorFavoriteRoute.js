import express from 'express'
import { vendorFavoriteController } from '~/controllers/vendor/vendorFavoriteController.js'
import { authGuard } from '~/middlewares/authGuard'
import { ROLE_ID } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorizeRoles(ROLE_ID.VENDOR))

router.get('/', vendorFavoriteController.getFavoriteAnalytics)

router.get('/:id/users', vendorFavoriteController.getProductFavoriteDetail)

export const vendorFavoriteRouter = router