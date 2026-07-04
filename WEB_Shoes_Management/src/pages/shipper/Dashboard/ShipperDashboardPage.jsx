import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiTruck, FiCheckCircle, FiPackage } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </motion.div>
)

export const ShipperDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await shipperApiService.getDashboard()
        setStats(data)
      } catch {
        toast.error('Không thể tải thống kê')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Shipper</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hoạt động giao hàng của bạn</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiClock} label="Đơn chờ nhận" value={stats?.waitingOrders ?? 0} color="bg-yellow-500" />
          <StatCard icon={FiTruck} label="Đang giao" value={stats?.activeDeliveries ?? 0} color="bg-blue-500" />
          <StatCard icon={FiCheckCircle} label="Hoàn tất hôm nay" value={stats?.completedToday ?? 0} color="bg-green-500" />
          <StatCard icon={FiPackage} label="Tổng đã giao" value={stats?.totalCompleted ?? 0} color="bg-orange-500" />
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Hướng dẫn quy trình</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { step: '1', text: 'Vào "Đơn chờ nhận" và nhận đơn hàng', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { step: '2', text: 'Nhấn "Bắt đầu giao" khi xuất phát', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { step: '3', text: 'Nhấn "Đã giao" khi giao đến khách', color: 'bg-purple-50 border-purple-200 text-purple-700' },
            { step: '4', text: 'Upload ảnh chứng minh rồi "Hoàn tất"', color: 'bg-green-50 border-green-200 text-green-700' }
          ].map(({ step, text, color }) => (
            <div key={step} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${color}`}>
              <span className="font-bold">Bước {step}:</span> {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
