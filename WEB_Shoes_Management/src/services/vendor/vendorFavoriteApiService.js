import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorFavoriteApiService = {
  getFavoriteAnalytics: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/favorites?${params.toString()}`)
    return response.data
  },

  getProductFavoriteDetail: async (productId, page = 1, limit = 10) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/favorites/${productId}/users?page=${page}&limit=${limit}`)
    return response.data
  }
}