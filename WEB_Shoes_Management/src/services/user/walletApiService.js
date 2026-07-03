import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const walletApiService = {
  getWallet: async (page = 1, limit = 10) => {
    const res = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/wallet`, { params: { page, limit } })
    return res.data
  }
}
