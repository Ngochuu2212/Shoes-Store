import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminUserApiService = {
  // Lấy danh sách người dùng
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.roleId) params.append('roleId', filters.roleId)
    if (filters.isActive !== undefined && filters.isActive !== null) params.append('isActive', filters.isActive)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/users?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết người dùng
  getUserDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/users/${id}`)
    return response.data
  },

  // Đổi vai trò hàng loạt
  changeUsersRole: async (userIds, targetRoleId) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/admin/users/change-role-bulk`, {
      userIds,
      targetRoleId
    })
    return response.data
  },

  // Bật/tắt trạng thái hàng loạt
  toggleUsersActive: async (userIds, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/admin/users/toggle-active-bulk`, {
      userIds,
      isActive
    })
    return response.data
  },

  // Xóa người dùng hàng loạt
  deleteUsers: async (userIds) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/admin/users/delete-bulk`, {
      data: { userIds }
    })
    return response.data
  },

  // Tạo người dùng mới (Admin)
  createUser: async (formData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/admin/users/add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Cập nhật người dùng (Admin)
  updateUser: async (id, formData) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/admin/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Lấy thông tin cá nhân Admin
  getUserProfile: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/users/profile`)
    return response.data
  },

  // Cập nhật thông tin cá nhân Admin
  updateProfile: async (formData) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/users/update-profile`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  // Đăng xuất
  logout: async () => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/logout`)
    return response.data
  }
}