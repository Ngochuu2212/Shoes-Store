import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiImage, FiChevronLeft, FiChevronRight, FiInfo, FiHome, FiUser
} from 'react-icons/fi'
import { formatDateTime, formatRelativeTime, getImageUrl } from '~/utils/formatters'
import { vendorAppealApiService } from '~/services/vendor/vendorAppealApiService'
import { usePageTitle } from '~/hooks/usePageTitle'
import { APPEAL_STATUS } from '~/utils/constant'

export const VendorAppealDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appeal, setAppeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  usePageTitle(
    appeal ? `Đơn cứu xét #${appeal.id}` : 'Chi tiết đơn cứu xét',
    appeal ? `Xem chi tiết đơn cứu xét #${appeal.id} của cửa hàng ${appeal.store_name}` : 'Xem chi tiết đơn cứu xét'
  )

  const fetchAppealDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await vendorAppealApiService.getAppealDetail(id)
      setAppeal(res)
      setCurrentImageIndex(0)
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || ''
      setError(errorMessage)
      if (!errorMessage.includes('không tồn tại') && !errorMessage.includes('đã bị xóa')) {
        toast.error(errorMessage || 'Không thể tải thông tin đơn cứu xét')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchAppealDetail()
  }, [id])

  const getStatusConfig = (status) => {
    const config = {
      [APPEAL_STATUS.PENDING]: {
        label: 'CHỜ XỬ LÝ',
        color: 'bg-amber-100 text-amber-700',
        icon: FiClock,
        border: 'border-amber-200'
      },
      [APPEAL_STATUS.APPROVED]: {
        label: 'ĐÃ DUYỆT',
        color: 'bg-green-100 text-green-700',
        icon: FiCheckCircle,
        border: 'border-green-200'
      },
      [APPEAL_STATUS.REJECTED]: {
        label: 'ĐÃ TỪ CHỐI',
        color: 'bg-red-100 text-red-700',
        icon: FiXCircle,
        border: 'border-red-200'
      }
    }
    return config[status] || {
      label: status?.toUpperCase(),
      color: 'bg-gray-100 text-gray-700',
      icon: FiAlertCircle,
      border: 'border-gray-200'
    }
  }

  // Parse evidence images
  const evidenceImages = appeal?.evidence_images
    ? (typeof appeal.evidence_images === 'string' ? JSON.parse(appeal.evidence_images) : appeal.evidence_images)
    : []

  const nextImage = () => {
    if (evidenceImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % evidenceImages.length)
    }
  }

  const prevImage = () => {
    if (evidenceImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + evidenceImages.length) % evidenceImages.length)
    }
  }

  const currentStatus = appeal?.status ? getStatusConfig(appeal.status) : null
  const StatusIcon = currentStatus?.icon
  const logoUrl = getImageUrl(appeal?.store_logo, 'https://placehold.co/100x100?text=Store')

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
          Đang tải thông tin đơn cứu xét...
        </motion.span>
      </div>
    )
  }

  if (!appeal) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/dashboard')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Chi tiết đơn cứu xét</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">ID: #{appeal.id}</span>
              {currentStatus && (
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${currentStatus.color} border ${currentStatus.border}`}>
                  <StatusIcon size={10} />
                  {currentStatus.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Nội dung đơn */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lý do giải trình */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <FiAlertCircle className="text-red-500" size={16} />
              </div>
              Lý do giải trình
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {appeal.appeal_reason || 'Không có lý do giải trình'}
              </p>
            </div>
          </motion.div>

          {/* Ảnh bằng chứng */}
          {evidenceImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FiImage className="text-blue-500" size={16} />
                </div>
                Ảnh bằng chứng ({evidenceImages.length})
              </h3>
              <div className="relative group">
                <div className="overflow-hidden rounded-xl bg-gray-100 aspect-video flex items-center justify-center">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={getImageUrl(evidenceImages[currentImageIndex], 'https://placehold.co/600x400?text=No+Image')}
                    alt={`Evidence ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
                {evidenceImages.length > 1 && (
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
                      {evidenceImages.map((_, idx) => (
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
            </motion.div>
          )}

          {/* Ghi chú từ Manager */}
          {appeal.manager_note && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <FiInfo className="text-brand-primary" size={16} />
                </div>
                Ghi chú từ ban quản trị
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {appeal.manager_note}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Cột phải - Thông tin */}
        <div className="space-y-6">
          {/* Thông tin cửa hàng */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <FiHome className="text-brand-primary" size={16} />
              </div>
              Thông tin cửa hàng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt={appeal.store_name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                />
                <div>
                  <p className="font-extrabold text-gray-900">{appeal.store_name}</p>
                  <p className="text-[10px] text-gray-400">Mã cửa hàng: #{appeal.store_id}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Thông tin đơn */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gray-500/10 flex items-center justify-center">
                <FiInfo className="text-gray-500" size={16} />
              </div>
              Thông tin đơn
            </h3>
            <div className="space-y-3">
              <InfoRow label="ID đơn" value={`#${appeal.id}`} />
              <InfoRow label="Trạng thái" value={currentStatus?.label || 'Không xác định'} />
              <InfoRow label="Ngày gửi" value={formatDateTime(appeal.created_at)} />
              <InfoRow label="Cập nhật" value={formatDateTime(appeal.updated_at)} />
              <InfoRow
                label="Thời gian chờ"
                value={formatRelativeTime(appeal.created_at)}
                valueClassName="text-amber-600"
              />
            </div>
          </motion.div>

          {/* Hướng dẫn */}
          {appeal.status === APPEAL_STATUS.PENDING && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <FiClock className="text-amber-500 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-bold text-amber-700">Đang chờ xử lý</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Đơn của bạn đang được ban quản trị xem xét. Vui lòng chờ trong
                    vòng 24-48 giờ làm việc.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {appeal.status === APPEAL_STATUS.APPROVED && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-bold text-green-700">Đã được phê duyệt</p>
                  <p className="text-xs text-green-600 mt-1">
                    Đơn cứu xét của bạn đã được duyệt. Cửa hàng đã được khôi phục
                    hoạt động.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {appeal.status === APPEAL_STATUS.REJECTED && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <FiXCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-bold text-red-700">Đã bị từ chối</p>
                  <p className="text-xs text-red-600 mt-1">
                    Đơn cứu xét của bạn đã bị từ chối. Vui lòng kiểm tra email để
                    biết thêm chi tiết.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const InfoRow = ({ label, value, valueClassName = '' }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className={`font-semibold text-gray-800 text-right ${valueClassName}`}>{value}</span>
  </div>
)