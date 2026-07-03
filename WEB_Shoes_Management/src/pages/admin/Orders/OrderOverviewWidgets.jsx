import { motion } from 'framer-motion'
import { FiClock, FiTruck, FiPackage, FiCheckCircle, FiXCircle, FiShoppingBag } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const OrderOverviewWidgets = ({ overview }) => {
  if (!overview) return null

  const items = [
    {
      title: 'Tổng đơn hàng',
      value: overview.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50',
      delay: 0.05
    },
    {
      title: 'Chờ xử lý',
      value: overview.pendingOrders || 0,
      icon: FiClock,
      color: 'border-l-amber-500 text-amber-600',
      bg: 'from-amber-50/60 to-white',
      blob: 'bg-amber-100/50',
      delay: 0.1
    },
    {
      title: 'Đang xử lý',
      value: overview.processingOrders || 0,
      icon: FiPackage,
      color: 'border-l-purple-500 text-purple-600',
      bg: 'from-purple-50/60 to-white',
      blob: 'bg-purple-100/50',
      delay: 0.15
    },
    {
      title: 'Đang giao',
      value: overview.shippedOrders || 0,
      icon: FiTruck,
      color: 'border-l-indigo-500 text-indigo-600',
      bg: 'from-indigo-50/60 to-white',
      blob: 'bg-indigo-100/50',
      delay: 0.2
    },
    {
      title: 'Đã giao',
      value: overview.deliveredOrders || 0,
      icon: FiCheckCircle,
      color: 'border-l-green-500 text-green-600',
      bg: 'from-green-50/60 to-white',
      blob: 'bg-green-100/50',
      delay: 0.25
    },
    {
      title: 'Đã hủy',
      value: overview.cancelledOrders || 0,
      icon: FiXCircle,
      color: 'border-l-red-500 text-red-600',
      bg: 'from-red-50/60 to-white',
      blob: 'bg-red-100/50',
      delay: 0.3
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: item.delay,
            duration: 0.4,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          whileHover={{
            y: -4,
            scale: 1.02,
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transition: { duration: 0.2 }
          }}
          className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-4 overflow-hidden group transition-all duration-300`}
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <item.icon size={14} className={item.color.split(' ')[1]} />
            </motion.div>
          </div>
          <h3 className="text-xl font-black text-gray-800 mt-1.5">
            <CountUp value={item.value} />
          </h3>
        </motion.div>
      ))}
    </motion.div>
  )
}