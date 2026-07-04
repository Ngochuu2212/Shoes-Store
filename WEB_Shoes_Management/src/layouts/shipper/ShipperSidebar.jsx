import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiTruck, FiCheckCircle, FiClock,
  FiLogOut, FiPieChart, FiX, FiMenu
} from 'react-icons/fi'
import { logoutSuccess } from '~/redux/user/userSlice'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'
import { toast } from 'react-toastify'

const NAV_ITEMS = [
  { icon: FiPieChart, label: 'Dashboard', to: '/shipper/dashboard' },
  { icon: FiClock, label: 'Đơn chờ nhận', to: '/shipper/available-orders' },
  { icon: FiTruck, label: 'Đang giao', to: '/shipper/my-deliveries' },
  { icon: FiCheckCircle, label: 'Lịch sử', to: '/shipper/history' }
]

export const ShipperSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = async () => {
    try {
      await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/auth/logout`)
    } catch { /* ignore */ }
    dispatch(logoutSuccess())
    navigate('/login')
    toast.success('Đã đăng xuất.')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-orange-700">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
          <FiTruck className="text-orange-500" size={20} />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">Shipper</p>
          <p className="text-orange-200 text-xs">Giao hàng nhanh</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
          <Link
            key={to}
            to={to}
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(to)
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-orange-100 hover:bg-orange-700 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-orange-100 hover:bg-red-600 hover:text-white transition-all"
        >
          <FiLogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-orange-600 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-60 bg-orange-600 z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 text-white p-1 rounded-lg hover:bg-orange-700"
              >
                <FiX size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
