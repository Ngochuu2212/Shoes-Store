import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiClock, FiCheckCircle, FiXCircle, FiHome, FiMapPin, FiAlignLeft, FiImage, FiAlertCircle } from 'react-icons/fi'
import { formatDate } from '~/utils/formatters'

export const StoreRegistrationStatusModal = ({ isOpen, onClose, storeData, status }) => {
  if (!isOpen || !storeData) return null

  const getStatusConfig = () => {
    switch (status) {
    case 'pending':
      return {
        icon: <FiClock size={24} className="text-amber-500" />,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: 'Đang chờ phê duyệt',
        description: 'Hồ sơ đăng ký cửa hàng của bạn đang được Ban quản trị xem xét. Vui lòng chờ trong 24-48 giờ.'
      }
    case 'approved':
      return {
        icon: <FiCheckCircle size={24} className="text-green-500" />,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Đã phê duyệt',
        description: 'Cửa hàng của bạn đã được phê duyệt và sẵn sàng hoạt động!'
      }
    case 'rejected':
      return {
        icon: <FiXCircle size={24} className="text-red-500" />,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Bị từ chối',
        description: storeData.reject_reason || 'Hồ sơ đăng ký của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và đăng ký lại.'
      }
    default:
      return {
        icon: <FiAlertCircle size={24} className="text-gray-500" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        title: 'Thông tin cửa hàng',
        description: ''
      }
    }
  }

  const statusConfig = getStatusConfig()

  // Parse logo URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null
    try {
      const parsed = typeof imageData === 'string' ? JSON.parse(imageData) : imageData
      return parsed?.secure_url || null
    } catch {
      return null
    }
  }

  const logoUrl = getImageUrl(storeData.logo)
  const bannerUrl = getImageUrl(storeData.banner)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10 relative max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${statusConfig.bgColor} flex items-center justify-center ${statusConfig.color}`}>
                  {statusConfig.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-brand-secondary text-lg">
                    {statusConfig.title}
                  </h3>
                  <p className="text-xs text-gray-500">Mã cửa hàng: #{storeData.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Status Description */}
              <div className={`p-4 rounded-2xl ${statusConfig.bgColor} border ${statusConfig.borderColor} mb-6`}>
                <p className="text-sm text-gray-700 leading-relaxed">{statusConfig.description}</p>
              </div>

              {/* Store Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin cửa hàng</h4>

                {/* Logo & Banner */}
                {(logoUrl || bannerUrl) && (
                  <div className="grid grid-cols-2 gap-4">
                    {logoUrl && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Logo</p>
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    {bannerUrl && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Banner</p>
                        <div className="w-full h-20 rounded-xl overflow-hidden border border-gray-200">
                          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tên cửa hàng */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <FiHome className="text-brand-primary mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Tên cửa hàng</p>
                    <p className="font-bold text-gray-800">{storeData.name}</p>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <FiMapPin className="text-brand-primary mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Địa chỉ kho hàng</p>
                    <p className="text-gray-700">{storeData.address}</p>
                  </div>
                </div>

                {/* Giới thiệu */}
                {storeData.bio && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <FiAlignLeft className="text-brand-primary mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Giới thiệu</p>
                      <p className="text-gray-700 whitespace-pre-line">{storeData.bio}</p>
                    </div>
                  </div>
                )}

                {/* Ngày đăng ký - Sử dụng formatDate từ formatters */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <FiClock className="text-brand-primary mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Ngày đăng ký</p>
                    <p className="text-gray-700">
                      {formatDate(storeData.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#c73652] transition-all shadow-lg shadow-brand-primary/20 cursor-pointer active:scale-95"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}