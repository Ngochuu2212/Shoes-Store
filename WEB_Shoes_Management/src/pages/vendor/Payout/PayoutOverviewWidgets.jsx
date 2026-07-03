import { motion } from 'framer-motion'
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'
import { formatPrice } from '~/utils/formatters'

export const PayoutOverviewWidgets = ({ balance, stats }) => {
  const items = [
    {
      title: 'Số dư khả dụng',
      value: balance,
      isPrice: true,
      icon: FiDollarSign,
      color: 'border-l-green-500 text-green-600',
      bg: 'from-green-50/60 to-white',
      blob: 'bg-green-100/50'
    },
    {
      title: 'Đang xử lý',
      value: stats?.pending || 0,
      icon: FiClock,
      color: 'border-l-amber-500 text-amber-600',
      bg: 'from-amber-50/60 to-white',
      blob: 'bg-amber-100/50'
    },
    {
      title: 'Đã duyệt',
      value: stats?.approved || 0,
      icon: FiCheckCircle,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50'
    },
    {
      title: 'Bị từ chối',
      value: stats?.rejected || 0,
      icon: FiXCircle,
      color: 'border-l-red-500 text-red-600',
      bg: 'from-red-50/60 to-white',
      blob: 'bg-red-100/50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {items.map((item, idx) => (
        <div key={idx} className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all duration-300`}>
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <item.icon size={16} className={item.color.split(' ')[1]} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mt-2">
            {item.value > 0 ? (
              <span className={item.title === 'Số dư khả dụng' ? 'text-brand-primary' : ''}>
                <CountUp value={item.value} />
              </span>
            ) : (
              <span className="text-gray-400">0</span>
            )}
          </h3>
        </div>
      ))}
    </motion.div>
  )
}