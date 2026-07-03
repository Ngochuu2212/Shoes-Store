import express from 'express'
import { vendorPromotionController } from '~/controllers/vendor/vendorPromotionController'
import { vendorPromotionValidation } from '~/validations/vendor/vendorPromotionValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. GET /api/vendor/promotions -> Danh sách khuyến mãi phân trang kèm bộ lọc
router.get('/', vendorPromotionValidation.validateGetPromotionsFilters, vendorPromotionController.getVendorPromotions)

// 2. GET /api/vendor/promotions/detail/:id -> Xem chi tiết 1 mã
router.get('/detail/:id', vendorPromotionValidation.validateIdParam, vendorPromotionController.getPromotionById)

// 3. POST /api/vendor/promotions/add -> Thêm mới voucher
router.post('/add', vendorPromotionValidation.validatePromotionBody, vendorPromotionController.createPromotion)

// 4. PUT /api/vendor/promotions/update/:id -> Sửa voucher
router.put('/update/:id', vendorPromotionValidation.validatePromotionBody, vendorPromotionController.updatePromotion)

// 5. DELETE /api/vendor/promotions/delete/:id -> Xóa lẻ 1 voucher khỏi sàn
router.delete('/delete/:id', vendorPromotionValidation.validateIdParam, vendorPromotionController.deletePromotion)

// 6. PATCH /api/vendor/promotions/:id/toggle-active -> Nút gạt Switch ẩn/hiện đơn lẻ cuối dòng table
router.patch('/:id/toggle-active', vendorPromotionValidation.validateToggleActiveSingleBody, vendorPromotionController.togglePromotionActiveSingle)

// 7. PATCH /api/vendor/promotions/toggle-active-bulk -> Bật/Tắt hoạt động hàng loạt từ Checkbox
router.patch('/toggle-active-bulk', vendorPromotionValidation.validateBulkIdsBody, vendorPromotionController.togglePromotionsActiveBulk)

// 8. DELETE /api/vendor/promotions/delete-bulk -> Xóa cứng hàng loạt chương trình qua Checkbox
router.delete('/delete-bulk', vendorPromotionValidation.validateBulkIdsBody, vendorPromotionController.deletePromotionsBulk)

export const vendorPromotionRouter = router