import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const aiApiService = {
  chat: async (message, history = []) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/ai/chat`, { message, history })
    return response.data
  }
}
