import { notificationService } from '~/services/notification/notificationService'

const getNotifications = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await notificationService.getNotifications(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách thông báo: ${error.message}` })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await notificationService.markAllAsRead(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đọc thông báo: ${error.message}` })
  }
}

const markAsRead = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const notificationId = req.params.id
    const result = await notificationService.markAsRead(userId, notificationId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đánh dấu đã đọc: ${error.message}` })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await notificationService.getUnreadCount(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy số thông báo chưa đọc: ${error.message}` })
  }
}

export const notificationController = {
  getNotifications,
  markAllAsRead,
  getUnreadCount,
  markAsRead
}