import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const notificationApiService = {
  // Lấy danh sách thông báo (phân trang)
  getNotifications: async (page = 1, limit = 20) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/notifications?page=${page}&limit=${limit}`
    )
    return response.data
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async () => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/notifications/mark-all-read`)
    return response.data
  },

  // Đánh dấu một thông báo đã đọc
  markAsRead: async (notificationId) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/notifications/${notificationId}/read`)
    return response.data
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/notifications/unread-count`)
    return response.data
  }
}