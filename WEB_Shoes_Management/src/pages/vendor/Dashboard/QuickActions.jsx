import { motion } from 'framer-motion'
import {
  FiPlus, FiPackage, FiTag, FiDollarSign,
  FiTrendingUp, FiMessageSquare, FiShoppingBag, FiUsers
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const actions = [
  {
    title: 'Thêm sản phẩm',
    description: 'Thêm sản phẩm mới vào kho hàng',
    icon: FiPlus,
    link: '/vendor/products/add',
    color: 'bg-gradient-to-br from-brand-primary to-rose-500',
    bg: 'bg-brand-primary/10',
    textColor: 'text-brand-primary'
  },
  {
    title: 'Tạo khuyến mãi',
    description: 'Tạo mã giảm giá cho khách hàng',
    icon: FiTag,
    link: '/vendor/promotions/add',
    color: 'bg-gradient-to-br from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-600'
  },
  {
    title: 'Xem đơn hàng',
    description: 'Kiểm tra đơn hàng mới',
    icon: FiShoppingBag,
    link: '/vendor/orders',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    title: 'Quản lý kho',
    description: 'Cập nhật tồn kho sản phẩm',
    icon: FiPackage,
    link: '/vendor/products',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  {
    title: 'Quản lý đánh giá',
    description: 'Xem và phản hồi đánh giá',
    icon: FiMessageSquare,
    link: '/vendor/reviews',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    title: 'Rút tiền',
    description: 'Yêu cầu thanh toán doanh thu',
    icon: FiDollarSign,
    link: '/vendor/payouts',
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    textColor: 'text-green-600'
  }
]

export const QuickActions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-rose-500 flex items-center justify-center shadow-md shadow-brand-primary/20">
            <FiTrendingUp className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Hành động nhanh</h3>
            <p className="text-xs text-gray-400 mt-0.5">Thao tác nhanh để quản lý cửa hàng của bạn</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {actions.map((action, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Link
              to={action.link}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon size={22} className={action.textColor} />
              </div>
              <h4 className="text-sm font-extrabold text-gray-800 group-hover:text-brand-primary transition-colors duration-300">
                {action.title}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                {action.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer với tips */}
      <div className="px-6 py-4 bg-gradient-to-r from-brand-primary/5 to-transparent border-t border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <FiMessageSquare size={12} className="text-brand-primary" />
            </div>
            <span className="text-xs text-gray-500">
              Mẹo: Sử dụng các hành động nhanh để tiết kiệm thời gian quản lý
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
              <FiUsers size={12} className="text-amber-500" />
            </div>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}