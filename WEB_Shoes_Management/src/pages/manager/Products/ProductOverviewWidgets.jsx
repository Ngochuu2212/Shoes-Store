import { motion } from 'framer-motion'
import { FiPackage, FiCheckCircle, FiClock, FiAlertCircle, FiSlash, FiRefreshCw } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const ProductOverviewWidgets = ({ overview }) => {
  if (!overview) return null

  const items = [
    {
      title: 'Tổng sản phẩm',
      value: overview.totalAll,
      icon: FiPackage,
      color: 'border-l-indigo-500 text-indigo-600',
      bg: 'from-indigo-50/60 to-white',
      blob: 'bg-indigo-100/50'
    },
    {
      title: 'Chờ duyệt',
      value: overview.totalPending,
      icon: FiClock,
      color: 'border-l-amber-500 text-amber-600',
      bg: 'from-amber-50/60 to-white',
      blob: 'bg-amber-100/50'
    },
    {
      title: 'Chờ duyệt lại',
      value: overview.totalPendingReapproval || 0,
      icon: FiRefreshCw,
      color: 'border-l-orange-500 text-orange-600',
      bg: 'from-orange-50/60 to-white',
      blob: 'bg-orange-100/50'
    },
    {
      title: 'Đã duyệt',
      value: overview.totalApproved,
      icon: FiCheckCircle,
      color: 'border-l-green-500 text-green-600',
      bg: 'from-green-50/60 to-white',
      blob: 'bg-green-100/50'
    },
    {
      title: 'Bị từ chối',
      value: overview.totalRejected,
      icon: FiAlertCircle,
      color: 'border-l-red-500 text-red-600',
      bg: 'from-red-50/60 to-white',
      blob: 'bg-red-100/50'
    },
    {
      title: 'Bị khóa',
      value: overview.totalBanned,
      icon: FiSlash,
      color: 'border-l-rose-500 text-rose-600',
      bg: 'from-rose-50/60 to-white',
      blob: 'bg-rose-100/50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-4 overflow-hidden group hover:shadow-md transition-all duration-300`}
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <item.icon size={14} className={item.color.split(' ')[1]} />
          </div>
          <h3 className="text-xl font-black text-gray-800 mt-1.5">
            <CountUp value={item.value} />
          </h3>
        </div>
      ))}
    </motion.div>
  )
}