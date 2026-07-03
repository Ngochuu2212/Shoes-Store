import axios from 'axios'
import { toast } from 'react-toastify'
import { DEV_API_URL } from '~/utils/constant'

let isRedirecting = false
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const handleSessionExpired = () => {
  localStorage.removeItem('persist:root')
  localStorage.removeItem('userInfo')

  if (!isRedirecting) {
    isRedirecting = true
    toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
  }
}

const authorizedAxiosInstance = axios.create()

authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
authorizedAxiosInstance.defaults.withCredentials = true

// Request interceptor - cookie httpOnly tự động gửi
authorizedAxiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor - xử lý refresh token tự động
authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Tránh loop vô tận khi chính request refresh-token bị lỗi 401
    if (originalRequest.url?.includes('/refresh-token')) {
      handleSessionExpired()
      return Promise.reject(error)
    }

    // Nếu lỗi 401 và chưa thử refresh token lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Nếu đang có request khác đang refresh, đưa vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => authorizedAxiosInstance(originalRequest))
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          `${DEV_API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = response.data.accessToken

        // Process queue với token mới
        processQueue(null, newAccessToken)

        // Retry request gốc với cookie mới (cookie đã được set bởi server)
        return authorizedAxiosInstance(originalRequest)

      } catch (refreshError) {
        // Refresh thất bại - notify queue rồi xử lý
        processQueue(refreshError, null)

        if (refreshError.response?.status === 401) {
          handleSessionExpired()
        } else {
          toast.error('Có lỗi xảy ra khi làm mới phiên đăng nhập')
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Xử lý lỗi 503 (Maintenance mode)
    if (error.response?.status === 503) {
      const maintenanceMessage = error.response?.data?.maintenanceMessage || 'Hệ thống đang bảo trì'

      localStorage.setItem('maintenanceMessage', maintenanceMessage)
      localStorage.setItem('isMaintenance', 'true')

      window.dispatchEvent(new CustomEvent('maintenanceMode', {
        detail: { message: maintenanceMessage }
      }))

      return Promise.reject(error)
    }

    // Hiển thị toast cho các lỗi còn lại
    if (
      error.response?.status !== 401 &&
      error.response?.status !== 410 &&
      error.response?.status !== 503
    ) {
      const errorMessage = error.response?.data?.message || error?.message
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance