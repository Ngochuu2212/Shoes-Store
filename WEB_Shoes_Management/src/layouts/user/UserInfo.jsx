import { useState, useEffect, useRef } from 'react'
import { Avatar } from '~/components/common/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '~/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

import { FiChevronDown, FiMenu, FiX, FiShoppingCart, FiUser, FiPackage, FiLogOut, FiBell } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'
import { clearCart } from '~/redux/user/cartSlice'
import { authService } from '~/services/auth/authService'
import { toast } from 'react-toastify'
import { getImageUrl } from '~/utils/formatters'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { NotificationModal } from '~/components/common/notification/NotificationModal'
import { notificationApiService } from '~/services/notification/notificationApiService'
import { ROLE_ID, DEV_API_URL } from '~/utils/constant'

// Hàm lấy chữ cái đầu và cuối của tên
const getInitials = (fullname) => {
  if (!fullname) return '?'

  const words = fullname.trim().split(' ')
  if (words.length === 0) return '?'
  if (words.length === 1) {
    // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
    return fullname.substring(0, 2).toUpperCase()
  }
  // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
  const first = words[0].charAt(0)
  const last = words[words.length - 1].charAt(0)
  return (first + last).toUpperCase()
}

const UserAvatar = ({ user, className = '' }) => {
  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : null
  const fullname = user?.fullname || 'User'
  const initials = getInitials(fullname)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Avatar"
        className={`w-full h-full object-cover ${className}`}
      />
    )
  }

  // Nếu không có avatar, hiển thị chữ cái đầu và cuối
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-bold text-sm ${className}`}>
      {initials}
    </div>
  )
}

export const UserInfo = ({ user, mobileMenuOpen, setMobileMenuOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const socketRef = useRef(null)

  const cartCount = useSelector((state) => state.cart.cartCount)

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
      console.log('Socket connected for notifications')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

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

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logoutSuccess())
      dispatch(clearCart())
      toast.success('Đăng xuất tài khoản thành công!')
      navigate('/')
    } catch (error) {
      dispatch(logoutSuccess())
    }
  }

  const handleOpenNotification = () => {
    setIsNotificationOpen(true)
  }

  const handleUnreadCountChange = (count) => {
    setUnreadNotificationCount(count)
  }

  return (
    <div className="flex items-center gap-4 md:gap-6 shrink-0">

      {/* Icon thông báo */}
      {user && (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={handleOpenNotification}
              animate={isShaking ? {
                rotate: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5, ease: 'easeInOut' }
              } : {}}
              className="relative text-gray-700 hover:text-brand-primary transition-all duration-300 p-1.5 rounded-full hover:bg-gray-50 group/noti cursor-pointer flex items-center justify-center"
            >
              <FiBell size={22} className="transition-transform duration-300 group-hover/noti:scale-105" />
              {unreadNotificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white shadow-sm ring-1 ring-red-500/10"
                >
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </motion.span>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{unreadNotificationCount > 0
              ? `Bạn có ${unreadNotificationCount} thông báo chưa đọc`
              : 'Không có thông báo mới'}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Khối Giỏ Hàng */}
      {user && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-brand-primary transition-all duration-300 p-1.5 rounded-full hover:bg-gray-50 group/cart cursor-pointer flex items-center justify-center"
            >
              <FiShoppingCart size={22} className="transition-transform duration-300 group-hover/cart:scale-105" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white shadow-sm ring-1 ring-brand-primary/10 animate-fadeIn">
                  {cartCount}
                </span>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Giỏ hàng</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Khối Thông Tin User / Dropdown Menu */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group outline-none">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden transition-all duration-300 ease-out group-hover:border-brand-primary shrink-0">
                <Avatar
                  user={user}
                  size="w-full h-full"
                  textSize="text-xs"
                  rounded="rounded-full"
                />
              </div>
              <div className="text-base hidden lg:block">
                <p className="text-gray-400 text-[11px] leading-none">Xin chào,</p>
                <p className="font-bold text-gray-800 transition-colors duration-200 group-hover:text-brand-primary">{user.fullname}</p>
              </div>
              <FiChevronDown size={14} className="text-gray-400 hidden lg:block transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2">
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-base cursor-pointer flex items-center gap-2.5 py-2 font-medium text-gray-700 focus:text-brand-primary focus:bg-[#e94560]/5 transition-colors">
                <Link to="/profile" className="flex items-center gap-2.5 w-full">
                  <FiUser size={16} className="text-gray-400 group-focus:text-brand-primary" />
                  <span>Tài khoản</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-base cursor-pointer flex items-center gap-2.5 py-2 font-medium text-gray-700 focus:text-brand-primary focus:bg-[#e94560]/5 transition-colors">
                <Link to="/orders" className="flex items-center gap-2.5 w-full">
                  <FiPackage size={16} className="text-gray-400 group-focus:text-brand-primary" />
                  <span>Đơn hàng</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-base cursor-pointer flex items-center gap-2.5 py-2 font-medium text-gray-700 focus:text-brand-primary focus:bg-[#e94560]/5 transition-colors">
                <Link to="/notifications" className="flex items-center gap-2.5 w-full">
                  <FiBell size={16} className="text-gray-400 group-focus:text-brand-primary" />
                  <span>Tất cả thông báo</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-100" />

              <DropdownMenuItem
                className="text-base cursor-pointer flex items-center gap-2.5 py-2 font-semibold text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                <FiLogOut size={16} />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="items-center gap-2 hidden sm:flex">
          <Link to="/login" className="text-base font-semibold text-gray-700 px-5 py-2.5 rounded-full border border-gray-200 transition-all hover:border-brand-primary hover:text-brand-primary">Đăng nhập</Link>
          <Link to="/register" className="text-base font-semibold text-white px-5 py-2.5 rounded-full bg-brand-primary transition-all hover:bg-[#c73652]">Đăng ký</Link>
        </div>
      )}

      <button className="md:hidden text-gray-700 hover:text-brand-primary cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userRole={ROLE_ID.USER}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </div>
  )
}