import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiX, FiAlertTriangle, FiTag } from 'react-icons/fi'

export const ConfirmDeleteModalPromotion = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này không?',
  itemInfo = null,
  isLoading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10 p-5 relative"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX size={18} />
            </button>

            {/* Title with icon */}
            <div className="flex items-center gap-2 text-red-500 mb-3 text-left">
              <FiAlertTriangle size={20} className="shrink-0" />
              <h3 className="font-extrabold text-gray-900 text-base">{title}</h3>
            </div>

            {/* Message */}
            <p className="text-xs text-gray-500 text-left leading-normal mb-4">
              {message}
            </p>

            {/* ── KHỐI HIỂN THỊ THÔNG TIN MỤC SẮP XÓA ── */}
            {itemInfo && (
              <div className="flex gap-3 bg-red-50/30 border border-red-100 rounded-xl p-3 mb-5 text-left items-center">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <FiTag className="text-red-500" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-gray-800 text-sm truncate">
                    {itemInfo.name}
                  </h4>
                  {itemInfo.code && (
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Mã: {itemInfo.code}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 size={13} />
                )}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}