import express from 'express'
import { cartController } from '~/controllers/user/cartController'
import { cartValidation } from '~/validations/user/cartValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/add', cartValidation.addToCart, cartController.addToCart)
router.get('/', cartController.getCart)
router.put('/update', cartValidation.updateQuantity, cartController.updateQuantity)
router.delete('/remove', cartController.removeFromCart)

export const cartRouter = router