import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminAttributeApiService = {
  // SIZES
  getSizes: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/attributes/sizes`)
    return response.data
  },

  createSize: async (sizeValue) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/admin/attributes/sizes/add`, { sizeValue })
    return response.data
  },

  updateSize: async (id, sizeValue) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/admin/attributes/sizes/update/${id}`, { sizeValue })
    return response.data
  },

  deleteSize: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/admin/attributes/sizes/delete/${id}`)
    return response.data
  },

  // COLORS
  getColors: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/attributes/colors`)
    return response.data
  },

  createColor: async (colorName, colorCode) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/admin/attributes/colors/add`, { colorName, colorCode })
    return response.data
  },

  updateColor: async (id, colorName, colorCode) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/admin/attributes/colors/update/${id}`, { colorName, colorCode })
    return response.data
  },

  deleteColor: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/admin/attributes/colors/delete/${id}`)
    return response.data
  }
}