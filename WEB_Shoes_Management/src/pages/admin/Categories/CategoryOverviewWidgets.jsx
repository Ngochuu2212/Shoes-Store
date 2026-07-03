import { motion } from 'framer-motion'
import { FiGrid, FiFolder, FiFolderPlus, FiCheckCircle } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const CategoryOverviewWidgets = ({ overview }) => {
  if (!overview) return null

  const items = [
    {
      title: 'Tổng danh mục',
      value: overview.totalCategories || 0,
      icon: FiGrid,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50'
    },
    {
      title: 'Danh mục gốc',
      value: overview.rootCategories || 0,
      icon: FiFolder,
      color: 'border-l-emerald-500 text-emerald-600',
      bg: 'from-emerald-50/60 to-white',
      blob: 'bg-emerald-100/50'
    },
    {
      title: 'Danh mục con',
      value: overview.childCategories || 0,
      icon: FiFolderPlus,
      color: 'border-l-purple-500 text-purple-600',
      bg: 'from-purple-50/60 to-white',
      blob: 'bg-purple-100/50'
    },
    {
      title: 'Đang hoạt động',
      value: overview.activeCategories || 0,
      icon: FiCheckCircle,
      color: 'border-l-green-500 text-green-600',
      bg: 'from-green-50/60 to-white',
      blob: 'bg-green-100/50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all duration-300`}
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <item.icon size={16} className={item.color.split(' ')[1]} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mt-2">
            <CountUp value={item.value} />
          </h3>
        </div>
      ))}
    </motion.div>
  )
}