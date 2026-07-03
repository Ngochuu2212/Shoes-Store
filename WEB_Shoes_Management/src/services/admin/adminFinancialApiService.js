import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminFinancialApiService = {
  // Lấy dữ liệu tài chính tổng quan
  getFinancialAnalytics: async (type, startDate, endDate) => {
    const params = new URLSearchParams()
    params.append('type', type)

    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/admin/financial/analytics?${params.toString()}`
    )
    return response.data
  }
}