import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { reviewService } from '~/services/user/reviewService'
import { formatReview } from '~/utils/formatters'
import { FiStar } from 'react-icons/fi'

export const ProductReview = ({ product }) => {
  const [reviewData, setReviewData] = useState({ totalReviews: 0, averageRating: 0, reviews: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.slug) return
      try {
        setLoading(true)
        const data = await reviewService.getProductReviews(product.slug)
        setReviewData(data)
      } catch (error) {
        console.error('Lỗi khi fetch đánh giá:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [product?.slug])

  const renderStars = (rating, size = 16) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300'}
        />
      ))}
    </div>
  )

  return (
    <motion.div
      className="mb-10 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mt-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Tabs defaultValue="description" className="w-full">
        <TabsList variant="line" className="w-full flex justify-start border-b border-gray-200 mb-6">
          <TabsTrigger value="description" className="text-base font-semibold px-6 py-3 cursor-pointer">
            Mô tả sản phẩm
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-base font-semibold px-6 py-3 cursor-pointer">
            Đánh giá ({formatReview(reviewData.totalReviews)})
          </TabsTrigger>
        </TabsList>

        {/* Tab Mô tả */}
        <TabsContent value="description" className="text-gray-600 leading-relaxed space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết sản phẩm</h3>
            <div className="whitespace-pre-wrap">
              {product?.description || 'Chưa có mô tả cho sản phẩm này.'}
            </div>
          </motion.div>
        </TabsContent>

        {/* Tab Đánh giá */}
        <TabsContent value="reviews">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Khách hàng đánh giá</h3>

          {/* Tổng quan */}
          <motion.div
            className="flex items-center gap-6 p-6 bg-[#e94560]/5 rounded-2xl mb-8 border border-[#e94560]/10"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-4xl font-extrabold text-brand-primary">{reviewData.averageRating}</span>
              <span className="text-sm text-gray-500 mt-1">trên 5</span>
            </div>
            <div className="space-y-1.5">
              {renderStars(reviewData.averageRating, 22)}
              <p className="text-sm text-gray-600">Dựa trên {formatReview(reviewData.totalReviews)} lượt đánh giá</p>
            </div>
          </motion.div>

          {/* Danh sách review */}
          {loading ? (
            <div className="text-center text-gray-500 py-4">Đang tải đánh giá...</div>
          ) : reviewData.reviews.length > 0 ? (
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              <AnimatePresence>
                {reviewData.reviews.map((review) => {
                  const avatarUrl = review.user_avatar?.secure_url || 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User'
                  const date = new Date(review.created_at).toLocaleDateString('vi-VN')
                  const reviewImages = typeof review.review_images === 'string'
                    ? JSON.parse(review.review_images)
                    : review.review_images

                  return (
                    <motion.div
                      key={review.review_id}
                      className="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
                      }}
                    >
                      <img
                        src={avatarUrl}
                        alt={review.user_name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User' }}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{review.user_name}</h4>
                          <span className="text-xs text-gray-400">{date}</span>
                        </div>
                        {renderStars(review.rating, 14)}
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                        {reviewImages && reviewImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {reviewImages.map((img, idx) => (
                              <motion.div
                                key={idx}
                                className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                                whileHover={{ scale: 1.06, opacity: 0.9 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              >
                                <img
                                  src={img.secure_url}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Chưa có đánh giá nào cho sản phẩm này.
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}