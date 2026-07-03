import { motion } from 'framer-motion'
import { FiDollarSign, FiShoppingBag, FiBox, FiPercent, FiTrendingUp } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'
import { CountUp } from '~/components/common/CountUp'

export const DashboardWidgets = ({ widgets }) => {
  if (!widgets) return null

  // Tính phí sàn (giả sử commission_rate = 10%)
  const commissionRate = widgets.commissionRate || 10
  const totalRevenue = widgets.totalRevenue || 0
  const commissionFee = totalRevenue * (commissionRate / 100)
  const netRevenue = totalRevenue - commissionFee

  const items = [
    {
      title: 'Tổng doanh thu',
      value: totalRevenue,
      formattedValue: formatPrice(totalRevenue),
      icon: FiDollarSign,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      borderColor: 'border-l-green-500',
      textColor: 'text-green-600',
      suffix: 'đ',
      bgTint: 'bg-gradient-to-br from-green-50/80 to-white',
      blobColor: 'bg-green-100/60'
    },
    {
      title: 'Đơn giao thành công',
      value: widgets.totalOrdersSuccess,
      formattedValue: widgets.totalOrdersSuccess,
      icon: FiShoppingBag,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      borderColor: 'border-l-blue-500',
      textColor: 'text-blue-600',
      suffix: 'đơn',
      bgTint: 'bg-gradient-to-br from-blue-50/80 to-white',
      blobColor: 'bg-blue-100/60'
    },
    {
      title: 'Sản phẩm đã bán',
      value: widgets.totalProductsSold,
      formattedValue: widgets.totalProductsSold,
      icon: FiBox,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      borderColor: 'border-l-purple-500',
      textColor: 'text-purple-600',
      suffix: 'sp',
      bgTint: 'bg-gradient-to-br from-purple-50/80 to-white',
      blobColor: 'bg-purple-100/60'
    },
    {
      title: `Phí sàn (${commissionRate}%)`,
      value: commissionFee,
      formattedValue: formatPrice(commissionFee),
      icon: FiPercent,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      borderColor: 'border-l-amber-500',
      textColor: 'text-amber-600',
      suffix: 'đ',
      bgTint: 'bg-gradient-to-br from-amber-50/80 to-white',
      blobColor: 'bg-amber-100/60'
    },
    {
      title: 'Doanh thu thực nhận',
      value: netRevenue,
      formattedValue: formatPrice(netRevenue),
      icon: FiTrendingUp,
      iconBg: 'bg-gradient-to-br from-brand-primary to-rose-600',
      borderColor: 'border-l-brand-primary',
      textColor: 'text-brand-primary',
      suffix: 'đ',
      bgTint: 'bg-gradient-to-br from-brand-primary/5 to-white',
      blobColor: 'bg-brand-primary/10'
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
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                {typeof item.value === 'number' ? (
                  <CountUp value={item.value} suffix={item.suffix === 'đ' ? 'đ' : ''} />
                ) : (
                  <CountUp value={item.formattedValue} suffix="đ" />
                )}
              </h3>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}