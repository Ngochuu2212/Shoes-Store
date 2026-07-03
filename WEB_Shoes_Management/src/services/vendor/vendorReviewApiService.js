import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorReviewApiService = {
  // Lấy danh sách đánh giá (product hoặc store)
  getVendorReviews: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.type) params.append('type', filters.type)
    if (filters.rating) params.append('rating', filters.rating)
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined && filters.isActive !== null) params.append('isActive', filters.isActive)
    if (filters.isReported !== undefined && filters.isReported !== null) params.append('isReported', filters.isReported)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/reviews?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết 1 đánh giá
  getReviewDetail: async (id, type) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/reviews/${id}?type=${type}`)
    return response.data
  },

  // Báo cáo vi phạm hàng loạt
  reportReviewsBulk: async (reviewIds, type, reason) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/reviews/report-bulk?type=${type}`, {
      reviewIds,
      reason
    })
    return response.data
  },

  // Báo cáo vi phạm đơn lẻ
  reportReview: async (id, type, reason) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/vendor/reviews/${id}/report?type=${type}`, {
      reason
    })
    return response.data
  },

  // Yêu cầu mở lại đánh giá bị ẩn hàng loạt
  requestReopenBulk: async (reviewIds, type, reason = '') => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/reviews/request-reopen-bulk?type=${type}`, {
      reviewIds,
      reason
    })
    return response.data
  }
}