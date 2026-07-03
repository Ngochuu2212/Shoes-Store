import { motion } from 'framer-motion'
import { FiStar, FiMessageSquare, FiEyeOff, FiFlag, FiPackage, FiHome } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'
import { REVIEW_TYPES } from '~/utils/constant'

export const ReviewOverviewWidgets = ({ overview, reviewType }) => {
  if (!overview) return null

  // Widget cho Product Reviews
  const productItems = [
    {
      title: 'Đánh giá sản phẩm',
      value: overview.totalProductReviews,
      icon: FiPackage,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50'
    },
    {
      title: 'Đánh giá trung bình',
      value: overview.avgProductRating,
      icon: FiStar,
      color: 'border-l-amber-500 text-amber-600',
      bg: 'from-amber-50/60 to-white',
      blob: 'bg-amber-100/50',
      suffix: '/5'
    },
    {
      title: 'Đã ẩn (SP)',
      value: overview.inactiveProductReviews || 0,
      icon: FiEyeOff,
      color: 'border-l-gray-500 text-gray-500',
      bg: 'from-gray-50/60 to-white',
      blob: 'bg-gray-100/50'
    },
    {
      title: 'Đã báo cáo (SP)',
      value: overview.reportedProductReviews || 0,
      icon: FiFlag,
      color: 'border-l-red-500 text-red-600',
      bg: 'from-red-50/60 to-white',
      blob: 'bg-red-100/50'
    }
  ]

  // Widget cho Store Reviews
  const storeItems = [
    {
      title: 'Đánh giá cửa hàng',
      value: overview.totalStoreReviews,
      icon: FiHome,
      color: 'border-l-purple-500 text-purple-600',
      bg: 'from-purple-50/60 to-white',
      blob: 'bg-purple-100/50'
    },
    {
      title: 'Đánh giá trung bình',
      value: overview.avgStoreRating,
      icon: FiStar,
      color: 'border-l-amber-500 text-amber-600',
      bg: 'from-amber-50/60 to-white',
      blob: 'bg-amber-100/50',
      suffix: '/5'
    },
    {
      title: 'Đã ẩn (CH)',
      value: overview.inactiveStoreReviews || 0,
      icon: FiEyeOff,
      color: 'border-l-gray-500 text-gray-500',
      bg: 'from-gray-50/60 to-white',
      blob: 'bg-gray-100/50'
    },
    {
      title: 'Đã báo cáo (CH)',
      value: overview.reportedStoreReviews || 0,
      icon: FiFlag,
      color: 'border-l-red-500 text-red-600',
      bg: 'from-red-50/60 to-white',
      blob: 'bg-red-100/50'
    }
  ]

  const items = reviewType === REVIEW_TYPES.PRODUCT ? productItems : storeItems

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
          <h3 className="text-2xl font-black text-gray-800 mt-2 flex items-baseline gap-1">
            {item.value === '0.0' || item.value === 0 ? (
              <span className="text-lg font-bold text-black">0</span>
            ) : item.suffix ? (
              <>
                <CountUp value={parseFloat(item.value)} />
                <span className="text-sm font-semibold text-gray-400">{item.suffix}</span>
              </>
            ) : (
              <CountUp value={item.value} />
            )}
          </h3>
        </div>
      ))}
    </motion.div>
  )
}