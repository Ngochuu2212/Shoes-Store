import express from 'express'
import { vendorReviewController } from '~/controllers/vendor/vendorReviewController.js'
import { vendorReviewValidation } from '~/validations/vendor/vendorReviewValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. GET /api/vendor/reviews -> Lấy danh sách review của Shop có phân trang, bộ lọc Tab sản phẩm/cửa hàng
router.get('/', vendorReviewValidation.validateGetReviewsFilters, vendorReviewController.getVendorReviews)

// 2. GET /api/vendor/reviews/:id -> Xem chi tiết 1 bình luận (Bốc kèm thông tin người mua + mảng ảnh)
router.get('/:id', vendorReviewValidation.validateReviewDetailParams, vendorReviewController.getReviewDetail)

// 3. PUT /api/vendor/reviews/:id/report -> Tố cáo vi phạm 1 bài viết đơn lẻ (Tái sử dụng chung validate mảng)
router.put('/:id/report', vendorReviewValidation.validateReportReviewsBody, vendorReviewController.reportReview)

// 4. PATCH /api/vendor/reviews/report-bulk -> Tố cáo vi phạm hàng loạt từ Checkbox tích chọn
router.patch('/report-bulk', vendorReviewValidation.validateReportReviewsBody, vendorReviewController.reportReviewsBulk)

// 5. PATCH /api/vendor/reviews/request-reopen-bulk -> Gửi đơn khiếu nại giải trình xin mở lại bài viết bị ẩn
router.patch('/request-reopen-bulk', vendorReviewValidation.validateRequestReopenBody, vendorReviewController.requestReviewsReopenBulk)

export const vendorReviewRouter = router