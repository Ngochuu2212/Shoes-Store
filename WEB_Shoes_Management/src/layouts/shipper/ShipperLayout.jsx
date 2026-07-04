import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShipperSidebar } from '~/layouts/shipper/ShipperSidebar'
import { ShipperHeader } from '~/layouts/shipper/ShipperHeader'
import { useMaintenance } from '~/hooks/useMaintenance'
import { MaintenanceModal } from '~/components/common/MaintenanceModal'
import { ROLE_ID } from '~/utils/constant'
import { useEffect } from 'react'

export const ShipperLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const user = useSelector((state) => state.user.userInfo)
  const navigate = useNavigate()

  const { isMaintenance, maintenanceMessage, loading: maintenanceLoading, handleMaintenanceLogout } = useMaintenance()

  useEffect(() => {
    if (!maintenanceLoading && isMaintenance) {
      setShowMaintenanceModal(true)
    }
  }, [maintenanceLoading, isMaintenance])

  // Kiểm tra role
  useEffect(() => {
    if (user && Number(user.roleId) !== ROLE_ID.SHIPPER) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ShipperSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ShipperHeader
          onMobileMenuToggle={() => setIsMobileSidebarOpen(prev => !prev)}
          isMobileOpen={isMobileSidebarOpen}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {showMaintenanceModal && (
        <MaintenanceModal
          isOpen={showMaintenanceModal}
          message={maintenanceMessage}
          onLogout={handleMaintenanceLogout}
        />
      )}
    </div>
  )
}
