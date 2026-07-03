import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const attributeService = {
  getGlobalAttributes: async () => {
    const res = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/attributes`)
    return res.data
  }
}