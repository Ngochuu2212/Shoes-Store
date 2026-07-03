import express from 'express'
import { vendorStoreController } from '~/controllers/vendor/vendorStoreController'
import { vendorStoreValidation } from '~/validations/vendor/vendorStoreValidation'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

// Chốt chặn bảo mật tài khoản yêu cầu quyền hạn Vendor
router.use(authGuard.isAuthorized)

// 1. POST /api/vendor/stores/register -> Đăng ký mở shop
router.post('/register', CloudinaryProvider.uploadStoreFiles, vendorStoreValidation.validateRegisterStoreBody, vendorStoreController.registerStore)

// 2. GET /api/vendor/stores/profile -> Xem thông tin shop cá nhân
router.get('/profile', vendorStoreController.getStoreProfile)

// 3. PUT /api/vendor/stores/profile -> Cập nhật thông tin shop
router.put('/profile', CloudinaryProvider.uploadStoreFiles, vendorStoreValidation.validateUpdateStoreProfileBody, vendorStoreController.updateStoreProfile)

// 4. GET /api/vendor/stores/status -> Kiểm tra trạng thái đăng ký
router.get('/status', vendorStoreController.checkStoreRegistrationStatus)
export const vendorStoreRouter = router