import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { VendorSidebar } from '~/layouts/vendor/VendorSidebar'
import { VendorHeader } from '~/layouts/vendor/VendorHeader'
import { StoreBannedOverlay } from '~/components/vendor/StoreBannedOverlay'
import { vendorStoreApiService } from '~/services/vendor/vendorStoreApiService'
import { vendorAppealApiService } from '~/services/vendor/vendorAppealApiService'
import { useMaintenance } from '~/hooks/useMaintenance'
import { MaintenanceModal } from '~/components/common/MaintenanceModal'

export const VendorLayout = () => {
  const [isBanned, setIsBanned] = useState(false)
  const [storeData, setStoreData] = useState(null)
  const [checking, setChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastAppealId, setLastAppealId] = useState(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const navigate = useNavigate()
  const user = useSelector((state) => state.user.userInfo)

  const { isMaintenance, maintenanceMessage, loading: maintenanceLoading, handleMaintenanceLogout } = useMaintenance()

  // Kiểm tra trạng thái cửa hàng khi vào layout
  useEffect(() => {
    const checkStoreStatus = async () => {
      try {
        const res = await vendorStoreApiService.getStoreProfile()
        setStoreData(res)
        if (res && res.is_active === 0) {
          setIsBanned(true)
        } else {
          setIsBanned(false)
        }
      } catch (error) {
        setIsBanned(false)
      } finally {
        setChecking(false)
      }
    }

    if (user?.id) {
      checkStoreStatus()
    }
  }, [user])

  // Kiểm tra maintenance
  useEffect(() => {
    if (!maintenanceLoading && isMaintenance) {
      setShowMaintenanceModal(true)
    }
  }, [maintenanceLoading, isMaintenance])

  // Khi navigate quay lại từ trang detail, kiểm tra lại trạng thái
  useEffect(() => {
    if (!isBanned && !checking && lastAppealId) {
      setLastAppealId(null)
    }
  }, [isBanned, checking, lastAppealId])

  const handleAppealSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const response = await vendorAppealApiService.submitAppeal(formData)
      toast.success(response.message || 'Đã gửi đơn giải trình thành công!')

      setLastAppealId(response.appealId)
      setIsBanned(false)
      navigate(`/vendor/appeals/${response.appealId}`)

      return response
    } catch (error) {
      toast.error(error.message || 'Gửi đơn thất bại, vui lòng thử lại')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseMaintenance = () => {
    setShowMaintenanceModal(false)
    handleMaintenanceLogout()
  }

  // Hàm toggle sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  // Hàm close sidebar
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  // Nếu đang kiểm tra, hiển thị loading
  if (checking || maintenanceLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden relative">
        {/* Sidebar */}
        <VendorSidebar
          isBanned={isBanned}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />

        {/* Khu vực nội dung bên phải */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header với nút toggle */}
          <VendorHeader
            isBanned={isBanned}
            onMenuToggle={toggleMobileSidebar}
          />

          {/* Nội dung chính */}
          <main className={`flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 xl:p-8 custom-scrollbar transition-all duration-300 ${
            isBanned ? 'opacity-50 pointer-events-none select-none blur-sm' : ''
          }`}>
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Overlay khi bị khóa */}
        {isBanned && (
          <StoreBannedOverlay
            store={storeData}
            onAppealSubmit={handleAppealSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        message={maintenanceMessage}
        onClose={handleCloseMaintenance}
        onLogout={handleMaintenanceLogout}
      />
    </>
  )
}