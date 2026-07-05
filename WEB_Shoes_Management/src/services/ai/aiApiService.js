import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const aiApiService = {
  chat: async (message, history = []) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/ai/chat`, { message, history })
    return response.data
  },

  searchByImage: async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/ai/search-by-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  analyzeTryOn: async (imageFile, shoeImageUrl, productName) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('shoeImageUrl', shoeImageUrl)
    formData.append('productName', productName)

    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/ai/analyze-tryon`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  detectFeet: async (imageFile, shoeImageUrl) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('shoeImageUrl', shoeImageUrl)

    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/ai/detect-feet`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }
}
