import { motion } from 'framer-motion'
import { FiPackage, FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiStar } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const StoreStatsCard = ({ store }) => {
  const stats = [
    {
      icon: FiPackage,
      label: 'Tổng sản phẩm',
      value: store.total_products || 0,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: FiCheckCircle,
      label: 'Đang bán',
      value: store.active_products || 0,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      icon: FiShoppingCart,
      label: 'Đơn đã giao',
      value: store.total_orders || 0,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      icon: FiClock,
      label: 'Đang xử lý',
      value: store.processing_orders || 0,
      color: 'text-amber-500',
      bg: 'bg-amber-50'
    },
    {
      icon: FiClock,
      label: 'Chờ xử lý',
      value: store.pending_orders || 0,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    {
      icon: FiStar,
      label: 'Đánh giá',
      value: store.total_reviews || 0,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <FiShoppingCart className="text-blue-500" size={16} />
        </div>
        Thống kê cửa hàng
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * idx }}
            className={`${stat.bg} rounded-xl p-3 text-center border border-gray-100`}
          >
            <stat.icon size={16} className={`mx-auto ${stat.color}`} />
            <p className="text-lg font-black text-gray-900 mt-1">
              <CountUp value={stat.value} />
            </p>
            <p className="text-[10px] font-semibold text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}