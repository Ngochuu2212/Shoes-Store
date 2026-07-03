import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorUserApiService = {
  // Lấy thông tin cá nhân
  getUserProfile: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/users/profile`)
    return response.data
  },

  // Cập nhật thông tin cá nhân
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