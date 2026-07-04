import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useMaintenance } from '~/hooks/useMaintenance'
import { MaintenanceModal } from '~/components/common/MaintenanceModal'
import { Header } from './Header'
import { Footer } from './Footer'
import { AIChatbot } from '~/components/common/AIChatbot'

export const MainLayout = () => {
  const { isMaintenance, maintenanceMessage, loading, handleMaintenanceLogout } = useMaintenance()
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)

  useEffect(() => {
    if (!loading && isMaintenance) {
      setShowMaintenanceModal(true)
    }
  }, [loading, isMaintenance])

  const handleCloseMaintenance = () => {
    setShowMaintenanceModal(false)
    // Gọi logout
    handleMaintenanceLogout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <AIChatbot />

      <MaintenanceModal
        isOpen={showMaintenanceModal}
        message={maintenanceMessage}
        onClose={handleCloseMaintenance}
        onLogout={handleMaintenanceLogout}
      />
    </>
  )
}