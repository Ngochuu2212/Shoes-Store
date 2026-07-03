import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiUser, FiPackage, FiHome, FiStar, FiInfo,
  FiClock, FiMail, FiAlertCircle, FiCheckCircle, FiXCircle,
  FiImage, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { formatDateTime, formatRelativeTime } from '~/utils/formatters'
import { managerReviewApiService } from '~/services/manager/managerReviewApiService'
import { REVIEW_TYPES } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerReviewDetailPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || REVIEW_TYPES.PRODUCT

  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })

  const getReviewTitle = () => {
    const typeLabel = type === REVIEW_TYPES.PRODUCT ? 'Sản phẩm' : 'Cửa hàng'
    return `Chi tiết đánh giá ${typeLabel} #${id}`
  }

  usePageTitle(
    getReviewTitle(),
    `Xem chi tiết đánh giá ${type === REVIEW_TYPES.PRODUCT ? 'sản phẩm' : 'cửa hàng'}`
  )

  const fetchReviewDetail = async () => {
    try {
      setLoading(true)
      const res = await managerReviewApiService.getReviewDetail(id, type)
      setReview(res)
      setCurrentImageIndex(0)
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin đánh giá')
      navigate('/manager/reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchReviewDetail()
  }, [id, type])

  const handleResolve = async (action, reason = null) => {
    setIsLoading(true)
    try {
      const res = await managerReviewApiService.resolveReviewsBulk([id], type, action)
      toast.success(res.message)
      fetchReviewDetail()
      setModalConfig({ isOpen: false, type: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = () => handleResolve('approved')

  const handleBan = () => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      title: 'Xác nhận ẩn đánh giá',
      message: 'Bạn có chắc chắn muốn ẩn đánh giá này? Hành động này sẽ khiến đánh giá không còn hiển thị công khai.',
      placeholder: 'Nhập ghi chú (nếu có)...'
    })
  }

  const handleModalConfirm = async (reason) => {
    await handleResolve('banned', reason)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={18}
            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  // Lấy danh sách ảnh từ review
  const reviewImages = review?.review_images && Array.isArray(review.review_images) && review.review_images.length > 0
    ? review.review_images
    : []

  const productImages = review?.product_images && Array.isArray(review.product_images) && review.product_images.length > 0
    ? review.product_images
    : []

  const nextImage = () => {
    if (reviewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % reviewImages.length)
    }
  }

  const prevImage = () => {
    if (reviewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + reviewImages.length) % reviewImages.length)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải thông tin đánh giá...
        </motion.span>
      </div>
    )
  }

  if (!review) return null

  const isProductReview = type === REVIEW_TYPES.PRODUCT
  const userAvatar = review.user_avatar?.secure_url || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(review.user_name || 'User')}`
  const storeLogo = review.store_logo?.secure_url || 'https://placehold.co/200x200?text=Store'
  const productImage = productImages.length > 0 ? productImages[0]?.secure_url : 'https://placehold.co/200x200?text=Product'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/manager/reviews')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Chi tiết đánh giá {isProductReview ? 'sản phẩm' : 'cửa hàng'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">ID: #{review.review_id}</span>
              {review.is_active === 1 ? (
                <span className="bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  ĐANG HIỂN THỊ
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  ĐÃ ẨN
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApprove}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-green-500/20 cursor-pointer"
          >
            <FiCheckCircle size={16} /> Bác đơn - Mở lại đánh giá
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBan}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <FiXCircle size={16} /> Đồng ý - Ẩn đánh giá
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Thông tin đánh giá */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nội dung đánh giá */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <FiStar className="text-amber-500" size={16} />
              </div>
              Nội dung đánh giá
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    <img
                      src={userAvatar}
                      alt={review.user_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-brand-primary/20"
                    />
                  </motion.div>
                  <div>
                    <p className="font-extrabold text-gray-900">{review.user_name}</p>
                    <p className="text-[10px] text-gray-400">ID: #{review.user_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{formatRelativeTime(review.created_at)}</span>
                </div>
              </div>
              <div className="flex justify-center py-2">
                {renderStars(review.rating)}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-300">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.comment || 'Không có nội dung đánh giá'}
                </p>
              </div>

              {/* Hình ảnh đính kèm trong review */}
              {reviewImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiImage size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">Hình ảnh đính kèm ({reviewImages.length})</span>
                  </div>
                  <div className="relative group">
                    <div className="overflow-hidden rounded-xl bg-gray-100 aspect-video flex items-center justify-center">
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        src={reviewImages[currentImageIndex]?.secure_url || reviewImages[currentImageIndex]}
                        alt={`Review image ${currentImageIndex + 1}`}
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                    {reviewImages.length > 1 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronLeft size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronRight size={20} />
                        </motion.button>
                        <div className="flex justify-center gap-1.5 mt-2">
                          {reviewImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-brand-primary w-4' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Lý do tố cáo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <FiAlertCircle className="text-red-500" size={16} />
              </div>
              Lý do tố cáo
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors duration-300">
              <p className="text-red-700 font-medium">{review.report_reason || 'Không có lý do cụ thể'}</p>
            </div>
          </motion.div>
        </div>

        {/* Cột phải - Thông tin đối tượng */}
        <div className="space-y-6">
          {/* Thông tin sản phẩm / cửa hàng */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                {isProductReview ? <FiPackage className="text-brand-primary" size={16} /> : <FiHome className="text-brand-primary" size={16} />}
              </div>
              Thông tin {isProductReview ? 'sản phẩm' : 'cửa hàng'}
            </h3>
            <div className="space-y-3">
              {isProductReview ? (
                <>
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <img
                        src={productImage}
                        alt={review.product_name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />
                    </motion.div>
                    <div>
                      <p className="font-extrabold text-gray-900">{review.product_name}</p>
                      <p className="text-[10px] text-gray-400">Mã SP: #{review.product_id}</p>
                      <p className="text-[10px] text-gray-400">Slug: {review.product_slug}</p>
                    </div>
                  </div>
                  <InfoRow label="Đường dẫn" value={
                    <Link to={`/manager/products/detail/${review.product_id}`} className="text-brand-primary hover:underline inline-flex items-center gap-1 group">
                      Xem chi tiết sản phẩm
                      <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" size={12} />
                    </Link>
                  } />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <img
                        src={storeLogo}
                        alt={review.store_name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />
                    </motion.div>
                    <div>
                      <p className="font-extrabold text-gray-900">{review.store_name}</p>
                      <p className="text-[10px] text-gray-400">Mã cửa hàng: #{review.store_id}</p>
                    </div>
                  </div>
                  <InfoRow label="Đường dẫn" value={
                    <Link to={`/manager/stores/${review.store_id}`} className="text-brand-primary hover:underline inline-flex items-center gap-1 group">
                      Xem chi tiết cửa hàng
                      <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" size={12} />
                    </Link>
                  } />
                </>
              )}
            </div>
          </motion.div>

          {/* Thông tin người dùng */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FiUser className="text-blue-500" size={16} />
              </div>
              Thông tin người dùng
            </h3>
            <div className="space-y-3">
              <InfoRow label="Họ tên" value={review.user_name} />
              <InfoRow label="Email" value={review.user_email} />
              <InfoRow label="ID người dùng" value={`#${review.user_id}`} />
              <InfoRow label="Thời gian đánh giá" value={formatDateTime(review.created_at)} />
            </div>
          </motion.div>

          {/* Thông tin bổ sung */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gray-500/10 flex items-center justify-center">
                <FiInfo className="text-gray-500" size={16} />
              </div>
              Thông tin bổ sung
            </h3>
            <div className="space-y-3">
              <InfoRow
                label="Trạng thái tố cáo"
                value={review.is_reported === 1 ? 'Đang bị tố cáo' : 'Đã xử lý'}
                valueClassName={review.is_reported === 1 ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block' : 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block'}
              />
              <InfoRow label="ID đơn hàng" value={review.order_id ? `#${review.order_id}` : 'Không có'} />
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmReasonModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
      />
    </motion.div>
  )
}

const InfoRow = ({ label, value, valueClassName = '' }) => (
  <motion.div
    whileHover={{ x: 3 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
  >
    <span className="text-gray-500 text-sm">{label}</span>
    <span className={`font-semibold text-right break-words max-w-[200px] ${valueClassName}`}>{value}</span>
  </motion.div>
)