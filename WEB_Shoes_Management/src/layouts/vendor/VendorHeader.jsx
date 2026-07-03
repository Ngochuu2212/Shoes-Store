import { useState, useEffect, useRef } from 'react'
import { FiBell, FiUser, FiLogOut, FiShoppingBag, FiChevronDown, FiMenu } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'
import { motion } from 'framer-motion'
import { getImageUrl } from '~/utils/formatters'
import { logoutSuccess } from '~/redux/user/userSlice'
import { NotificationModal } from '~/components/common/notification/NotificationModal'
import { notificationApiService } from '~/services/notification/notificationApiService'
import { ROLE_ID, DEV_API_URL } from '~/utils/constant'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export const VendorHeader = ({ isBanned = false, onMenuToggle = () => {} }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const socketRef = useRef(null)

  // Kết nối Socket để nhận thông báo real-time
  useEffect(() => {
    const socket = io(DEV_API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      // console.log('Socket connected for notifications')
    })

    socket.on('connect_error', (error) => {
      // console.error('Socket connection error:', error.message)
    })

    // Lắng nghe thông báo mới
    socket.on('new_notification', (notification) => {
      setUnreadNotificationCount(prev => prev + 1)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 1000)

      toast.info(notification.title, {
        position: 'top-right',
        autoClose: 5000,
        onClick: () => {
          setIsNotificationOpen(true)
        }
      })

      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }))
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [])

  // Lấy số lượng thông báo chưa đọc ban đầu
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApiService.getUnreadCount()
      setUnreadNotificationCount(res.count || 0)
    } catch (error) {
      console.error('Lỗi lấy số thông báo chưa đọc:', error)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
  }, [])

  const getPageTitle = () => {
    if (location.pathname === '/vendor') return 'Tổng quan kinh doanh'
    if (location.pathname.includes('/vendor/dashboard')) return 'Tổng quan kinh doanh'
    if (location.pathname.includes('/vendor/products')) return 'Quản lý kho hàng'
    if (location.pathname.includes('/vendor/orders')) return 'Quản lý đơn hàng'
    if (location.pathname.includes('/vendor/promotions')) return 'Chiến dịch khuyến mãi'
    if (location.pathname.includes('/vendor/reviews')) return 'Đánh giá từ khách hàng'
    if (location.pathname.includes('/vendor/payouts')) return 'Tài chính & Rút tiền'
    if (location.pathname.includes('/vendor/profile-account')) return 'Tài khoản cá nhân'
    if (location.pathname.includes('/vendor/profile-store')) return 'Thông tin cửa hàng'
    if (location.pathname.includes('/vendor/chat')) return 'Tin nhắn hỗ trợ'
    if (location.pathname.includes('/vendor/notifications')) return 'Tất cả thông báo'
    return 'Kênh Người Bán'
  }

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  const handleOpenNotification = () => {
    setIsNotificationOpen(true)
  }

  return (
    <>
      <header className="h-16 md:h-20 bg-gradient-to-r from-header-bg-start to-header-bg-end border-b border-header-border flex items-center justify-between px-3 md:px-6 lg:px-8 sticky top-0 z-30 shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Nút menu mobile */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <FiMenu size={22} />
          </button>

          <div className="w-1.5 h-6 md:w-2 md:h-8 bg-brand-primary rounded-full transition-all duration-300 hover:scale-y-110 hover:shadow-[0_0_20px_rgba(233,69,96,0.3)]"></div>
          <h1 className="text-sm md:text-lg lg:text-xl font-extrabold text-white tracking-tight transition-all duration-300 hover:translate-x-1 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
            {getPageTitle()}
          </h1>
          {isBanned && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 md:px-3 py-0.5 md:py-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold rounded-full shadow-md animate-pulse"
            >
              ĐÃ KHÓA
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {/* Nút thông báo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={handleOpenNotification}
                animate={isShaking ? {
                  rotate: [0, -10, 10, -10, 10, 0],
                  transition: { duration: 0.5, ease: 'easeInOut' }
                } : {}}
                className="relative p-1.5 md:p-2 text-white/80 hover:text-brand-primary transition-all duration-300 hover:bg-white/10 rounded-full cursor-pointer hover:scale-110 hover:rotate-12"
              >
                <FiBell size={18} className="md:size-[22px]" />
                {unreadNotificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-white text-[7px] md:text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </motion.span>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white text-xs">
              {unreadNotificationCount > 0
                ? `Bạn có ${unreadNotificationCount} thông báo chưa đọc`
                : 'Không có thông báo mới'}
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 md:h-8 bg-white/20 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                <img
                  src={getImageUrl(user?.avatar, 'https://placehold.co/100x100?text=User')}
                  alt="avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/30 shadow-sm group-hover:border-brand-primary group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(233,69,96,0.3)]"
                />
                <div className="flex flex-col items-start hidden md:flex">
                  <span className="text-[10px] md:text-[11px] text-white/60 font-medium group-hover:text-white/90 transition-all duration-300">
                    Xin chào,
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs md:text-sm font-bold text-white group-hover:text-brand-primary transition-all duration-300 truncate max-w-[80px] lg:max-w-none">
                      {user?.fullname || 'Người dùng'}
                    </span>
                    <FiChevronDown
                      size={12} className="md:size-[14px] text-white/60 group-hover:text-brand-primary transition-all duration-300 group-hover:rotate-180"
                    />
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 md:w-56 mt-2 rounded-2xl shadow-lg border-slate-100 p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-slate-800 leading-none truncate">{user?.fullname || 'Người dùng'}</p>
                  <p className="text-xs text-slate-500 leading-none truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-100 my-2" />

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-slate-50 py-2 md:py-2.5 transition-all duration-300 hover:translate-x-1">
                <Link to="/vendor/profile-account" className="flex items-center gap-2 text-sm md:text-base">
                  <FiUser size={14} className="md:size-[16px] text-slate-500 transition-all duration-300 group-hover:text-brand-primary" />
                  <span className="font-semibold text-slate-700">Tài khoản cá nhân</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-slate-50 py-2 md:py-2.5 transition-all duration-300 hover:translate-x-1">
                <Link to="/vendor/profile-store" className="flex items-center gap-2 text-sm md:text-base">
                  <FiShoppingBag size={14} className="md:size-[16px] text-slate-500 transition-all duration-300 group-hover:text-brand-primary" />
                  <span className="font-semibold text-slate-700">Thông tin cửa hàng</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-slate-50 py-2 md:py-2.5 transition-all duration-300 hover:translate-x-1">
                <Link to="/vendor/notifications" className="flex items-center gap-2 text-sm md:text-base">
                  <FiBell size={14} className="md:size-[16px] text-slate-500 transition-all duration-300 group-hover:text-brand-primary" />
                  <span className="font-semibold text-slate-700">Tất cả thông báo</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 my-2" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-xl hover:bg-red-50 text-red-500 py-2 md:py-2.5 focus:bg-red-50 focus:text-red-600 transition-all duration-300 hover:translate-x-1"
              >
                <div className="flex items-center gap-2 font-bold text-sm md:text-base">
                  <FiLogOut size={14} className="md:size-[16px] transition-all duration-300 group-hover:scale-110" />
                  <span>Đăng xuất</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userRole={ROLE_ID.VENDOR}
        onUnreadCountChange={setUnreadNotificationCount}
      />
    </>
  )
}