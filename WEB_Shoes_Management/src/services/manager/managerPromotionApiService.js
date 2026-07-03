import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const managerPromotionApiService = {
  // Lấy danh sách mã khuyến mãi hệ thống có phân trang và lọc
  getSystemPromotions: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.is_active !== undefined && filters.is_active !== null) params.append('is_active', filters.is_active)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/promotions?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết 1 mã khuyến mãi hệ thống
  getPromotionDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/promotions/detail/${id}`)
    return response.data
  },

  // Tạo mã khuyến mãi hệ thống mới
  createPromotion: async (data) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/manager/promotions/add`, data)
    return response.data
  },

  // Cập nhật mã khuyến mãi hệ thống
  updatePromotion: async (id, data) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/manager/promotions/update/${id}`, data)
    return response.data
  },

  // Xóa đơn lẻ mã khuyến mãi hệ thống
  deletePromotionSingle: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/manager/promotions/delete/${id}`)
    return response.data
  },

  // Bật/Tắt trạng thái đơn lẻ (Switch)
  toggleActiveSingle: async (id, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/promotions/${id}/toggle-active`, {
      isActive: isActive ? 1 : 0
    })
    return response.data
  },

  // Bật/Tắt trạng thái hàng loạt
  toggleActiveBulk: async (promotionIds, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/promotions/toggle-active-bulk`, { promotionIds, isActive })
    return response.data
  },

  // Xóa hàng loạt mã khuyến mãi hệ thống
  deletePromotionsBulk: async (promotionIds) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/manager/promotions/delete-bulk`, { data: { promotionIds } })
    return response.data
  }
}
