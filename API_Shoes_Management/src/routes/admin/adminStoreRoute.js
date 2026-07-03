import express from 'express'
import { adminStoreController } from '~/controllers/admin/adminStoreController'
import { adminStoreValidation } from '~/validations/admin/adminStoreValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. GET /api/admin/stores -> Danh sách cửa hàng
router.get('/', adminStoreController.getStoresList)

// 2. GET /api/admin/stores/detail/:id -> Chi tiết cửa hàng
router.get('/:id', adminStoreController.getStoreDetail)

// 3. GET /api/admin/stores/:id/products -> Danh sách sản phẩm của cửa hàng
router.get('/:id/products', adminStoreController.getStoreProducts)

// 4. PATCH /api/admin/stores/toggle-active-bulk -> Đóng băng/mở khóa hàng loạt
router.patch('/toggle-active-bulk', adminStoreValidation.checkStoreIdsMandatory, adminStoreController.toggleStoreActiveBulk)

// 5. PATCH /api/admin/stores/commission-bulk -> Cập nhật phí hoa hồng hàng loạt
router.patch('/commission-bulk', adminStoreValidation.updateCommissionBulk, adminStoreController.updateStoreCommissionBulk)

// 6. POST /api/admin/stores/enforce-balance -> Cưỡng chế số dư ví
router.post('/enforce-balance', adminStoreValidation.enforceBalance, adminStoreController.enforceStoreBalance)

// 7. POST /api/admin/stores/add -> Tạo cửa hàng mới
router.post(
  '/add',
  CloudinaryProvider.uploadStoreFiles,
  adminStoreValidation.createStore,
  adminStoreController.createStore
)

// 8. DELETE /api/admin/stores/delete-bulk -> Xóa cửa hàng hàng loạt
router.delete(
  '/delete-bulk',
  adminStoreValidation.checkStoreIdsBulk,
  adminStoreController.deleteStoresBulk
)

export const adminStoreRouter = router