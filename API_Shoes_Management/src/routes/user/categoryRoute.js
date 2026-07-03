import express from 'express'
import { categoryController } from '~/controllers/user/categoryController'

const router = express.Router()

router.get('/', categoryController.getAllCategories)

export const categoryRouter = router