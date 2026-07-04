import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiTruck, FiCheckCircle, FiPackage } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const STATUS_LABEL = {
  accepted_by_shipper: 'Đã nhận', shipping: 'Đang giao', delivered: 'Chờ xác nhận',
  completed: 'Hoàn tất', cancelled: 'Đã hủy'
}
const STATUS_COLOR = {
  accepted_by_shipper: '#6366f1', shipping: '#f97316', delivered: '#a855f7',
  completed: '#22c55e', cancelled: '#ef4444'
}

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
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
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsData, chartsData] = await Promise.all([
          shipperApiService.getDashboard(),
          shipperApiService.getDashboardCharts()
        ])
        setStats(statsData)
        setCharts(chartsData)
      } catch {
        toast.error('Không thể tải thống kê')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const barData = charts ? {
    labels: charts.daily.map(d => {
      const date = new Date(d.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [{
      label: 'Đơn hoàn tất',
      data: charts.daily.map(d => d.count),
      backgroundColor: 'rgba(249, 115, 22, 0.7)',
      borderColor: '#f97316',
      borderWidth: 1.5,
      borderRadius: 6
    }]
  } : null

  const doughnutData = charts?.statusBreakdown?.length > 0 ? {
    labels: charts.statusBreakdown.map(s => STATUS_LABEL[s.status] || s.status),
    datasets: [{
      data: charts.statusBreakdown.map(s => s.count),
      backgroundColor: charts.statusBreakdown.map(s => STATUS_COLOR[s.status] || '#94a3b8'),
      borderWidth: 2, borderColor: '#fff'
    }]
  } : null

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  }
  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
    cutout: '68%'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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
          <StatCard icon={FiClock} label="Đơn chờ nhận" value={stats?.waitingOrders ?? 0} color="bg-yellow-500" delay={0} />
          <StatCard icon={FiTruck} label="Đang giao" value={stats?.activeDeliveries ?? 0} color="bg-blue-500" delay={0.05} />
          <StatCard icon={FiCheckCircle} label="Hoàn tất hôm nay" value={stats?.completedToday ?? 0} color="bg-green-500" delay={0.1} />
          <StatCard icon={FiPackage} label="Tổng đã giao" value={stats?.totalCompleted ?? 0} color="bg-orange-500" delay={0.15} />
        </div>
      )}

      {!loading && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4">Đơn hoàn tất 7 ngày qua</h2>
            {barData && barData.datasets[0].data.some(v => v > 0) ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <FiPackage size={32} className="mb-2 opacity-40" />
                <p className="text-sm">Chưa có dữ liệu giao hàng trong 7 ngày qua</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4">Phân bổ trạng thái</h2>
            {doughnutData ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <FiTruck size={32} className="mb-2 opacity-40" />
                <p className="text-sm text-center">Chưa có đơn hàng nào</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-base font-semibold text-gray-800 mb-3">Hướng dẫn quy trình giao hàng</h2>
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
      </motion.div>
    </div>
  )
}