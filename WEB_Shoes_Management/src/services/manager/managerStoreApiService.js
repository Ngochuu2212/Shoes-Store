import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const managerStoreApiService = {
  // Lấy danh sách cửa hàng có phân trang và lọc
  getStores: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.is_active !== undefined && filters.is_active !== null) params.append('is_active', filters.is_active)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/stores?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết cửa hàng
  getStoreDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/stores/${id}`)
    return response.data
  },

  // Phê duyệt hàng loạt
  approveStoresBulk: async (storeIds) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/stores/approve-bulk`, { storeIds })
    return response.data
  },

  // Phê duyệt đơn lẻ
  approveStoreSingle: async (id) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/manager/stores/${id}/approve`, { storeIds: [id] })
    return response.data
  },

  // Từ chối hàng loạt
  rejectStoresBulk: async (storeIds, reason) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/stores/reject-bulk`, { storeIds, reason })
    return response.data
  },

  // Từ chối đơn lẻ
  rejectStoreSingle: async (id, reason) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/manager/stores/${id}/reject`, { data: { reason } })
    return response.data
  },

  // Khóa hàng loạt
  banStoresBulk: async (storeIds, reason) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/stores/ban-bulk`, { storeIds, reason })
    return response.data
  },

  // Khóa đơn lẻ
  banStoreSingle: async (id, reason) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/manager/stores/${id}/ban`, { reason })
    return response.data
  }
}