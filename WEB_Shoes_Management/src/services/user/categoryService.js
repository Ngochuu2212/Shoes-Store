import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const getAllCategories = async () => {
  const res = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/categories`)
  return res.data
}

export const categoryService = {
  getAllCategories
}