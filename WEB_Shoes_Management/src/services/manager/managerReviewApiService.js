import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const managerReviewApiService = {
  // Lấy danh sách đánh giá bị tố cáo
  getReportedReviews: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.type) params.append('type', filters.type)
    if (filters.search) params.append('search', filters.search)
    if (filters.rating) params.append('rating', filters.rating)
    if (filters.storeId) params.append('storeId', filters.storeId)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/reviews?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết đánh giá
  getReviewDetail: async (id, type) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/manager/reviews/${id}?type=${type}`)
    return response.data
  },

  // Xử lý hàng loạt đánh giá
  resolveReviewsBulk: async (reviewIds, type, action) => {
    const response = await authorizedAxiosInstance.patch(
      `${DEV_API_URL}/api/manager/reviews/resolve-bulk?type=${type}`,
      { reviewIds, action }
    )
    return response.data
  }
}