import express from 'express'
import { vendorProductController } from '~/controllers/vendor/vendorProductController'
import { vendorProductValidation } from '~/validations/vendor/vendorProductValidation'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. Đăng ký sản phẩm mới
router.post('/add', vendorProductValidation.validateCreateProductBody, vendorProductController.createProduct)

// 2. Chỉnh sửa sản phẩm
router.put('/update/:id', vendorProductValidation.validateUpdateProduct, vendorProductController.updateProduct)

// 3. Xóa cứng đơn lẻ
router.delete('/delete/:id', vendorProductValidation.validateProductIdParam, vendorProductController.deleteProduct)

// 4. Thêm biến thể
router.post(
  '/add/:id/variants',
  CloudinaryProvider.uploadVariantImage,
  vendorProductValidation.validateCreateVariantBody,
  vendorProductController.createVariant
)

// 5. Cập nhật biến thể
router.put(
  '/:productId/variants/:variantId',
  CloudinaryProvider.uploadVariantImage,
  vendorProductValidation.validateUpdateVariantBody,
  vendorProductController.updateVariant
)

// 6. Xóa biến thể
router.delete(
  '/:productId/variants/:variantId',
  vendorProductValidation.validateVariantIdParam,
  vendorProductController.deleteVariant
)

// 7. Lấy danh sách biến thể
router.get(
  '/:productId/variants',
  vendorProductValidation.validateProductIdParam,
  vendorProductController.getVariantsByProductId
)

// 8. Tải danh sách sản phẩm
router.get('/', vendorProductValidation.validateGetProductsFilters, vendorProductController.getVendorProducts)

// 9. Xem chi tiết
router.get('/detail/:id', vendorProductValidation.validateProductIdParam, vendorProductController.getProductDetail)

// 10. Bật/Tắt 1 sản phẩm
router.patch('/:id/toggle-active', vendorProductValidation.validateToggleActiveSingleBody, vendorProductController.toggleProductActiveSingle)

// 11. Bật/Tắt hàng loạt
router.patch('/toggle-active-bulk', vendorProductValidation.validateToggleActiveBulkBody, vendorProductController.toggleProductsActiveBulk)

// 12. Xóa hàng loạt
router.delete('/delete-bulk', vendorProductValidation.validateProductIdsBulkBody, vendorProductController.deleteProductsBulk)

// 13. Yêu cầu duyệt lại
router.patch('/request-reapproval-bulk', vendorProductValidation.validateProductIdsBulkBody, vendorProductController.requestProductsReapprovalBulk)

export const vendorProductRouter = router