import { motion } from 'framer-motion'
import { FiDollarSign, FiShoppingBag, FiPercent, FiTrendingUp } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'
import { CountUp } from '~/components/common/CountUp'

export const AdminDashboardWidgets = ({ widgets }) => {
  if (!widgets) return null

  const items = [
    {
      title: 'Tổng doanh thu (GMV)',
      value: widgets.totalRevenue || 0,
      formattedValue: formatPrice(widgets.totalRevenue || 0),
      icon: FiDollarSign,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      borderColor: 'border-l-green-500',
      textColor: 'text-green-600',
      bgTint: 'bg-gradient-to-br from-green-50/80 to-white',
      blobColor: 'bg-green-100/60'
    },
    {
      title: 'Tổng đơn hàng',
      value: widgets.totalOrders || 0,
      formattedValue: widgets.totalOrders || 0,
      icon: FiShoppingBag,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      borderColor: 'border-l-blue-500',
      textColor: 'text-blue-600',
      bgTint: 'bg-gradient-to-br from-blue-50/80 to-white',
      blobColor: 'bg-blue-100/60'
    },
    {
      title: 'Hoa hồng thu về',
      value: widgets.totalCommission || 0,
      formattedValue: formatPrice(widgets.totalCommission || 0),
      icon: FiPercent,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      borderColor: 'border-l-amber-500',
      textColor: 'text-amber-600',
      bgTint: 'bg-gradient-to-br from-amber-50/80 to-white',
      blobColor: 'bg-amber-100/60'
    },
    {
      title: 'Doanh thu thực nhận',
      value: widgets.netRevenue || 0,
      formattedValue: formatPrice(widgets.netRevenue || 0),
      icon: FiTrendingUp,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      borderColor: 'border-l-emerald-500',
      textColor: 'text-emerald-600',
      bgTint: 'bg-gradient-to-br from-emerald-50/80 to-white',
      blobColor: 'bg-emerald-100/60'
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          variants={itemVariant}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative ${item.bgTint} rounded-2xl border-l-4 ${item.borderColor} border-r border-t border-b border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}
        >
          <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${item.blobColor} blur-2xl pointer-events-none`} />

          <div className="relative p-4 flex items-center gap-3">
            <div className={`relative ${item.iconBg} w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
              <item.icon size={20} />
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-500 mb-0.5 truncate">{item.title}</p>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                <CountUp value={item.value} />
              </h3>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}