import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorStoreApiService = {
  registerStore: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/vendor/stores/register`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  getStoreProfile: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/stores/profile`)
    return response.data
  },

  updateStoreProfile: async (formData) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/vendor/stores/profile`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  getStoreRegistrationStatus: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/stores/status`)
    return response.data
  }
}