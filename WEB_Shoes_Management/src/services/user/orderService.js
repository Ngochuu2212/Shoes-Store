import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const orderApiService = {
  createOrderCOD: async (orderPayload) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/orders/checkout-cod`,
      orderPayload
    )
    return response.data
  },

  createOrderOnline: async (orderPayload) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/orders/checkout-online`,
      orderPayload
    )
    return response.data
  }
}