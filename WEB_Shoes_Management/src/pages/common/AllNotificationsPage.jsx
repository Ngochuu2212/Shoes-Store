import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiBell } from 'react-icons/fi'
import { NotificationSidebar } from './NotificationSidebar'
import { NotificationDetail } from './NotificationDetail'
import { useNotifications } from '~/hooks/useNotifications'
import { ROLE_ID } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AllNotificationsPage = () => {
  usePageTitle(
    'Thông báo',
    'Xem tất cả thông báo của bạn trên Shoes Platform'
  )
  const user = useSelector((state) => state.user.userInfo)
  const userRole = user?.roleId
  const [showDetail, setShowDetail] = useState(false)

  const {
    notifications,
    loading,
    selectedNotification,
    hasMore,
    loadingMore,
    unreadCount,
    loadMore,
    markAllAsRead,
    selectNotification
  } = useNotifications()

  const isUser = userRole === ROLE_ID.USER

  const handleSelectNotification = (notification) => {
    selectNotification(notification)
    // Trên mobile, chuyển sang view detail
    if (window.innerWidth < 1024) {
      setShowDetail(true)
    }
  }

  const handleBackToList = () => {
    setShowDetail(false)
  }

  const isDesktop = window.innerWidth >= 1024

  return (
    <div className={`h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden ${isUser ? 'px-4' : ''}`}>
      <div className={`${isUser ? 'app-container' : ''} h-full w-full`}>
        <div className={`${isUser ? 'pt-6' : ''} flex flex-col lg:flex-row h-full w-full relative`}>

          {/* Sidebar */}
          <div className={`w-full lg:w-96 flex-shrink-0 ${showDetail ? 'hidden lg:block' : 'block'}`}>
            <NotificationSidebar
              notifications={notifications}
              loading={loading}
              selectedNotification={selectedNotification}
              unreadCount={unreadCount}
              hasMore={hasMore}
              loadingMore={loadingMore}
              userRole={userRole}
              onSelectNotification={handleSelectNotification}
              onMarkAllAsRead={markAllAsRead}
              onLoadMore={loadMore}
            />
          </div>

          {/* Detail */}
          <AnimatePresence mode="wait">
            {(isDesktop || showDetail) && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white relative"
              >
                {/* Nút quay lại trên mobile */}
                {showDetail && (
                  <button
                    onClick={handleBackToList}
                    className="cursor-pointer lg:hidden sticky top-0 z-10 flex items-center gap-2 p-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 w-full text-sm font-semibold text-gray-600 hover:text-brand-primary transition-colors"
                  >
                    <FiArrowLeft size={18} />
                    Quay lại danh sách
                  </button>
                )}
                <NotificationDetail
                  notification={selectedNotification}
                  userRole={userRole}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedNotification && !isDesktop && !showDetail && (
            <div className="flex-1 hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                  <FiBell size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold text-lg mt-4">Chọn một thông báo</p>
                <p className="text-sm text-gray-400 mt-1">Để xem nội dung chi tiết</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}