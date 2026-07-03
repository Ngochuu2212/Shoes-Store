import express from 'express'
import { adminAttributeController } from '~/controllers/admin/adminAttributeController'
import { adminAttributeValidation } from '~/validations/admin/adminAttributeValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/sizes', adminAttributeController.getSizesList)
router.post('/sizes/add', adminAttributeValidation.handleSize, adminAttributeController.createSize)
router.put('/sizes/update/:id', adminAttributeValidation.handleSize, adminAttributeController.updateSize)
router.delete('/sizes/delete/:id', adminAttributeController.deleteSize)

router.get('/colors', adminAttributeController.getColorsList)
router.post('/colors/add', adminAttributeValidation.handleColor, adminAttributeController.createColor)
router.put('/colors/update/:id', adminAttributeValidation.handleColor, adminAttributeController.updateColor)
router.delete('/colors/delete/:id', adminAttributeController.deleteColor)

export const adminAttributeRouter = router