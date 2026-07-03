import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiFlag, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'

import { vendorReviewApiService } from '~/services/vendor/vendorReviewApiService'
import { REVIEW_TYPES } from '~/utils/constant'
import { ReportModal } from '../ReportModal'
import { RequestReopenModal } from '../RequestReopenModal'
import { ImageViewerModal } from './ImageViewerModal'
import { CustomerInfoCard } from './CustomerInfoCard'
import { ProductInfoCard } from './ProductInfoCard'
import { ReviewContentCard } from './ReviewContentCard'
import { SystemStatusCard } from './SystemStatusCard'
import { TimelineCard } from './TimelineCard'
import { ReportReasonCard } from './ReportReasonCard'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ReviewDetailPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reviewType = searchParams.get('type') || REVIEW_TYPES.PRODUCT

  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  const getReviewTitle = () => {
    if (!review) return 'Chi tiết đánh giá'
    const type = reviewType === REVIEW_TYPES.PRODUCT ? 'Sản phẩm' : 'Cửa hàng'
    return `Đánh giá ${type} #${review.id}`
  }

  usePageTitle(
    getReviewTitle(),
    review ? `Xem chi tiết đánh giá ${reviewType === REVIEW_TYPES.PRODUCT ? 'sản phẩm' : 'cửa hàng'}` : 'Xem chi tiết đánh giá'
  )

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    vendorReviewApiService.getReviewDetail(id, reviewType)
      .then(setReview)
      .catch((err) => {
        toast.error(err.message || 'Không thể tải thông tin đánh giá.')
        navigate('/vendor/reviews')
      })
      .finally(() => setLoading(false))
  }, [id, reviewType, navigate])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN')
  }

  // Hàm lấy mảng images an toàn
  const getReviewImages = (images) => {
    if (!images) return []
    if (Array.isArray(images)) return images
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    }
    return []
  }

  const handleReport = () => setIsReportModalOpen(true)

  const handleConfirmReport = async (reason) => {
    if (!reason.trim()) {
      toast.warning('Vui lòng chọn lý do báo cáo')
      return
    }

    try {
      setModalLoading(true)
      const res = await vendorReviewApiService.reportReview(id, reviewType, reason)
      toast.success(res.message)
      setIsReportModalOpen(false)
      const updated = await vendorReviewApiService.getReviewDetail(id, reviewType)
      setReview(updated)
    } catch (error) {
      toast.error(error.message || 'Gửi báo cáo thất bại')
    } finally {
      setModalLoading(false)
    }
  }

  const handleReopen = () => setIsReopenModalOpen(true)

  const handleConfirmReopen = async (reason) => {
    try {
      setModalLoading(true)
      const res = await vendorReviewApiService.requestReopenBulk([id], reviewType, reason)
      toast.success(res.message)
      setIsReopenModalOpen(false)
      const updated = await vendorReviewApiService.getReviewDetail(id, reviewType)
      setReview(updated)
    } catch (error) {
      toast.error(error.message || 'Gửi yêu cầu thất bại')
    } finally {
      setModalLoading(false)
    }
  }

  const handleImageClick = (index) => {
    setSelectedImageIndex(index)
    setIsImageViewerOpen(true)
  }

  const reviewImages = getReviewImages(review?.images)
  const canReport = review?.is_reported === 0
  const canReopen = review?.is_active === 0 && review?.is_reported === 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đánh giá...</span>
      </div>
    )
  }

  if (!review) return null

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/reviews')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
            title="Quay lại danh sách"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-brand-primary tracking-tight">
                Chi tiết đánh giá
              </h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                review.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
              }`}>
                {review.is_active ? 'Đang hiển thị' : 'Đã bị ẩn'}
              </span>
              {review.is_reported && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600">
                  Đã báo cáo
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-gray-400 mt-1">Mã đánh giá: #{review.id}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {canReport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReport}
              className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white border border-amber-200 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer"
            >
              <FiFlag size={14} /> Báo cáo vi phạm
            </motion.button>
          )}
          {canReopen && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReopen}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer"
            >
              <FiCheckCircle size={14} /> Yêu cầu mở lại
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Customer Info */}
      <CustomerInfoCard
        customer={{
          avatar: review.avatar,
          fullname: review.fullname,
          userId: review.user_id,
          orderId: review.order_id,
          rating: review.rating,
          createdAt: formatDate(review.created_at)
        }}
      />

      {/* Product Info (for product reviews) */}
      {reviewType === REVIEW_TYPES.PRODUCT && (
        <ProductInfoCard
          product={{
            id: review.product_id,
            name: review.product_name,
            product_images: review.product_images,
            variants: review.variants || []
          }}
        />
      )}

      {/* Review Content & Images */}
      <ReviewContentCard
        comment={review.comment}
        images={reviewImages}
        onImageClick={handleImageClick}
      />

      {/* Additional Info Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <SystemStatusCard
          isActive={review.is_active}
          isReported={review.is_reported}
        />
        <TimelineCard
          createdAt={review.created_at}
          updatedAt={review.updated_at}
        />
      </motion.div>

      {/* Report Reason */}
      <ReportReasonCard reason={review.report_reason} />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        images={reviewImages}
        selectedIndex={selectedImageIndex}
        onClose={() => setIsImageViewerOpen(false)}
        onIndexChange={setSelectedImageIndex}
      />

      {/* Action Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirm={handleConfirmReport}
        reviewCount={1}
        isLoading={modalLoading}
      />

      <RequestReopenModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={handleConfirmReopen}
        reviewCount={1}
        isLoading={modalLoading}
      />
    </div>
  )
}