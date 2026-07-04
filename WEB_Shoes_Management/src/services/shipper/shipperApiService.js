import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const BASE = `${DEV_API_URL}/api/shipper`

export const shipperApiService = {
  getDashboard: async () => {
    const res = await authorizedAxiosInstance.get(`${BASE}/dashboard`)
    return res.data
  },

  getAvailableOrders: async (page = 1, limit = 10) => {
    const res = await authorizedAxiosInstance.get(`${BASE}/available-orders?page=${page}&limit=${limit}`)
    return res.data
  },

  acceptOrder: async (orderId) => {
    const res = await authorizedAxiosInstance.put(`${BASE}/available-orders/${orderId}/accept`)
    return res.data
  },

  getMyDeliveries: async (page = 1, limit = 10) => {
    const res = await authorizedAxiosInstance.get(`${BASE}/my-deliveries?page=${page}&limit=${limit}`)
    return res.data
  },

  getOrderDetail: async (orderId) => {
    const res = await authorizedAxiosInstance.get(`${BASE}/orders/${orderId}`)
    return res.data
  },

  startDelivery: async (orderId) => {
    const res = await authorizedAxiosInstance.put(`${BASE}/orders/${orderId}/start`)
    return res.data
  },

  markDelivered: async (orderId) => {
    const res = await authorizedAxiosInstance.put(`${BASE}/orders/${orderId}/delivered`)
    return res.data
  },

  uploadDeliveryProof: async (orderId, formData) => {
    const res = await authorizedAxiosInstance.put(`${BASE}/orders/${orderId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  completeDelivery: async (orderId) => {
    const res = await authorizedAxiosInstance.put(`${BASE}/orders/${orderId}/complete`)
    return res.data
  },

  getDeliveryHistory: async (page = 1, limit = 10) => {
    const res = await authorizedAxiosInstance.get(`${BASE}/history?page=${page}&limit=${limit}`)
    return res.data
  }
}
