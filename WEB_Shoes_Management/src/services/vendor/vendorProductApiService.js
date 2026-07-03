import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorProductApiService = {
  getVendorProducts: async (filters = {}) => {
    const params = new URLSearchParams()

    // Phân trang
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    // Tìm kiếm & lọc
    if (filters.search) params.append('search', filters.search)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.isActive !== undefined && filters.isActive !== null) {
      params.append('isActive', filters.isActive)
    }

    // Sắp xếp
    if (filters.sortBy) params.append('sortBy', filters.sortBy)

    // Khoảng giá
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/vendor/products?${params.toString()}`
    )
    return response.data
  },

  getProductDetail: async (id) => {
    const res = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/vendor/products/detail/${id}`
    )
    return res.data
  },

  createProduct: async (data) => {
    const res = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/vendor/products/add`,
      data
    )
    return res.data
  },

  updateProduct: async (id, data) => {
    const res = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/vendor/products/update/${id}`,
      data
    )
    return res.data
  },

  deleteProductSingle: async (id) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/vendor/products/delete/${id}`
    )
    return response.data
  },

  deleteProductsBulk: async (productIds) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/vendor/products/delete-bulk`,
      { data: { productIds } }
    )
    return response.data
  },

  toggleActiveSingle: async (id, isActive) => {
    const response = await authorizedAxiosInstance.patch(
      `${DEV_API_URL}/api/vendor/products/${id}/toggle-active`,
      { isActive }
    )
    return response.data
  },

  toggleActiveBulk: async (productIds, isActive) => {
    const response = await authorizedAxiosInstance.patch(
      `${DEV_API_URL}/api/vendor/products/toggle-active-bulk`,
      { productIds, isActive }
    )
    return response.data
  },

  requestReapprovalBulk: async (productIds) => {
    const response = await authorizedAxiosInstance.patch(
      `${DEV_API_URL}/api/vendor/products/request-reapproval-bulk`,
      { productIds }
    )
    return response.data
  },

  createVariant: async (productId, variantData) => {
    const res = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/vendor/products/add/${productId}/variants`,
      variantData
    )
    return res.data
  },

  updateVariant: async (productId, variantId, variantData) => {
    const res = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/vendor/products/${productId}/variants/${variantId}`,
      variantData
    )
    return res.data
  },

  deleteVariant: async (productId, variantId) => {
    const res = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/vendor/products/${productId}/variants/${variantId}`
    )
    return res.data
  },

  getVariantsByProductId: async (productId) => {
    const res = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/vendor/products/${productId}/variants`
    )
    return res.data
  }
}