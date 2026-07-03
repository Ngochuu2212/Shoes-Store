import express from 'express'
import { vendorAppealController } from '~/controllers/vendor/vendorAppealController'
import { vendorAppealValidation } from '~/validations/vendor/vendorAppealValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. POST /api/vendor/appeals/submit -> Gửi đơn cứu xét
router.post(
  '/submit',
  CloudinaryProvider.uploadAppealFields,
  vendorAppealValidation.createAppeal,
  vendorAppealController.submitStoreAppeal
)

// 2. GET /api/vendor/appeals -> Lấy danh sách đơn của tôi
router.get('/', vendorAppealController.getMyAppeals)

// 3. GET /api/vendor/appeals/:id -> Xem chi tiết đơn
router.get('/:id', vendorAppealController.getAppealDetail)

export const vendorAppealRouter = router