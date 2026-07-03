import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const storeService = {
  getStoreDetail: async (storeId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/stores/detail/${storeId}`)
    return response.data
  },

  getStoreProducts: async (storeId, page = 1, limit = 12) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/stores/products/${storeId}?page=${page}&limit=${limit}`)
    return response.data
  },

  getStoreReviews: async (storeId, page = 1, limit = 8) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/stores/${storeId}/reviews?page=${page}&limit=${limit}`
    )
    return response.data
  }
}