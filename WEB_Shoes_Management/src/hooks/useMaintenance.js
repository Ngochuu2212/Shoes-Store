import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'
import { logoutSuccess } from '~/redux/user/userSlice'
import { ROLE_ID } from '~/utils/constant'

export const useMaintenance = (skipCheck = false) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.userInfo)

  const [isMaintenance, setIsMaintenance] = useState(() => {
    return localStorage.getItem('isMaintenance') === 'true'
  })
  const [maintenanceMessage, setMaintenanceMessage] = useState(() => {
    return localStorage.getItem('maintenanceMessage') || ''
  })
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role_id === ROLE_ID.ADMIN

  const checkMaintenance = async () => {
    try {
      const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/system-settings`)
      const data = response.data
      const isActive = data.is_maintenance === 1

      if (isAdmin) {
        setIsMaintenance(false)
        setMaintenanceMessage('')
        localStorage.removeItem('isMaintenance')
        localStorage.removeItem('maintenanceMessage')
        setLoading(false)
        return
      }

      setIsMaintenance(isActive)
      setMaintenanceMessage(data.maintenance_message || '')

      if (isActive) {
        localStorage.setItem('isMaintenance', 'true')
        localStorage.setItem('maintenanceMessage', data.maintenance_message || '')
      } else {
        localStorage.removeItem('isMaintenance')
        localStorage.removeItem('maintenanceMessage')
      }
    } catch (error) {
      if (error.response?.status === 503) {
        const message = localStorage.getItem('maintenanceMessage') || 'Hệ thống đang bảo trì'
        setMaintenanceMessage(message)
        setIsMaintenance(true)
      } else {
        setIsMaintenance(false)
        setMaintenanceMessage('')
        localStorage.removeItem('isMaintenance')
        localStorage.removeItem('maintenanceMessage')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceLogout = () => {
    // Xóa tất cả dữ liệu localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('persist:root')
    localStorage.removeItem('isMaintenance')
    localStorage.removeItem('maintenanceMessage')

    // Dispatch logout Redux
    dispatch(logoutSuccess())

    // Điều hướng về trang login
    navigate('/login')
  }

  useEffect(() => {
    if (skipCheck) {
      setLoading(false)
      return
    }
    checkMaintenance()
  }, [skipCheck])

  return {
    isMaintenance,
    maintenanceMessage,
    loading,
    checkMaintenance,
    handleMaintenanceLogout,
    isAdmin
  }
}