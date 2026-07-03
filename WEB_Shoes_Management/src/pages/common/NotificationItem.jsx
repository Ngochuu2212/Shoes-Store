import { motion } from 'framer-motion'
import { FiCheckCircle } from 'react-icons/fi'
import { formatRelativeTime } from '~/utils/formatters'
import { getIconByType, parseContent } from '~/utils/notificationHelpers'

export const NotificationItem = ({ notification, isSelected, onClick, index }) => {
  const { icon: Icon, color, bg } = getIconByType(notification.type)
  const contentData = parseContent(notification.content)
  const isUnread = !notification.is_read

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={() => onClick(notification)}
      className={`
        relative p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-all duration-300
        hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent
        ${isUnread ? 'bg-gradient-to-r from-brand-primary/5 to-transparent' : ''}
        ${isSelected ? 'bg-gradient-to-r from-brand-primary/10 to-transparent border-l-4 border-l-brand-primary' : ''}
        group
        mx-0.5 sm:mx-1 my-0.5 rounded-xl
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/0 to-brand-primary/0 group-hover:from-brand-primary/5 transition-all duration-300 pointer-events-none rounded-xl" />

      <div className="flex gap-2 sm:gap-3 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md`}
        >
          <Icon size={16} className={color} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-xs sm:text-sm font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h4>
            <span className="text-[9px] sm:text-[10px] text-gray-400 whitespace-nowrap font-medium">
              {formatRelativeTime(notification.created_at)}
            </span>
          </div>
          <p className={`text-[11px] sm:text-xs mt-1 line-clamp-2 ${isUnread ? 'text-gray-600' : 'text-gray-500'}`}>
            {contentData.message}
          </p>
          <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
            {!isUnread && (
              <div className="flex items-center gap-1 font-bold">
                <FiCheckCircle size={9} className="text-green-400" />
                <span className="text-[9px] sm:text-[10px] text-green-500 font-medium">Đã đọc</span>
              </div>
            )}
            {isUnread && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[8px] sm:text-[9px] text-brand-primary font-medium">Chưa đọc</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}