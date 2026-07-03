import express from 'express'
import { storeController } from '~/controllers/user/storeController'

const router = express.Router()

router.get('/detail/:id', storeController.getStoreDetail)
router.get('/products/:id', storeController.getStoreProducts)
router.get('/:id/reviews', storeController.getStoreReviews)

export const storeRouter = router