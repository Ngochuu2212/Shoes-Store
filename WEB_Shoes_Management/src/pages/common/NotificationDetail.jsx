import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiBell, FiClock, FiCheckCircle, FiStar, FiAlertCircle, FiPackage, FiHome, FiFlag, FiUser, FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { formatDateTime, getImageUrl } from '~/utils/formatters'
import { getIconByType, parseContent, getLinkByType, getDetailItems } from '~/utils/notificationHelpers'

export const NotificationDetail = ({ notification, userRole }) => {
  if (!notification) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-5 p-4"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
          <FiBell size={32} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg text-gray-500 font-semibold">Chọn một thông báo</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Để xem nội dung chi tiết</p>
        </div>
      </motion.div>
    )
  }

  const { icon: Icon, color, bg } = getIconByType(notification.type)
  const contentData = parseContent(notification.content)
  const imageUrl = contentData.image
  const link = getLinkByType(notification, userRole)
  const detailItems = getDetailItems(contentData)

  // Format thời gian chi tiết
  const formattedDate = notification.created_at ? formatDateTime(notification.created_at) : ''

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-4 sm:p-8"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-brand-primary/5 via-white to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${bg} flex items-center justify-center shadow-md`}>
                  <Icon size={24} className={color} />
                </div>
              </motion.div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {notification.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <FiClock size={11} className="text-gray-400" />
                    <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
                      {formattedDate}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                      CHƯA ĐỌC
                    </span>
                  )}
                </div>
              </div>
            </div>
            {link && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={link}
                  className="px-4 sm:px-5 py-2 bg-gradient-to-r from-brand-primary to-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-brand-primary/25 transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  Xem chi tiết
                  <FiCheckCircle size={14} />
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-8">
          {/* Nội dung chính */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {contentData.message || 'Không có nội dung chi tiết'}
            </p>
          </div>

          {/* Hình ảnh đính kèm */}
          {imageUrl && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6"
            >
              <img
                src={imageUrl}
                alt="Thumbnail"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
              />
            </motion.div>
          )}

          {/* Thông tin chi tiết */}
          {detailItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FiAlertCircle size={14} className="text-brand-primary" />
                Thông tin chi tiết:
              </h4>
              <div className="space-y-2 bg-gray-50 rounded-xl p-3 sm:p-4">
                {detailItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <item.icon size={12} className="text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 break-words">
                      <span className="font-semibold text-gray-700">{item.label}:</span>{' '}
                      <span className="break-words">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin bổ sung từ notification */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
              <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
                <span className="text-gray-400 block mb-0.5 text-[10px] sm:text-xs">ID thông báo</span>
                <span className="font-mono text-gray-600 text-[11px] sm:text-xs">#{notification.id}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
                <span className="text-gray-400 block mb-0.5 text-[10px] sm:text-xs">Loại</span>
                <span className="font-medium text-gray-600 text-[11px] sm:text-xs">{notification.type}</span>
              </div>
              {notification.reference_id && (
                <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 col-span-2">
                  <span className="text-gray-400 block mb-0.5 text-[10px] sm:text-xs">ID tham chiếu</span>
                  <span className="font-mono text-gray-600 text-[11px] sm:text-xs">#{notification.reference_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] sm:text-[11px] text-gray-400 text-center font-medium">
            Thông báo này được gửi tự động từ hệ thống Shoes Store
          </p>
        </div>
      </div>
    </motion.div>
  )
}