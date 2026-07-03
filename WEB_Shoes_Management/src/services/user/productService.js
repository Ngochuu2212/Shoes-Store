import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const productService = {
  getHomepageProducts: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/homepage-products`)
    return response.data
  },

  getProductDetail: async (slug) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/detail/${slug}`)
    return response.data
  },

  searchAndFilterProducts: async (params) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/search-filter`, { params })
    return response.data
  },


  toggleFavorite: async (productId) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/products/toggle`, { productId })
    return response.data
  },

  getFavorites: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products`)
    return response.data
  },

  getEmptyCartRecommendations: async (limit = 8) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/recommendations/empty-cart?limit=${limit}`)
    return response.data
  },

  getPostCheckoutRecommendations: async (categoryIds, excludedIds, limit = 8) => {
    const catQuery = categoryIds?.length ? categoryIds.join(',') : ''
    const excQuery = excludedIds?.length ? excludedIds.join(',') : ''

    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/products/recommendations/post-checkout?categoryIds=${catQuery}&excludedIds=${excQuery}&limit=${limit}`
    )
    return response.data
  }
}