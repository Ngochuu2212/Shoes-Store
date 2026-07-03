import express from 'express'
import { managerAppealController } from '~/controllers/manager/managerAppealController'
import { managerAppealValidation } from '~/validations/manager/managerAppealValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. GET /api/manager/appeals -> Danh sách đơn cứu xét
router.get('/', managerAppealController.getAppealsList)

// 2. GET /api/manager/appeals/:id -> Chi tiết đơn cứu xét
router.get('/:id', managerAppealController.getAppealDetail)

// 3. PATCH /api/manager/appeals/:id -> Xử lý duyệt đơn
router.patch('/:id', managerAppealValidation.handleAppeal, managerAppealController.processStoreAppeal)

export const managerAppealRouter = router