import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminSystemSettingApiService = {
  // Lấy cấu hình hệ thống
  getSystemSettings: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/system-settings`)
    return response.data
  },

  // Cập nhật cấu hình hệ thống
  updateSystemSettings: async (data) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/admin/system-settings/update`, data)
    return response.data
  }
}