import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { FiBarChart2, FiTrendingUp } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export const AdminRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[420px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
            <FiBarChart2 size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Chưa có dữ liệu</p>
        </div>
      </div>
    )
  }

  const labels = data.map(item =>
    new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  )

  const revenues = data.map(item => item.revenue || 0)
  const commissions = data.map(item => item.commission || 0)
  const orders = data.map(item => item.orders || 0)

  const totalRevenue = revenues.reduce((a, b) => a + b, 0)
  const totalOrders = orders.reduce((a, b) => a + b, 0)
  const totalCommission = commissions.reduce((a, b) => a + b, 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenues,
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { ctx: c, chartArea } = chart
          if (!chartArea) return '#10b981'
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.95)')
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.5)')
          return gradient
        },
        borderRadius: { topLeft: 6, topRight: 6 },
        borderSkipped: false,
        barPercentage: 0.5,
        categoryPercentage: 0.7,
        yAxisID: 'y',
        order: 2
      },
      {
        label: 'Hoa hồng',
        data: commissions,
        type: 'line',
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
        order: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleFont: { size: 12, weight: 'bold', family: 'inherit' },
        bodyFont: { size: 12, family: 'inherit' },
        padding: { x: 14, y: 12 },
        cornerRadius: 12,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        callbacks: {
          title: ([ctx]) => `Thời gian: ${ctx.label}`,
          label: (ctx) => {
            const label = ctx.dataset.label || ''
            return `${label}: ${formatPrice(ctx.raw)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: 11, weight: '600' },
          color: '#94a3b8',
          maxRotation: 0
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#f1f5f9', drawBorder: false },
        border: { display: false },
        ticks: {
          callback: (v) => {
            if (v === 0) return '0'
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
            if (v >= 1_000) return `${(v / 1000).toFixed(0)}K`
            return `${v}`
          },
          font: { size: 11, weight: '600' },
          color: '#94a3b8',
          maxTicksLimit: 6
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Doanh thu',
          color: '#10b981',
          font: { size: 10, weight: 'bold' }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        border: { display: false },
        ticks: {
          callback: (v) => {
            if (v === 0) return '0'
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
            if (v >= 1_000) return `${(v / 1000).toFixed(0)}K`
            return `${v}`
          },
          font: { size: 11, weight: '600' },
          color: '#94a3b8',
          maxTicksLimit: 6
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hoa hồng',
          color: '#f59e0b',
          font: { size: 10, weight: 'bold' }
        }
      }
    }
  }

  return (
    <div className="h-100 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
            <FiTrendingUp className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Biểu đồ doanh thu & hoa hồng</h3>
            <p className="text-xs text-gray-400 mt-0.5">Theo dõi xu hướng tài chính</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tổng DT</p>
            <p className="text-sm font-extrabold text-green-600">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Hoa hồng</p>
            <p className="text-sm font-extrabold text-amber-500">{formatPrice(totalCommission)}</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Đơn hàng</p>
            <p className="text-sm font-extrabold text-blue-500">{totalOrders.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-500">Doanh thu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-gray-500">Hoa hồng</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full relative px-4 pb-5" style={{ height: 300 }}>
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  )
}