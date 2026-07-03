import express from 'express'
import { managerStoreController } from '~/controllers/manager/managerStoreController'
import { managerStoreValidation } from '~/validations/manager/managerStoreValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// Yêu cầu quyền hạn tài khoản đăng nhập Điều hành viên (Manager)
router.use(authGuard.isAuthorized)

// 1. GET /api/manager/stores -> Tải danh sách cửa hàng toàn sàn phân trang + Widgets
router.get('/', managerStoreValidation.validateGetStoresFilters, managerStoreController.getStoresList)

// 2. GET /api/manager/stores/:id -> Xem chi tiết thông tin sâu của 1 cửa hàng
router.get('/:id', managerStoreValidation.validateStoreIdParam, managerStoreController.getStoreDetail)

// 3. Luồng phê duyệt mở Shop (Hỗ trợ cả nút bấm lẻ lẫn Checkbox chọn loạt)
router.put('/:id/approve', managerStoreValidation.validateApproveStoresBody, managerStoreController.approveStoresBulk)
router.patch('/approve-bulk', managerStoreValidation.validateApproveStoresBody, managerStoreController.approveStoresBulk)

// 4. Luồng từ chối đơn đăng ký mở Shop (Yêu cầu nhập lý do phản hồi)
router.delete('/:id/reject', managerStoreValidation.validateRejectOrBanStoresBody, managerStoreController.rejectStoresBulk)
router.patch('/reject-bulk', managerStoreValidation.validateRejectOrBanStoresBody, managerStoreController.rejectStoresBulk)

// 5. Luồng xử phạt đình chỉ khóa Shop vi phạm (Yêu cầu nhập lý do phạt)
router.put('/:id/ban', managerStoreValidation.validateRejectOrBanStoresBody, managerStoreController.banStoresBulk)
router.patch('/ban-bulk', managerStoreValidation.validateRejectOrBanStoresBody, managerStoreController.banStoresBulk)

export const managerStoreRouter = router