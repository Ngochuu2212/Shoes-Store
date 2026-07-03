import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiPackage, FiStar, FiLogOut, FiAlertCircle, FiMenu, FiX, FiGift
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'

export const ManagerSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)

  const menuItems = [
    {
      name: 'Quản lý Cửa hàng',
      path: '/manager/stores',
      icon: <FiHome size={20} />
    },
    {
      name: 'Quản lý Sản phẩm',
      path: '/manager/products',
      icon: <FiPackage size={20} />
    },
    {
      name: 'Quản lý Đánh giá',
      path: '/manager/reviews',
      icon: <FiStar size={20} />
    },
    {
      name: 'Cứu xét cửa hàng',
      path: '/manager/appeals',
      icon: <FiAlertCircle size={20} />
    },
    {
      name: 'Mã giảm giá hệ thống',
      path: '/manager/promotions',
      icon: <FiGift size={20} />
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
      <div className="h-16 md:h-20 flex items-center px-3 md:px-5 border-b border-sidebar-border shrink-0">
        <Link to="/manager/stores" className="flex items-center gap-2 md:gap-2.5 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md group-hover:scale-105 transition-all duration-300">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-extrabold text-gray-800 tracking-tight leading-tight group-hover:text-blue-600 transition-all duration-300">
              ShoesStore
            </span>
            <span className="text-[8px] md:text-[10px] font-bold text-blue-600 tracking-widest uppercase">
              Quản trị sàn
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
                  ? 'bg-sidebar-item-active text-blue-600 font-bold'
                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-semibold'
              } hover:translate-x-1`}
            >
              <span className="transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="flex-1 inline">{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Nút Đăng xuất */}
      <div className="p-3 md:p-4 border-t border-sidebar-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-all duration-300 cursor-pointer group hover:translate-x-1 text-sm md:text-base"
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
      <aside className="hidden lg:flex w-64 xl:w-74 bg-gradient-to-br from-sidebar-bg-start to-sidebar-bg-end border-r border-sidebar-border flex-col h-screen sticky top-0 shadow-lg z-40">
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
              className="fixed top-0 left-0 z-50 w-[280px] h-screen bg-gradient-to-br from-sidebar-bg-start to-sidebar-bg-end border-r border-sidebar-border shadow-2xl lg:hidden"
            >
              {/* Nút đóng */}
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all duration-300 z-10"
              >
                <FiX size={20} className="text-gray-600" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}