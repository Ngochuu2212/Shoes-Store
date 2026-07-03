import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorAppealApiService = {
  // Gửi đơn cứu xét
  submitAppeal: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/vendor/appeals/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  // Lấy danh sách đơn cứu xét của tôi
  getMyAppeals: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.status) params.append('status', filters.status)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/appeals?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết đơn cứu xét
  getAppealDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/appeals/${id}`)
    return response.data
  }
}