import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const authService = {
  register: async (registerData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/register`, registerData)
    return response.data
  },

  verifyOtp: async (otpData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/verify-otp`, otpData)
    return response.data
  },

  login: async (loginData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/login`, loginData)
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/forgot-password`, { email })
    return response.data
  },

  resetPassword: async (resetData) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/reset-password`, resetData)
    return response.data
  },

  googleLogin: async (credential) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/google-login`, { credential })
    return response.data
  },

  logout: async () => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/logout`)
    return response.data
  }
}