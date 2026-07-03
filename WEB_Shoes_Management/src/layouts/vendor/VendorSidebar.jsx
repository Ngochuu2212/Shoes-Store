import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPieChart, FiBox, FiHeart, FiShoppingCart,
  FiTag, FiStar, FiCreditCard, FiLogOut, FiChevronDown, FiList,
  FiMessageCircle, FiAlertCircle, FiMenu, FiX
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'
import { chatApiService } from '~/services/chat/chatApiService'

export const VendorSidebar = ({ isBanned = false, isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const currentUser = useSelector((state) => state.user.userInfo)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  // Lấy tổng số tin nhắn chưa đọc từ API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return

    try {
      const conversations = await chatApiService.getConversationsList()
      const totalUnread = conversations.reduce((total, conv) => {
        return total + (conv.unread_count || 0)
      }, 0)

      setUnreadCount(prev => {
        if (prev !== totalUnread) {
          console.log(`Cập nhật badge: ${prev} -> ${totalUnread}`)
        }
        return totalUnread
      })
    } catch (error) {
      console.error('Lỗi lấy số tin nhắn chưa đọc:', error)
    }
  }, [isAuthenticated, currentUser])

  // Lấy số lượng chưa đọc khi component mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, currentUser, fetchUnreadCount])

  // Lắng nghe sự kiện real-time từ chat
  useEffect(() => {
    const handleNewChatMessage = () => {
      fetchUnreadCount()
    }

    window.addEventListener('newChatMessage', handleNewChatMessage)

    return () => {
      window.removeEventListener('newChatMessage', handleNewChatMessage)
    }
  }, [fetchUnreadCount])

  // Lắng nghe sự kiện đã đọc tin nhắn
  useEffect(() => {
    const handleMessagesRead = () => {
      fetchUnreadCount()
    }

    window.addEventListener('messagesRead', handleMessagesRead)

    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead)
    }
  }, [fetchUnreadCount])

  // Cập nhật badge khi focus lại tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab được focus, cập nhật badge...')
        fetchUnreadCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUnreadCount])

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: <FiPieChart size={20} />, exact: true },
    {
      name: 'Quản lý sản phẩm',
      icon: <FiBox size={20} />,
      isSubmenu: true,
      isOpen: isProductMenuOpen,
      setIsOpen: setIsProductMenuOpen,
      children: [
        { name: 'Danh sách sản phẩm', path: '/vendor/products', icon: <FiList size={16} /> },
        { name: 'Sản phẩm yêu thích', path: '/vendor/favorites', icon: <FiHeart size={16} /> }
      ]
    },
    { name: 'Quản lý đơn hàng', path: '/vendor/orders', icon: <FiShoppingCart size={20} /> },
    { name: 'Chương trình Khuyến mãi', path: '/vendor/promotions', icon: <FiTag size={20} /> },
    { name: 'Quản lý Đánh giá', path: '/vendor/reviews', icon: <FiStar size={20} /> },
    { name: 'Tài chính & Rút tiền', path: '/vendor/payouts', icon: <FiCreditCard size={20} /> },
    {
      name: 'Tin nhắn',
      path: '/vendor/chat',
      icon: <FiMessageCircle size={20} />,
      badge: unreadCount
    }
  ]

  const checkIsActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  // Nội dung sidebar
  const sidebarContent = (
    <>
      {/* Logo Kênh Người Bán */}
      <div className="h-16 md:h-20 flex items-center px-3 md:px-5 border-b border-sidebar-border shrink-0">
        <Link to="/vendor/dashboard" className="flex items-center gap-2 md:gap-2.5 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md group-hover:scale-105 transition-all duration-300">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-extrabold text-gray-800 tracking-tight leading-tight group-hover:text-brand-secondary transition-all duration-300">
              ShoesStore
            </span>
            <span className="text-[8px] md:text-[10px] font-bold text-brand-primary tracking-widest uppercase">
              Kênh Người Bán
            </span>
          </div>
        </Link>
      </div>

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto py-4 md:py-6 px-2 md:px-4 space-y-1 custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.isSubmenu) {
            return (
              <div key={index} className="flex flex-col">
                <button
                  onClick={() => item.setIsOpen(!item.isOpen)}
                  className={`cursor-pointer w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base ${
                    item.children.some(child => checkIsActive(child.path))
                      ? 'bg-sidebar-item-active text-brand-primary font-bold'
                      : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-semibold'
                  } hover:translate-x-1 group`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="transition-all duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: item.isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <FiChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {item.isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1 mt-1 ml-2 md:ml-4 pl-2 md:pl-4 border-l-2 border-sidebar-border">
                        {item.children.map((child, cIdx) => {
                          const isChildActive = checkIsActive(child.path, child.exact)
                          return (
                            <Link
                              key={cIdx}
                              to={child.path}
                              onClick={onMobileClose}
                              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-all duration-300 text-xs md:text-sm group ${
                                isChildActive
                                  ? 'bg-sidebar-item-active text-brand-primary font-bold'
                                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-medium'
                              } hover:translate-x-1`}
                            >
                              {child.icon && (
                                <span className="transition-all duration-300 group-hover:scale-110">
                                  {child.icon}
                                </span>
                              )}
                              <span>{child.name}</span>
                              {isChildActive && (
                                <div className="ml-auto w-1 h-4 bg-brand-primary rounded-full"></div>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          const isActive = checkIsActive(item.path, item.exact)
          return (
            <Link
              key={index}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base group ${
                isActive
                  ? 'bg-sidebar-item-active text-brand-primary font-bold'
                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-semibold'
              } hover:translate-x-1`}
            >
              <span className="transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="flex-1">{item.name}</span>

              {item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Nút Đăng xuất ở đáy */}
      <div className="p-3 md:p-4 border-t border-sidebar-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 text-red-500 hover:bg-red-50 hover:text-sidebar-text-hover rounded-xl font-bold transition-all duration-300 cursor-pointer group hover:translate-x-1 text-sm md:text-base"
        >
          <FiLogOut size={18} className="transition-all duration-300 group-hover:scale-110" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  )

  // Mobile Sidebar (Overlay)
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