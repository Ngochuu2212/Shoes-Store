import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const managerAppealApiService = {
  // Lấy danh sách đơn cứu xét
  getAppeals: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/appeals?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết đơn cứu xét
  getAppealDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/appeals/${id}`)
    return response.data
  },

  // Xử lý duyệt đơn
  processAppeal: async (id, status, managerNote) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/manager/appeals/${id}`, {
      status,
      managerNote
    })
    return response.data
  }
}