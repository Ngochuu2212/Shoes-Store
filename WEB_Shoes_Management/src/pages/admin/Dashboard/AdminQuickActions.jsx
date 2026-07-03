import { motion } from 'framer-motion'
import {
  FiPlus, FiUsers, FiHome, FiGrid, FiLayers,
  FiShoppingCart, FiDollarSign, FiSettings, FiTrendingUp
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const actions = [
  {
    title: 'Quản lý user',
    description: 'Xem và quản lý người dùng',
    icon: FiUsers,
    link: '/admin/users',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    title: 'Quản lý cửa hàng',
    description: 'Xem và quản lý cửa hàng',
    icon: FiHome,
    link: '/admin/stores',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    title: 'Quản lý danh mục',
    description: 'Quản lý danh mục sản phẩm',
    icon: FiGrid,
    link: '/admin/categories',
    color: 'bg-gradient-to-br from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-600'
  },
  {
    title: 'Quản lý biến thể',
    description: 'Quản lý size và màu sắc',
    icon: FiLayers,
    link: '/admin/attributes',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  {
    title: 'Quản lý đơn hàng',
    description: 'Xem và xử lý đơn hàng',
    icon: FiShoppingCart,
    link: '/admin/orders',
    color: 'bg-gradient-to-br from-rose-500 to-red-500',
    bg: 'bg-rose-50',
    textColor: 'text-rose-600'
  },
  {
    title: 'Quản lý rút tiền',
    description: 'Duyệt yêu cầu rút tiền',
    icon: FiDollarSign,
    link: '/admin/payouts',
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    title: 'Cấu hình hệ thống',
    description: 'Cài đặt tham số hệ thống',
    icon: FiSettings,
    link: '/admin/settings',
    color: 'bg-gradient-to-br from-gray-500 to-slate-500',
    bg: 'bg-gray-50',
    textColor: 'text-gray-600'
  },
  {
    title: 'Xem báo cáo',
    description: 'Thống kê tài chính',
    icon: FiTrendingUp,
    link: '/admin/dashboard',
    color: 'bg-gradient-to-br from-cyan-500 to-sky-500',
    bg: 'bg-cyan-50',
    textColor: 'text-cyan-600'
  }
]

export const AdminQuickActions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
            <FiTrendingUp className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Hành động nhanh</h3>
            <p className="text-xs text-gray-400 mt-0.5">Quản lý toàn bộ hệ thống</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
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
              <h4 className="text-sm font-extrabold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                {action.title}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                {action.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-t border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FiTrendingUp size={12} className="text-emerald-500" />
            </div>
            <span className="text-xs text-gray-500">
              Tổng quan tài chính toàn hệ thống
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
              <FiDollarSign size={12} className="text-amber-500" />
            </div>
            <span className="text-xs text-gray-500">
              Cập nhật: {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}