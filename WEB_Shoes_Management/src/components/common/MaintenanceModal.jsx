import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX, FiClock, FiTool } from 'react-icons/fi'

export const MaintenanceModal = ({ isOpen, message, onClose, onLogout }) => {
  if (!isOpen) return null

  const handleClose = () => {
    if (onLogout) {
      onLogout()
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                <FiTool className="text-white" size={32} />
              </div>
              <h2 className="text-xl font-black text-white">Hệ thống đang bảo trì</h2>
              <p className="text-sm text-white/80 mt-1">Chúng tôi đang nâng cấp hệ thống</p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <FiClock className="text-amber-500 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Thời gian bảo trì</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    Hệ thống đang được nâng cấp để phục vụ bạn tốt hơn.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {message || 'Hệ thống đang được nâng cấp định kỳ, vui lòng quay lại sau ít phút.'}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <FiAlertTriangle size={12} className="text-amber-400" />
                <span>Xin lỗi vì sự bất tiện này. Chúng tôi sẽ trở lại sớm nhất!</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-amber-500/20"
              >
                Đã hiểu, đăng xuất
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}