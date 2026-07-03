import { FiStar, FiUser } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { motion, AnimatePresence } from 'framer-motion'
import { Pagination } from '~/components/common/Pagination'

export const StoreReview = ({ reviews = [], pagination, onPageChange }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px]">
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FiStar size={48} className="text-gray-200 mb-3 animate-pulse" />
          <p className="font-bold text-sm text-gray-700">Chưa có đánh giá nào cho cửa hàng này.</p>
          <p className="text-xs text-gray-400 mt-1">Trở thành người đầu tiên mua sắm và đóng góp ý kiến cho shop nhé!</p>
        </div>
      ) : (
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pagination?.page || 1}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              variants={containerVariants}
              className="space-y-6"
            >
              {reviews.map((review, idx) => {
                const avatarUrl = getImageUrl(review.user_avatar, null)

                return (
                  <motion.div
                    variants={itemVariants}
                    key={review.id || idx}
                    className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0 group"
                  >
                    <div className="relative shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={review.user_name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-100 transition-transform duration-300 group-hover:scale-105 bg-gray-50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm">
                          <FiUser size={20} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <h4 className="font-bold text-gray-800 text-sm tracking-tight">{review.user_name}</h4>
                        <span className="text-gray-400 text-[10px] uppercase tracking-wide font-medium bg-gray-50 px-2 py-0.5 rounded whitespace-nowrap">
                          {new Date(review.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 text-yellow-400 mt-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={13}
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-200'}
                          />
                        ))}
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed text-justify pr-2 break-words">
                        {review.comment}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 flex justify-center border-t border-gray-100 pt-6"
            >
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}