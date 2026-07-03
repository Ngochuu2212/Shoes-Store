import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBell, FiX, FiCheckCircle, FiExternalLink, FiMoreHorizontal
} from 'react-icons/fi'
import { formatRelativeTime } from '~/utils/formatters'
import { notificationApiService } from '~/services/notification/notificationApiService'
import { ROLE_ID } from '~/utils/constant'
import { Link, useNavigate } from 'react-router-dom'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import {
  getIconByType,
  parseContent,
  getLinkByType,
  getDetailItems
} from '~/utils/notificationHelpers'

export const NotificationModal = ({ isOpen, onClose, userRole, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const res = await notificationApiService.getNotifications(pageNum, 20)

      const unread = res.filter(n => !n.is_read).length
      setUnreadCount(unread)

      if (onUnreadCountChange) {
        onUnreadCountChange(unread)
      }

      if (append) {
        setNotifications(prev => [...prev, ...res])
      } else {
        setNotifications(res)
      }

      setHasMore(res.length === 20)
    } catch (error) {
      console.error('Lỗi tải thông báo:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false)
    }
  }, [isOpen])

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApiService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)

      if (onUnreadCountChange) {
        onUnreadCountChange(0)
      }
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }

  // Đánh dấu đã đọc một thông báo
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApiService.markAsRead(notificationId)
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      const newUnreadCount = unreadCount - 1
      setUnreadCount(newUnreadCount)
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnreadCount)
      }
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loadingMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchNotifications(nextPage, true)
    }
  }, [hasMore, loadingMore, page])

  // Xử lý chuyển sang trang xem tất cả
  const handleViewAll = () => {
    onClose()
    if (userRole === ROLE_ID.VENDOR) {
      navigate('/vendor/notifications')
    } else if (userRole === ROLE_ID.MANAGER) {
      navigate('/manager/notifications')
    } else if (userRole === ROLE_ID.ADMIN) {
      navigate('/admin/notifications')
    } else {
      navigate('/notifications')
    }
  }

  // Render thông tin chi tiết dựa trên nội dung JSON - Sử dụng getDetailItems từ helper
  const renderDetailInfo = (contentData) => {
    const detailItems = getDetailItems(contentData)
    if (detailItems.length === 0) return null

    return (
      <div className="mt-2 space-y-1.5">
        {detailItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <item.icon size={10} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">
              <span className="font-medium text-gray-600">{item.label}:</span> {item.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const modalVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <FiBell className="text-brand-primary" size={18} />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-brand-secondary tracking-tight">Thông báo</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Cập nhật hoạt động hệ thống</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                      >
                        Đánh dấu đã đọc
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Đánh dấu tất cả đã đọc</TooltipContent>
                  </Tooltip>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Đang tải thông báo...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiBell size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Chưa có thông báo nào</p>
                  <p className="text-xs text-gray-400">Khi có hoạt động mới sẽ hiển thị tại đây</p>
                </div>
              ) : (
                <>
                  {notifications.map((notif) => {
                    const { icon: Icon, color, bg } = getIconByType(notif.type)
                    const contentData = parseContent(notif.content)
                    const isUnread = !notif.is_read
                    const link = getLinkByType(notif, userRole)
                    const imageUrl = contentData.image

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-gray-50/50 transition-all duration-200 ${isUnread ? 'bg-brand-primary/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`shrink-0 w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                            <Icon size={16} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-base font-bold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notif.title}
                              </h4>
                              <div className="flex items-center gap-1">
                                <span className="text-[12px] text-gray-400 whitespace-nowrap">
                                  {formatRelativeTime(notif.created_at)}
                                </span>

                                {/* Dropdown menu cho từng thông báo */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                                      <FiMoreHorizontal size={14} />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100">
                                    {isUnread && (
                                      <DropdownMenuItem
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        className="cursor-pointer text-xs font-semibold py-2 gap-2"
                                      >
                                        <FiCheckCircle size={12} />
                                        Đánh dấu đã đọc
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={handleViewAll}
                                      className="cursor-pointer text-xs font-semibold py-2 gap-2"
                                    >
                                      <FiExternalLink size={12} />
                                      Xem tất cả
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Nội dung chính */}
                            <p className="text-xs text-gray-600 mt-1">
                              {contentData.message}
                            </p>

                            {/* Hình ảnh đính kèm (nếu có) */}
                            {imageUrl && imageUrl !== '' && (
                              <div className="mt-2">
                                <img
                                  src={imageUrl}
                                  alt="Thumbnail"
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                />
                              </div>
                            )}

                            {renderDetailInfo(contentData)}

                            {/* Link xem chi tiết */}
                            {link && (
                              <Link
                                to={link}
                                className="inline-block mt-2 text-[12px] font-semibold text-brand-primary hover:underline"
                                onClick={onClose}
                              >
                                Xem chi tiết
                              </Link>
                            )}

                            {/* Trạng thái đã đọc */}
                            {!isUnread && (
                              <div className="flex items-center gap-1 mt-2 font-bold">
                                <FiCheckCircle size={10} className="text-green-400" />
                                <span className="text-[10px] text-green-500">Đã đọc</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer với nút xem tất cả */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  Chỉ hiển thị thông báo trong 30 ngày gần nhất
                </p>
                <button
                  onClick={handleViewAll}
                  className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
                >
                  Xem tất cả
                  <FiExternalLink size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}