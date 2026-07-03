import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const orderTrackingApiService = {
  // 1. API Lấy danh sách có phân trang và tab trạng thái
  getOrderHistory: async (page = 1, limit = 5, status = 'all') => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/orders/history?page=${page}&limit=${limit}&status=${status}`
    )
    return response.data
  },

  // 2. API Khách hàng Hủy đơn / Yêu cầu hủy
  cancelOrder: async (orderId, reason) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/orders/cancel/${orderId}`, { reason })
    return response.data
  },

  // 3. API Rút lại yêu cầu hủy
  withdrawCancelRequest: async (orderId) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/orders/cancel-withdraw/${orderId}`)
    return response.data
  },

  getOrderDetail: async (orderId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/orders/detail/${orderId}`)
    return response.data
  },

  deletePendingOrders: async (orderIds) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/orders/pending-orders`, { data: { orderIds } })
    return response.data
  }
}