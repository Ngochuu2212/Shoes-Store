import express from 'express'
import { vendorFavoriteController } from '~/controllers/vendor/vendorFavoriteController.js'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', vendorFavoriteController.getFavoriteAnalytics)

router.get('/:id/users', vendorFavoriteController.getProductFavoriteDetail)

export const vendorFavoriteRouter = router