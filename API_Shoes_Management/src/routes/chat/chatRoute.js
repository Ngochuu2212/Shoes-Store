import express from 'express'
import { chatController } from '~/controllers/chat/chatController'
import { chatValidation } from '~/validations/chat/chatValidation'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/init', chatController.initConversation)
router.post('/send', CloudinaryProvider.uploadChatImages, chatController.sendMessage)
router.put('/read/:conversationId', chatController.markAsRead)
router.get('/history/:conversationId', chatController.getChatHistory)
router.get('/conversations', chatController.getConversationsList)

export const chatRouter = router