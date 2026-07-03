import express from 'express'
import { adminCategoryController } from '~/controllers/admin/adminCategoryController'
import { adminCategoryValidation } from '~/validations/admin/adminCategoryValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'
import multer from 'multer'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', adminCategoryController.getCategoryTree)

router.post(
  '/add',
  CloudinaryProvider.streamUploadCategory,
  adminCategoryValidation.createCategory,
  adminCategoryController.createCategory
)

router.put(
  '/update/:id',
  CloudinaryProvider.streamUploadCategory,
  adminCategoryValidation.updateCategory,
  adminCategoryController.updateCategory
)

router.patch(
  '/toggle-status/:id',
  adminCategoryValidation.toggleCategoryStatus,
  adminCategoryController.toggleCategoryStatus
)

router.delete('/delete/:id', adminCategoryController.deleteCategory)

router.get('/detail/:id', adminCategoryController.getCategoryDetail)

export const adminCategoryRouter = router