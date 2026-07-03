import express from 'express'
import { managerProductController } from '~/controllers/manager/managerProductController'
import { managerProductValidation } from '~/validations/manager/managerProductValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// Chốt chặn token yêu cầu đăng nhập tài khoản có quyền Điều hành viên (Manager)
router.use(authGuard.isAuthorized)

// 1. GET /api/manager/products -> Xem danh sách sản phẩm toàn sàn phục vụ trang kiểm duyệt (Có Widgets)
router.get('/', managerProductValidation.validateGetProductsFilters, managerProductController.getProductsList)

// 2. PUT /api/manager/products/:id/status -> Phê duyệt / Từ chối / Khóa đơn lẻ 1 đôi giày
router.put('/:id/status', managerProductValidation.validateToggleProductActiveBody, managerProductController.toggleProductActive)

// 3. PATCH /api/manager/products/status-bulk -> Phê duyệt hoặc Khóa hàng loạt từ Checkbox tích chọn
router.patch('/status-bulk', managerProductValidation.validateToggleProductsActiveBulkBody, managerProductController.toggleProductsActiveBulk)

// 4. GET /api/manager/products/:slug -> Xem chi tiết thông tin sâu của sản phẩm phục vụ Modal popup xem trước
router.get('/:id', managerProductValidation.validateProductIdParam, managerProductController.getProductDetail)

export const managerProductRouter = router