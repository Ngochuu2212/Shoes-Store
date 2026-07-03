import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorPayoutApiService = {
  // Lấy lịch sử rút tiền + số dư hiện tại
  getPayoutHistory: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/payouts/history?${params.toString()}`)
    return response.data
  },

  // Tạo yêu cầu rút tiền
  createPayoutRequest: async (data) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/vendor/payouts/request`, data)
    return response.data
  },

  exportPayoutHistory: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/payouts/export`, {
      responseType: 'blob'
    })
    return response.data
  }
}