import express from 'express'
import { attributeController } from '~/controllers/user/attributeController'

const router = express.Router()

router.get('/', attributeController.getGlobalAttributes)

export const attributeRouter = router