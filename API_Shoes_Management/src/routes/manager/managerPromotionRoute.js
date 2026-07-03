import express from 'express'
import { managerPromotionController } from '~/controllers/manager/managerPromotionController'
import { managerPromotionValidation } from '~/validations/manager/managerPromotionValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. GET /api/manager/promotions -> Danh sách mã khuyến mãi hệ thống
router.get('/', managerPromotionValidation.validateGetPromotionsFilters, managerPromotionController.getSystemPromotions)

// 2. GET /api/manager/promotions/detail/:id -> Chi tiết 1 mã
router.get('/detail/:id', managerPromotionValidation.validateIdParam, managerPromotionController.getPromotionById)

// 3. POST /api/manager/promotions/add -> Thêm mã mới
router.post('/add', managerPromotionValidation.validatePromotionBody, managerPromotionController.createPromotion)

// 4. PUT /api/manager/promotions/update/:id -> Sửa mã
router.put('/update/:id', managerPromotionValidation.validatePromotionBody, managerPromotionController.updatePromotion)

// 5. DELETE /api/manager/promotions/delete/:id -> Xóa lẻ 1 mã
router.delete('/delete/:id', managerPromotionValidation.validateIdParam, managerPromotionController.deletePromotion)

// 6. PATCH /api/manager/promotions/:id/toggle-active -> Switch ẩn/hiện đơn lẻ
router.patch('/:id/toggle-active', managerPromotionValidation.validateToggleActiveSingleBody, managerPromotionController.togglePromotionActiveSingle)

// 7. PATCH /api/manager/promotions/toggle-active-bulk -> Bật/Tắt hàng loạt
router.patch('/toggle-active-bulk', managerPromotionValidation.validateBulkIdsBody, managerPromotionController.togglePromotionsActiveBulk)

// 8. DELETE /api/manager/promotions/delete-bulk -> Xóa cứng hàng loạt
router.delete('/delete-bulk', managerPromotionValidation.validateBulkIdsBody, managerPromotionController.deletePromotionsBulk)

export const managerPromotionRouter = router
