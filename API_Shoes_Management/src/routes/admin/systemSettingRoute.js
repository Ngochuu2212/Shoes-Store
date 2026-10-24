import express from 'express'
import { systemSettingController } from '~/controllers/admin/systemSettingController'
import { systemSettingValidation } from '~/validations/admin/systemSettingValidation'
import { authGuard } from '~/middlewares/authGuard'
import { ROLE_ID } from '~/utils/constants'

const router = express.Router()

// Public: mọi layout (kể cả khách chưa đăng nhập) gọi để biết hệ thống có đang bảo trì không
router.get('/maintenance-status', systemSettingController.getMaintenanceStatus)

router.use(authGuard.isAuthorized)
router.use(authGuard.authorizeRoles(ROLE_ID.ADMIN))

router.get('/', systemSettingController.getSystemSettings)

router.put('/update', systemSettingValidation.updateSystemSettings, systemSettingController.updateSystemSettings)

export const adminSystemSettingRouter = router