import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const promotionApiService = {

  applyPromotion: async (code, storeId, currentOrderValue) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/promotions/apply`, {
      code,
      storeId: storeId ? Number(storeId) : null,
      currentOrderValue: Number(currentOrderValue)
    })
    return response.data
  },

  getPromotionsByStore: async (storeId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/promotions/store/${storeId}`)
    return response.data
  },

  // Lấy danh sách mã giảm giá hệ thống do Manager tạo
  getSystemPromotions: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/promotions/system`)
    return response.data
  }
}