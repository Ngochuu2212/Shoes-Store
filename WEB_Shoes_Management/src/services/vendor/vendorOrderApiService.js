import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorOrderApiService = {
  // Lấy danh sách đơn hàng có phân trang và lọc
  getVendorOrders: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.status) params.append('status', filters.status)
    if (filters.searchOrderId) params.append('searchOrderId', filters.searchOrderId)
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/orders?${params.toString()}`)
    return response.data
  },

  // Cập nhật trạng thái đơn hàng đơn lẻ
  updateOrderStatus: async (id, status) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/vendor/orders/${id}/update-status`, { status })
    return response.data
  },

  // Xử lý yêu cầu hủy đơn hàng
  handleCancelRequest: async (id, decision, reason = '') => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/vendor/orders/${id}/handle-cancel`, { decision, reason })
    return response.data
  },

  // Cập nhật trạng thái hàng loạt
  updateOrderStatusBulk: async (orderIds, targetStatus) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/orders/update-status-bulk`, { orderIds, targetStatus })
    return response.data
  },

  // Bàn giao đơn hàng cho Shipper
  assignToShipper: async (id) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/vendor/orders/${id}/assign-shipper`)
    return response.data
  }
}