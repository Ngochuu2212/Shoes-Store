import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FiBarChart2, FiTrendingUp } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const StoreRevenueChart = ({ revenueStats }) => {
  if (!revenueStats || revenueStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[300px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
            <FiBarChart2 size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Chưa có dữ liệu doanh thu</p>
        </div>
      </div>
    )
  }

  // Sắp xếp theo ngày tăng dần
  const sortedData = [...revenueStats].sort((a, b) => new Date(a.date) - new Date(b.date))

  const labels = sortedData.map(item =>
    new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  )
  const revenues = sortedData.map(item => item.daily_revenue || 0)
  const commissions = sortedData.map(item => item.daily_commission || 0)

  const totalRevenue = revenues.reduce((a, b) => a + b, 0)
  const totalCommission = commissions.reduce((a, b) => a + b, 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenues,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
        barPercentage: 0.6
      },
      {
        label: 'Hoa hồng',
        data: commissions,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 11, weight: 'bold' },
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            return `${ctx.dataset.label}: ${formatPrice(ctx.raw)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 10 },
          callback: (value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`
        }
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FiTrendingUp className="text-emerald-500" size={16} />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Biểu đồ doanh thu</h3>
            <p className="text-xs text-gray-400">30 ngày gần nhất</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-gray-400">Tổng DT: </span>
            <span className="font-bold text-emerald-600">{formatPrice(totalRevenue)}</span>
          </div>
          <div>
            <span className="text-gray-400">Hoa hồng: </span>
            <span className="font-bold text-amber-600">{formatPrice(totalCommission)}</span>
          </div>
        </div>
      </div>

      <div className="h-[250px]">
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  )
}