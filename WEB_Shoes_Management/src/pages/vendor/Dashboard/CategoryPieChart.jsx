import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { FiPieChart } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'

ChartJS.register(ArcElement, ChartTooltip, Legend)

const COLORS = ['#e94560', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[420px] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
          <FiPieChart size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Chưa có dữ liệu</p>
      </div>
    </div>
  )

  const total = data.reduce((sum, item) => sum + item.revenue, 0)

  const chartData = {
    labels: data.map(item => item.categoryName),
    datasets: [
      {
        data: data.map(item => item.revenue),
        backgroundColor: COLORS,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        padding: { x: 14, y: 12 },
        cornerRadius: 12,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const pct = ((ctx.raw / total) * 100).toFixed(1)
            return `  ${ctx.label}: ${formatPrice(ctx.raw)} (${pct}%)`
          }
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
          <FiPieChart className="text-white" size={18} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900">Tỷ trọng danh mục</h3>
          <p className="text-xs text-gray-400 mt-0.5">Phân bổ doanh thu theo nhóm</p>
        </div>
      </div>

      {/* Donut + center label */}
      <div className="relative flex-1 px-6" style={{ height: 220 }}>
        <Doughnut data={chartData} options={options} />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng DT</p>
          <p className="text-base font-extrabold text-gray-900 mt-0.5">{formatPrice(total)}</p>
        </div>
      </div>

      {/* Custom legend */}
      <div className="px-6 pb-6 pt-4 space-y-2.5">
        {data.map((item, idx) => {
          const pct = ((item.revenue / total) * 100).toFixed(1)
          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-xs font-semibold text-gray-600 truncate">{item.categoryName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-gray-900">{formatPrice(item.revenue)}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: COLORS[idx % COLORS.length] + '20',
                    color: COLORS[idx % COLORS.length]
                  }}
                >
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}