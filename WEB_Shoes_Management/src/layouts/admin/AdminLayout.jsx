import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { useMaintenance } from '~/hooks/useMaintenance'
import { MaintenanceModal } from '~/components/common/MaintenanceModal'

export const AdminLayout = () => {
  const { isMaintenance, maintenanceMessage, loading, handleMaintenanceLogout } = useMaintenance(true)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    // Chỉ set state nhưng không hiển thị modal
    if (!loading && isMaintenance) {
      setShowMaintenanceModal(false)
    }
  }, [loading, isMaintenance])

  const handleCloseMaintenance = () => {
    setShowMaintenanceModal(false)
    handleMaintenanceLogout()
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />

        {/* Khu vực nội dung bên phải */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header với nút toggle */}
          <AdminHeader onMenuToggle={toggleMobileSidebar} />

          {/* Nội dung chính */}
          <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 xl:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MaintenanceModal
        isOpen={false}
        message={maintenanceMessage}
        onClose={handleCloseMaintenance}
        onLogout={handleMaintenanceLogout}
      />
    </>
  )
}