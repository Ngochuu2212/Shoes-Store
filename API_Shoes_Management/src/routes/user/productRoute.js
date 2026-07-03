import express from 'express'
import { productController } from '~/controllers/user/productController'
import { reviewController } from '~/controllers/user/reviewController'
import { favoriteController } from '~/controllers/user/favoriteController'
import { favoriteValidation } from '~/validations/user/favoriteValidation'
import { productValidation } from '~/validations/user/productValidation'
import { reviewValidation } from '~/validations/user/reviewValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// product
router.get('/homepage-products', productController.getHomepageProducts)
router.get('/recommendations/empty-cart', productController.getEmptyCartRecommendations)
router.get('/recommendations/post-checkout', productController.getPostCheckoutRecommendations)
router.get('/search-filter', productValidation.searchAndFilterProducts, productController.searchAndFilterProducts)
router.get('/detail/:slug', productValidation.getProductDetail, productController.getProductDetail)

// favorite
router.post('/toggle', authGuard.isAuthorized, favoriteValidation.toggleFavorite, favoriteController.toggleFavorite)
router.get('/', authGuard.isAuthorized, favoriteController.getFavoriteProducts)

// review
router.get('/:slug/reviews', reviewValidation.validateGetProductReviews, reviewController.getProductReviews)
export const productRouter = router