import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiBell, FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { logoutSuccess } from '~/redux/user/userSlice'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'
import { toast } from 'react-toastify'
import { useNotifications } from '~/hooks/useNotifications'

export const ShipperHeader = ({ onMobileMenuToggle, isMobileOpen }) => {
  const user = useSelector((state) => state.user.userInfo)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/auth/logout`)
    } catch { /* ignore */ }
    dispatch(logoutSuccess())
    navigate('/login')
    toast.success('Đã đăng xuất.')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        onClick={onMobileMenuToggle}
      >
        {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      <div className="hidden lg:flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 uppercase">
          Hệ thống giao hàng
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-100 bg-orange-50/50 text-orange-600 uppercase tracking-wide">
          Portal Active
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Link
          to="/shipper/notifications"
          className="relative p-2 rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
        >
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow">
              {user?.fullname?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[110px] truncate">
              {user?.fullname || 'Shipper'}
            </span>
            <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs text-gray-400">Đăng nhập với tư cách</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullname}</p>
              </div>
              <Link
                to="/shipper/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <FiUser size={15} />
                Tài khoản của tôi
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
