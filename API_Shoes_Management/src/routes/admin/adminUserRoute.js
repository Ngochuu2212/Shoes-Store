import express from 'express'
import { adminUserController } from '~/controllers/admin/adminUserController'
import { adminUserValidation } from '~/validations/admin/adminUserValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// Bắt buộc đi qua middleware kiểm tra đăng nhập (Chỉ duy nhất ADMIN mới có quyền sờ vào)
router.use(authGuard.isAuthorized)

router.get('/', adminUserController.getUsersList)

router.patch('/change-role-bulk', adminUserValidation.changeUserRoleBulk, adminUserController.changeUserRoleBulk)

router.patch('/toggle-active-bulk', adminUserValidation.checkUserIdsMendatory, adminUserController.toggleUserActiveBulk)

router.get('/:id', adminUserController.getUserDetail)

router.post('/add', CloudinaryProvider.streamUpload, adminUserValidation.createUser, adminUserController.createUser)
router.put('/:id', CloudinaryProvider.streamUpload, adminUserValidation.updateUser, adminUserController.updateUser)
router.delete('/delete-bulk', adminUserValidation.checkUserIdsMendatory, adminUserController.deleteUsersBulk)

export const adminUserRouter = router