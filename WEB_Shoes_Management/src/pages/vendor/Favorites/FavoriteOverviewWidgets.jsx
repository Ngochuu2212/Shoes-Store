import { motion } from 'framer-motion'
import { FiHeart, FiBox, FiTrendingUp } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const FavoriteOverviewWidgets = ({ overview }) => {
  if (!overview) return null

  const items = [
    {
      title: 'Tổng lượt yêu thích',
      value: overview.totalFavoritesAllTime,
      icon: FiHeart,
      color: 'text-rose-500',
      bg: 'bg-rose-50/50',
      border: 'border-l-rose-500',
      blob: 'bg-rose-100/50',
      isText: false
    },
    {
      title: 'Sản phẩm được quan tâm',
      value: overview.uniqueProductsFavorited,
      icon: FiBox,
      color: 'text-blue-500',
      bg: 'bg-blue-50/50',
      border: 'border-l-blue-500',
      blob: 'bg-blue-100/50',
      isText: false
    },
    {
      title: 'Sản phẩm HOT nhất',
      value: overview.mostFavoritedProduct,
      icon: FiTrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-50/50',
      border: 'border-l-amber-500',
      blob: 'bg-amber-100/50',
      isText: true
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {items.map((item, idx) => (
        <div key={idx} className={`relative ${item.bg} rounded-3xl border-l-4 ${item.border} border-t border-b border-r border-gray-100 shadow-sm p-6 overflow-hidden group hover:shadow-md transition-all duration-300`}>
          <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${item.blob} blur-2xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.title}</p>
            <div className={`p-2 rounded-xl bg-white shadow-sm ${item.color}`}>
              <item.icon size={18} className="fill-current opacity-20" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-4 truncate" title={item.isText ? item.value : ''}>
            {item.isText ? (
              <span className={`text-lg ${item.value === 'Chưa có' ? 'text-gray-400' : 'text-gray-800'}`}>{item.value}</span>
            ) : (
              <CountUp value={item.value} />
            )}
          </h3>
        </div>
      ))}
    </motion.div>
  )
}