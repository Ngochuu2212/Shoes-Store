import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminStoreApiService = {
  // Lấy danh sách cửa hàng
  getStores: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined && filters.isActive !== null) params.append('isActive', filters.isActive)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/stores?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết cửa hàng
  getStoreDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/stores/${id}`)
    return response.data
  },

  // Lấy sản phẩm của cửa hàng
  getStoreProducts: async (storeId, filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/stores/${storeId}/products?${params.toString()}`)
    return response.data
  },

  // Bật/tắt trạng thái hàng loạt
  toggleStoresActive: async (storeIds, isActive, reason = null) => {
    const body = { storeIds, isActive }
    if (reason) body.reason = reason
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/admin/stores/toggle-active-bulk`, body)
    return response.data
  },

  // Cập nhật phí hoa hồng hàng loạt
  updateStoresCommission: async (storeIds, commissionRate) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/admin/stores/commission-bulk`, {
      storeIds,
      commissionRate
    })
    return response.data
  },

  // Xóa cửa hàng hàng loạt
  deleteStores: async (storeIds) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/admin/stores/delete-bulk`, {
      data: { storeIds }
    })
    return response.data
  },

  // Tạo cửa hàng mới
  createStore: async (formData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/admin/stores/add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}