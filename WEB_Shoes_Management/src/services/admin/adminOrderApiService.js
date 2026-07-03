import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminOrderApiService = {
  // Lấy danh sách đơn hàng
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.status) params.append('status', filters.status)
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
    if (filters.searchOrderId) params.append('searchOrderId', filters.searchOrderId)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/orders?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: async (orderId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/orders/${orderId}`)
    return response.data
  },

  // Ép hủy đơn hàng
  forceCancelOrder: async (orderId, adminNote) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/admin/orders/force-cancel/${orderId}`,
      { adminNote }
    )
    return response.data
  }
}