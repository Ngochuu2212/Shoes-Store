import express from 'express'
import { walletController } from '~/controllers/user/walletController'
import { authGuard } from '~/middlewares/authGuard'
const router = express.Router()
router.use(authGuard.isAuthorized)
router.get('/', walletController.getWallet)
export const walletRouter = router
