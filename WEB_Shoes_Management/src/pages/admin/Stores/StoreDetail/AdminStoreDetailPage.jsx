import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { adminStoreApiService } from '~/services/admin/adminStoreApiService'
import { StoreDetailHeader } from './StoreDetailHeader'
import { StoreInfoCard } from './StoreInfoCard'
import { StoreStatsCard } from './StoreStatsCard'
import { StoreOwnerCard } from './StoreOwnerCard'
import { StoreRevenueChart } from './StoreRevenueChart'
import { StoreProductsList } from './StoreProductsList'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminStoreDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  usePageTitle(
    store ? `Cửa hàng ${store.name}` : 'Chi tiết cửa hàng',
    store ? `Xem chi tiết cửa hàng ${store.name}` : 'Xem chi tiết cửa hàng'
  )

  const fetchStoreDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminStoreApiService.getStoreDetail(id)
      setStore(res)
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || ''
      setError(errorMessage)
      if (!errorMessage.includes('không tồn tại') && !errorMessage.includes('đã bị xóa')) {
        toast.error(errorMessage || 'Không thể tải thông tin cửa hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchStoreDetail()
  }, [id])

  const handleToggleActive = async (isActive, reason = null) => {
    try {
      const res = await adminStoreApiService.toggleStoresActive([store.id], isActive, reason)
      toast.success(res.message)
      fetchStoreDetail()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateCommission = async (commissionRate) => {
    try {
      const res = await adminStoreApiService.updateStoresCommission([store.id], commissionRate)
      toast.success(res.message)
      fetchStoreDetail()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải thông tin cửa hàng...
        </motion.span>
      </div>
    )
  }

  if (!store) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <StoreDetailHeader
        store={store}
        onToggleActive={handleToggleActive}
        onUpdateCommission={handleUpdateCommission}
        onBack={() => navigate('/admin/stores')}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <StoreInfoCard store={store} />
          <StoreRevenueChart revenueStats={store.revenueStats || []} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <StoreStatsCard store={store} />
          <StoreOwnerCard owner={store.owner} />
        </div>
      </div>

      <StoreProductsList storeId={store.id} />
    </motion.div>
  )
}