import express from 'express'
import { systemSettingController } from '~/controllers/admin/systemSettingController'
import { systemSettingValidation } from '~/validations/admin/systemSettingValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)
// router.use(authGuard.isAdmin) // Nếu b có middleware phân quyền admin riêng thì bọc thêm ở đây nhé

router.get('/', systemSettingController.getSystemSettings)

router.put('/update', systemSettingValidation.updateSystemSettings, systemSettingController.updateSystemSettings)

export const adminSystemSettingRouter = router