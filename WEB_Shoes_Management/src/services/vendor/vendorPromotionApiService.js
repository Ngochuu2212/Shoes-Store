import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorPromotionApiService = {
  // Lấy danh sách khuyến mãi có phân trang và lọc
  getVendorPromotions: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.is_active !== undefined && filters.is_active !== null) params.append('is_active', filters.is_active)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/promotions?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết 1 khuyến mãi
  getPromotionDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/promotions/detail/${id}`)
    return response.data
  },

  // Tạo khuyến mãi mới
  createPromotion: async (data) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/vendor/promotions/add`, data)
    return response.data
  },

  // Cập nhật khuyến mãi
  updatePromotion: async (id, data) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/vendor/promotions/update/${id}`, data)
    return response.data
  },

  // Xóa đơn lẻ khuyến mãi
  deletePromotionSingle: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/vendor/promotions/delete/${id}`)
    return response.data
  },

  // Bật/Tắt trạng thái đơn lẻ (Switch)
  toggleActiveSingle: async (id, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/promotions/${id}/toggle-active`, {
      isActive: isActive ? 1 : 0
    })
    return response.data
  },

  // Bật/Tắt trạng thái hàng loạt
  toggleActiveBulk: async (promotionIds, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/promotions/toggle-active-bulk`, { promotionIds, isActive })
    return response.data
  },

  // Xóa hàng loạt khuyến mãi
  deletePromotionsBulk: async (promotionIds) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/vendor/promotions/delete-bulk`, { data: { promotionIds } })
    return response.data
  }
}