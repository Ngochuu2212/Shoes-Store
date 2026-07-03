import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiHome, FiUser, FiMail, FiPhone, FiClock,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiImage,
  FiChevronLeft, FiChevronRight, FiInfo, FiPackage
} from 'react-icons/fi'
import { formatDateTime, formatRelativeTime, getImageUrl } from '~/utils/formatters'
import { managerAppealApiService } from '~/services/manager/managerAppealApiService'
import { APPEAL_STATUS } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerAppealDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appeal, setAppeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })

  usePageTitle(
    appeal ? `Đơn cứu xét #${appeal.id} - ${appeal.store_name}` : 'Chi tiết đơn cứu xét',
    appeal ? `Xem chi tiết đơn cứu xét #${appeal.id} của cửa hàng ${appeal.store_name}` : 'Xem chi tiết đơn cứu xét cửa hàng'
  )

  const fetchAppealDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await managerAppealApiService.getAppealDetail(id)
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

  const handleProcess = async (status, reason = null) => {
    setIsLoading(true)
    try {
      const res = await managerAppealApiService.processAppeal(id, status, reason || '')
      toast.success(res.message)
      fetchAppealDetail()
      setModalConfig({ isOpen: false, type: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = () => handleProcess(APPEAL_STATUS.APPROVED)

  const handleReject = () => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      title: 'Từ chối đơn cứu xét',
      message: 'Vui lòng nhập lý do từ chối đơn cứu xét. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do từ chối...'
    })
  }

  const handleModalConfirm = async (reason) => {
    if (modalConfig.type === 'reject') {
      await handleProcess(APPEAL_STATUS.REJECTED, reason)
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

  const getStatusConfig = (status) => {
    const config = {
      [APPEAL_STATUS.PENDING]: { label: 'CHỜ XỬ LÝ', color: 'bg-amber-100 text-amber-700', icon: FiClock },
      [APPEAL_STATUS.APPROVED]: { label: 'ĐÃ DUYỆT', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
      [APPEAL_STATUS.REJECTED]: { label: 'ĐÃ TỪ CHỐI', color: 'bg-red-100 text-red-700', icon: FiXCircle }
    }
    return config[status] || { label: status?.toUpperCase(), color: 'bg-gray-100 text-gray-700', icon: FiInfo }
  }

  const currentStatus = appeal?.status ? getStatusConfig(appeal.status) : null
  const StatusIcon = currentStatus?.icon
  const isPending = appeal?.status === APPEAL_STATUS.PENDING
  const logoUrl = getImageUrl(appeal?.store_logo, 'https://placehold.co/200x200?text=Store')
  const storeName = appeal?.store_name || 'Cửa hàng không xác định'

  // Kiểm tra lỗi không tồn tại
  if (error && (error.includes('không tồn tại') || error.includes('đã bị xóa'))) {
    return (
      <DeletedContentNotice
        title="Đơn cứu xét không tồn tại"
        message="Đơn cứu xét này có thể đã bị xóa khỏi hệ thống hoặc bạn không có quyền truy cập."
        backLink="/manager/appeals"
        backText="Quay lại danh sách"
      />
    )
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
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/manager/appeals')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Chi tiết đơn cứu xét
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">ID: #{appeal.id}</span>
              {currentStatus && (
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${currentStatus.color}`}>
                  <StatusIcon size={10} />
                  {currentStatus.label}
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
          {isPending && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-green-500/20 cursor-pointer"
              >
                <FiCheckCircle size={16} /> Phê duyệt
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-red-500/20 cursor-pointer"
              >
                <FiXCircle size={16} /> Từ chối
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Thông tin đơn cứu xét */}
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

          {/* Ghi chú của Manager */}
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

        {/* Cột phải - Thông tin cửa hàng */}
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                  />
                </motion.div>
                <div>
                  <p className="font-extrabold text-gray-900">{storeName}</p>
                  <p className="text-[10px] text-gray-400">Mã cửa hàng: #{appeal.store_id}</p>
                </div>
              </div>
              <InfoRow label="Trạng thái cửa hàng" value={
                appeal.store_current_status === 1 ? (
                  <span className="text-green-600 font-bold">Đang hoạt động</span>
                ) : (
                  <span className="text-red-600 font-bold">Đã khóa</span>
                )
              } />
              {appeal.store_address && (
                <InfoRow label="Địa chỉ" value={appeal.store_address} />
              )}
              {appeal.store_bio && (
                <InfoRow label="Giới thiệu" value={appeal.store_bio} />
              )}
              <InfoRow label="Đường dẫn" value={
                <Link to={`/manager/stores/${appeal.store_id}`} className="text-brand-primary hover:underline inline-flex items-center gap-1 group">
                  Xem chi tiết cửa hàng
                  <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" size={12} />
                </Link>
              } />
            </div>
          </motion.div>

          {/* Thông tin chủ sở hữu */}
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
              Thông tin chủ sở hữu
            </h3>
            <div className="space-y-3">
              <InfoRow label="Họ tên" value={appeal.owner_name} />
              <InfoRow label="Email" value={appeal.owner_email} />
              {appeal.owner_phone && (
                <InfoRow label="SĐT" value={appeal.owner_phone} />
              )}
              <InfoRow label="Ngày tạo" value={formatDateTime(appeal.created_at)} />
              <InfoRow label="Cập nhật" value={formatDateTime(appeal.updated_at)} />
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
              <InfoRow label="ID đơn" value={`#${appeal.id}`} />
              <InfoRow label="Trạng thái" value={currentStatus?.label || 'Không xác định'} />
              {appeal.manager_note && (
                <InfoRow label="Ghi chú" value={appeal.manager_note} />
              )}
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

const InfoRow = ({ label, value }) => (
  <motion.div
    whileHover={{ x: 3 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
  >
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="font-semibold text-gray-800 text-right break-words max-w-[200px]">{value}</span>
  </motion.div>
)