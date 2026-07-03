import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const managerProductApiService = {
  // Lấy danh sách sản phẩm (phân trang + lọc)
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.storeId) params.append('storeId', filters.storeId)
    if (filters.status) params.append('status', filters.status)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/products?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết sản phẩm theo id (DÀNH CHO MANAGER)
  getProductDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/products/${id}`)
    return response.data
  },

  // Cập nhật trạng thái đơn lẻ (Phê duyệt/Từ chối/Khóa)
  updateProductStatus: async (id, targetStatus, reason = null) => {
    const body = { targetStatus }
    if (reason) body.reason = reason
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/manager/products/${id}/status`, body)
    return response.data
  },

  // Cập nhật trạng thái hàng loạt
  updateProductsStatusBulk: async (productIds, targetStatus, reason = null) => {
    const body = { productIds, targetStatus }
    if (reason) body.reason = reason
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/products/status-bulk`, body)
    return response.data
  }
}