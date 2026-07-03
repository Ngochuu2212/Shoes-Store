import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const userService = {

  updateProfile: async (formData) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/users/update-profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}