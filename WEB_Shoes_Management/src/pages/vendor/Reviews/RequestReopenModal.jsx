import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiX, FiInfo } from 'react-icons/fi'

export const RequestReopenModal = ({ isOpen, onClose, onConfirm, reviewCount = 1, isLoading = false }) => {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-blue-50/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="text-blue-600" size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Yêu cầu mở lại đánh giá</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {reviewCount === 1 ? 'Đánh giá này' : `${reviewCount} đánh giá`} đang bị ẩn
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <FiInfo className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-700 font-medium">
                  Yêu cầu của bạn sẽ được gửi đến Ban quản trị để xem xét. Nếu được chấp thuận, đánh giá sẽ được hiển thị lại.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                  <FiCheckCircle size={12} className="text-blue-600" />
                  Giải trình / Lý do xin mở lại (không bắt buộc)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="VD: Chúng tôi đã liên hệ và xử lý thỏa đáng với khách hàng, mong Ban quản trị xem xét..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-[10px] text-gray-400">* Cung cấp giải trình sẽ tăng khả năng được chấp thuận</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 justify-end p-5 border-t border-gray-100 bg-gray-50/30">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle size={13} />
                )}
                <span>Gửi yêu cầu</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}