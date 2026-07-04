import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiClock, FiTruck, FiCheckCircle, FiPackage, FiArrowRight, FiCamera, FiAlertCircle } from 'react-icons/fi'
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
  accepted_by_shipper: '#3b82f6', shipping: '#f97316', delivered: '#8b5cf6',
  completed: '#10b981', cancelled: '#ef4444'
}

const StatCard = ({ icon: Icon, label, value, bgGradient, iconColor, textColor, delay = 0, link }) => {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Decorative background shape */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br ${bgGradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-3xl font-extrabold text-gray-800 tracking-tight">{value ?? 0}</p>
          <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wider">{label}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white shadow-sm shadow-gray-100 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>

      {link && (
        <div className="flex items-center gap-1 mt-4 text-xs font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
          <span>Xem chi tiết</span>
          <FiArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </motion.div>
  )
  return link ? <Link to={link} className="block">{inner}</Link> : inner
}

const PROCESS_STEPS = [
  { step: 1, icon: FiClock, title: 'Nhận Đơn', text: 'Nhận đơn hàng mới từ danh sách "Đơn chờ nhận"', color: 'border-l-amber-500 bg-amber-50/30 text-amber-900', iconBg: 'bg-amber-500' },
  { step: 2, icon: FiTruck, title: 'Xuất Phát', text: 'Chọn "Bắt đầu giao" khi bạn đi lấy & giao hàng', color: 'border-l-blue-500 bg-blue-50/30 text-blue-900', iconBg: 'bg-blue-500' },
  { step: 3, icon: FiCheckCircle, title: 'Giao Hàng', text: 'Chọn "Đã giao" sau khi trao hàng cho người mua', color: 'border-l-purple-500 bg-purple-50/30 text-purple-900', iconBg: 'bg-purple-500' },
  { step: 4, icon: FiCamera, title: 'Minh Chứng', text: 'Chụp hình gói hàng/người nhận và nhấn "Hoàn tất"', color: 'border-l-green-500 bg-green-50/30 text-green-900', iconBg: 'bg-green-500' }
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
      backgroundColor: '#f97316',
      hoverBackgroundColor: '#ea580c',
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 16
    }]
  } : null

  const doughnutData = charts?.statusBreakdown?.length > 0 ? {
    labels: charts.statusBreakdown.map(s => STATUS_LABEL[s.status] || s.status),
    datasets: [{
      data: charts.statusBreakdown.map(s => s.count),
      backgroundColor: charts.statusBreakdown.map(s => STATUS_COLOR[s.status] || '#94a3b8'),
      borderWidth: 3,
      borderColor: '#fff',
      hoverOffset: 4
    }]
  } : null

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: { label: ctx => ` Giao được: ${ctx.parsed.y} đơn` }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#9ca3af', font: { size: 11 } },
        grid: { color: '#f3f4f6', drawBorder: false }
      },
      x: {
        ticks: { color: '#9ca3af', font: { size: 11 } },
        grid: { display: false, drawBorder: false }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11, weight: 'semibold' },
          color: '#4b5563',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 10,
        bodyFont: { size: 12 }
      }
    },
    cutout: '72%'
  }

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-6 md:p-8 overflow-hidden shadow-md shadow-orange-100/50"
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <FiTruck size={120} className="text-white" />
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/10 uppercase tracking-wider">
            {todayStr}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-4 tracking-tight">
            Xin chào, {user?.fullname || 'Shipper'}! 👋
          </h1>
          <p className="text-orange-50 text-sm md:text-base mt-2 max-w-xl opacity-90 leading-relaxed">
            Hôm nay bạn đang có các đơn hàng mới cần giao nhận. Hãy bắt đầu hành trình an toàn và thuận lợi nhé!
          </p>
        </div>
      </motion.div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-28 animate-pulse bg-gray-100 border border-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiClock}
            label="Đơn chờ nhận"
            value={stats?.waitingOrders}
            bgGradient="from-amber-400 to-orange-500"
            link="/shipper/available-orders"
            delay={0}
          />
          <StatCard
            icon={FiTruck}
            label="Đang giao"
            value={stats?.activeDeliveries}
            bgGradient="from-blue-500 to-indigo-600"
            link="/shipper/my-deliveries"
            delay={0.05}
          />
          <StatCard
            icon={FiCheckCircle}
            label="Hoàn tất hôm nay"
            value={stats?.completedToday}
            bgGradient="from-emerald-400 to-teal-500"
            delay={0.1}
          />
          <StatCard
            icon={FiPackage}
            label="Tổng đã giao"
            value={stats?.totalCompleted}
            bgGradient="from-purple-500 to-pink-500"
            delay={0.15}
          />
        </div>
      )}

      {/* Charts */}
      {!loading && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily completed chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-800">Hiệu suất giao hàng</h2>
                <p className="text-xs text-gray-400 mt-0.5">Số đơn hoàn thành thành công trong 7 ngày gần đây</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <FiCheckCircle size={16} className="text-orange-500" />
              </div>
            </div>
            {barData && barData.datasets[0].data.some(v => v > 0) ? (
              <div className="h-[240px] relative">
                <Bar data={barData} options={barOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-gray-400">
                <FiPackage size={36} className="mb-2.5 opacity-30 text-gray-400" />
                <p className="text-sm font-semibold">Chưa có dữ liệu đơn hoàn thành</p>
              </div>
            )}
          </motion.div>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-800">Phân bổ trạng thái</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tỷ lệ các đơn hàng đang xử lý</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <FiTruck size={16} className="text-purple-500" />
              </div>
            </div>
            {doughnutData ? (
              <div className="h-[240px] relative">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-gray-400">
                <FiAlertCircle size={36} className="mb-2.5 opacity-30 text-gray-400" />
                <p className="text-sm font-semibold">Chưa có đơn hàng để phân tích</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Process guide */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-base font-bold text-gray-800 mb-5">Quy trình giao hàng chuẩn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PROCESS_STEPS.map(({ step, icon: Icon, title, text, color, iconBg }) => (
            <div key={step} className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 border ${color} shadow-sm/5 hover:-translate-y-0.5 transition-transform duration-200`}>
              <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide opacity-50">Bước {step}</p>
                <p className="text-sm font-bold mt-0.5 leading-tight">{title}</p>
                <p className="text-xs leading-relaxed mt-1 opacity-80">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}