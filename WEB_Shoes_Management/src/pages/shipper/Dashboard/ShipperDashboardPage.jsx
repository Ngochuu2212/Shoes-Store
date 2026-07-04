import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiClock, FiTruck, FiCheckCircle, FiPackage, FiArrowRight, FiCamera } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
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

const StatCard = ({ icon: Icon, label, value, bg, delay = 0, link }) => {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`relative ${bg} rounded-2xl p-5 text-white shadow-md overflow-hidden`}
    >
      <div className="absolute -top-3 -right-3 opacity-20 pointer-events-none">
        <Icon size={72} />
      </div>
      <p className="text-4xl font-black leading-none">{value ?? 0}</p>
      <p className="text-sm font-medium mt-2.5 opacity-90 leading-tight">{label}</p>
      {link && (
        <div className="flex items-center gap-1 mt-2 text-xs opacity-75 font-medium">
          <span>Xem ngay</span>
          <FiArrowRight size={11} />
        </div>
      )}
    </motion.div>
  )
  return link ? <Link to={link} className="block hover:scale-[1.02] transition-transform duration-200">{inner}</Link> : inner
}

const PROCESS_STEPS = [
  { step: 1, icon: FiClock, text: 'Nhận đơn từ mục "Đơn chờ nhận"', color: 'bg-amber-50 border-amber-200 text-amber-700', iconBg: 'bg-amber-500' },
  { step: 2, icon: FiTruck, text: 'Nhấn "Bắt đầu giao" khi xuất phát giao hàng', color: 'bg-blue-50 border-blue-200 text-blue-700', iconBg: 'bg-blue-500' },
  { step: 3, icon: FiCheckCircle, text: 'Nhấn "Đã giao" khi giao đến tay khách', color: 'bg-purple-50 border-purple-200 text-purple-700', iconBg: 'bg-purple-500' },
  { step: 4, icon: FiCamera, text: 'Upload ảnh minh chứng rồi nhấn "Hoàn tất"', color: 'bg-green-50 border-green-200 text-green-700', iconBg: 'bg-green-500' }
]

export const ShipperDashboardPage = () => {
  const user = useSelector(state => state.user.userInfo)
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)
  const todayStr = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

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
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} đơn` } } },
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
      {/* Greeting banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 rounded-2xl p-6 overflow-hidden shadow-lg shadow-orange-200"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <FiTruck size={100} />
        </div>
        <p className="text-orange-100 text-sm font-medium capitalize">{todayStr}</p>
        <h1 className="text-2xl font-black text-white mt-1">Xin chào, {user?.fullname || 'Shipper'} 👋</h1>
        <p className="text-orange-100 text-sm mt-1">Chúc bạn giao hàng thuận lợi hôm nay!</p>
      </motion.div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-28 animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiClock} label="Đơn chờ nhận" value={stats?.waitingOrders} bg="bg-gradient-to-br from-amber-400 to-orange-500" delay={0} link="/shipper/available-orders" />
          <StatCard icon={FiTruck} label="Đang giao" value={stats?.activeDeliveries} bg="bg-gradient-to-br from-blue-400 to-indigo-500" delay={0.05} link="/shipper/my-deliveries" />
          <StatCard icon={FiCheckCircle} label="Hoàn tất hôm nay" value={stats?.completedToday} bg="bg-gradient-to-br from-green-400 to-emerald-500" delay={0.1} link={null} />
          <StatCard icon={FiPackage} label="Tổng đã giao" value={stats?.totalCompleted} bg="bg-gradient-to-br from-violet-400 to-purple-500" delay={0.15} link={null} />
        </div>
      )}

      {/* Charts */}
      {!loading && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-800">Đơn hoàn tất 7 ngày qua</h2>
                <p className="text-xs text-gray-400 mt-0.5">Số đơn giao thành công theo ngày</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <FiCheckCircle size={16} className="text-orange-500" />
              </div>
            </div>
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
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-800">Phân bổ trạng thái</h2>
                <p className="text-xs text-gray-400 mt-0.5">Toàn bộ đơn hàng của bạn</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <FiTruck size={16} className="text-purple-500" />
              </div>
            </div>
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

      {/* Process guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-base font-bold text-gray-800 mb-4">Quy trình giao hàng chuẩn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PROCESS_STEPS.map(({ step, icon: Icon, text, color, iconBg }) => (
            <div key={step} className={`flex items-start gap-3 p-4 rounded-xl border ${color}`}>
              <div className={`${iconBg} w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold mb-0.5">Bước {step}</p>
                <p className="text-xs leading-relaxed opacity-90">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}