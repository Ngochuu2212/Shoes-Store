import express from 'express'
import { managerReviewController } from '~/controllers/manager/managerReviewController'
import { managerReviewValidation } from '~/validations/manager/managerReviewValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// Yêu cầu quyền hạn tài khoản đăng nhập Điều hành viên (Manager) cho toàn phân hệ
router.use(authGuard.isAuthorized)

// 1. GET /api/manager/reviews -> Lấy danh sách đánh giá bị tố cáo + Phân trang + Widgets
router.get('/', managerReviewValidation.validateGetReportedReviewsFilters, managerReviewController.getReportedReviews)

// 2. GET /api/manager/reviews/:id -> Xem chi tiết 1 bình luận bị tố cáo để phục vụ thanh tra
router.get('/:id', managerReviewValidation.validateReviewDetailParams, managerReviewController.getReviewDetail)

// 3. PATCH /api/manager/reviews/resolve-bulk -> Phân xử khiếu nại hàng loạt từ Checkbox tích chọn
router.patch('/resolve-bulk', managerReviewValidation.validateResolveReviewsBulkBody, managerReviewController.resolveReviewsBulk)

export const managerReviewRouter = router