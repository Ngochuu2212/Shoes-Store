import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminCategoryApiService = {
  // Lấy danh sách danh mục
  getCategories: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.mode) params.append('mode', filters.mode)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/categories?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết danh mục
  getCategoryDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/categories/detail/${id}`)
    return response.data
  },

  // Tạo danh mục mới
  createCategory: async (formData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/admin/categories/add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Cập nhật danh mục
  updateCategory: async (id, formData) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/admin/categories/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Toggle trạng thái danh mục
  toggleCategoryStatus: async (id, isActive) => {
    const response = await authorizedAxiosInstance.patch(
      `${DEV_API_URL}/api/admin/categories/toggle-status/${id}`,
      { isActive }
    )
    return response.data
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/admin/categories/delete/${id}`)
    return response.data
  }
}