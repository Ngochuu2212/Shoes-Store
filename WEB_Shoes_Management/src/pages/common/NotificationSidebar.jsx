import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiBell, FiCheckCircle, FiInbox } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { NotificationItem } from './NotificationItem'
import { NotificationSkeleton } from './NotificationSkeleton'
import { getRoleText } from '~/utils/notificationHelpers'

export const NotificationSidebar = ({
  notifications,
  loading,
  selectedNotification,
  unreadCount,
  hasMore,
  loadingMore,
  userRole,
  onSelectNotification,
  onMarkAllAsRead,
  onLoadMore
}) => {
  const containerRef = useRef(null)

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loadingMore) {
      onLoadMore()
    }
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full lg:w-96 bg-white/95 backdrop-blur-sm border-r border-gray-200/80 flex flex-col shadow-xl shadow-gray-200/50 relative overflow-hidden rounded-r-2xl"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      {/* Header - rounded top right */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-primary to-rose-500 flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <FiBell className="text-white" size={16} />
              </div>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Thông báo</h2>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-0.5">{getRoleText(userRole)}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onMarkAllAsRead}
                  className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-brand-primary/5 hover:bg-brand-primary/10 transition-all duration-200 whitespace-nowrap"
                >
                  <FiCheckCircle size={12} />
                  <span className="hidden xs:inline">Đánh dấu đã đọc</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Đánh dấu tất cả đã đọc</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Danh sách thông báo - scrollable */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 sm:py-20 gap-3 sm:gap-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <FiInbox size={28} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base font-semibold text-gray-500">Chưa có thông báo nào</p>
              <p className="text-xs text-gray-400 mt-1">Khi có hoạt động mới sẽ hiển thị tại đây</p>
            </div>
          </motion.div>
        ) : (
          <>
            {notifications.map((notif, index) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                isSelected={selectedNotification?.id === notif.id}
                onClick={onSelectNotification}
                index={index}
              />
            ))}
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - rounded bottom right */}
      <div className="p-2 sm:p-3 border-t border-gray-100 bg-gray-50/30 sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm rounded-br-2xl">
        <p className="text-[8px] sm:text-[9px] text-center text-gray-400 font-medium">
          Chỉ hiển thị thông báo trong 30 ngày gần nhất
        </p>
      </div>
    </motion.div>
  )
}