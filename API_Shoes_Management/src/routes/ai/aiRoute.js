import express from 'express'
import { aiController } from '~/controllers/ai/aiController'

const router = express.Router()

router.post('/chat', aiController.chatWithAI)

export const aiRouter = router
