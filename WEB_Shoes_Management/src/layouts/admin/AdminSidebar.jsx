import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiUsers, FiHome as FiStore, FiGrid, FiLayers,
  FiShoppingCart, FiDollarSign, FiSettings, FiLogOut, FiX
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'

export const AdminSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <FiHome size={20} />
    },
    {
      name: 'Quản lý Người dùng',
      path: '/admin/users',
      icon: <FiUsers size={20} />
    },
    {
      name: 'Quản lý Cửa hàng',
      path: '/admin/stores',
      icon: <FiStore size={20} />
    },
    {
      name: 'Quản lý Danh mục',
      path: '/admin/categories',
      icon: <FiGrid size={20} />
    },
    {
      name: 'Quản lý Biến thể',
      path: '/admin/attributes',
      icon: <FiLayers size={20} />
    },
    {
      name: 'Quản lý Đơn hàng',
      path: '/admin/orders',
      icon: <FiShoppingCart size={20} />
    },
    {
      name: 'Quản lý Rút tiền',
      path: '/admin/payouts',
      icon: <FiDollarSign size={20} />
    },
    {
      name: 'Cấu hình hệ thống',
      path: '/admin/settings',
      icon: <FiSettings size={20} />
    }
  ]

  const checkIsActive = (path) => {
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  // Nội dung sidebar
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 md:h-20 flex items-center px-3 md:px-5 border-b border-gray-700 shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-2 md:gap-2.5 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md group-hover:scale-105 transition-all duration-300">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-extrabold text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-all duration-300">
              ShoesStore
            </span>
            <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
              Quản trị hệ thống
            </span>
          </div>
        </Link>
      </div>

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto py-4 md:py-6 px-2 md:px-4 space-y-1.5 custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = checkIsActive(item.path)
          return (
            <Link
              key={index}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base group ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50 font-semibold'
              } hover:translate-x-1`}
            >
              <span className="transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="flex-1 inline">{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Nút Đăng xuất */}
      <div className="p-3 md:p-4 border-t border-gray-700 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl font-bold transition-all duration-300 cursor-pointer group hover:translate-x-1 text-sm md:text-base"
        >
          <FiLogOut size={18} className="transition-all duration-300 group-hover:scale-110" />
          <span className="inline">Đăng xuất</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-74 bg-gradient-to-br from-gray-900 to-gray-800 border-r border-gray-700 flex-col h-screen sticky top-0 shadow-lg z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 w-[280px] h-screen bg-gradient-to-br from-gray-900 to-gray-800 border-r border-gray-700 shadow-2xl lg:hidden"
            >
              {/* Nút đóng */}
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all duration-300 z-10"
              >
                <FiX size={20} className="text-gray-400" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}