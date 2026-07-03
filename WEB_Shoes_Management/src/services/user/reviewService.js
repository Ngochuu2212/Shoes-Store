import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const reviewService = {
  getProductReviews: async (slug) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/${slug}/reviews`)
    return response.data
  },

  createProductReview: async (orderId, formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/orders/${orderId}/reviews`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  createStoreReview: async (orderId, payload) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/orders/${orderId}/store-reviews`,
      payload
    )
    return response.data
  }
}