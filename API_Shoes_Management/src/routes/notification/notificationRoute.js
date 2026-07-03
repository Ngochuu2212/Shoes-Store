import express from 'express'
import { notificationController } from '~/controllers/notification/notificationController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', notificationController.getNotifications)
router.put('/mark-all-read', notificationController.markAllAsRead)
router.put('/:id/read', notificationController.markAsRead)
router.get('/unread-count', notificationController.getUnreadCount)

export const notificationRouter = router