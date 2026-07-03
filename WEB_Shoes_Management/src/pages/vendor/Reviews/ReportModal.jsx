import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFlag, FiX, FiAlertTriangle } from 'react-icons/fi'

export const ReportModal = ({ isOpen, onClose, onConfirm, reviewCount = 1, isLoading = false }) => {
  const [reason, setReason] = useState('')

  const reportReasons = [
    'Nội dung không phù hợp, thiếu văn hóa',
    'Đánh giá sai sự thật, mang tính vu khống',
    'Quảng cáo hoặc spam trong bình luận',
    'Tiết lộ thông tin cá nhân',
    'Lý do khác'
  ]

  const handleConfirm = () => {
    if (!reason.trim()) return
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
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-amber-50/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FiFlag className="text-amber-600" size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Báo cáo vi phạm</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {reviewCount === 1 ? 'Đánh giá này' : `${reviewCount} đánh giá`} có dấu hiệu vi phạm?
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
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-amber-700 font-medium">
                  Báo cáo sẽ được gửi đến Ban quản trị để xem xét. Nếu vi phạm, đánh giá sẽ bị ẩn khỏi hệ thống.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                  <FiFlag size={12} className="text-amber-600" />
                  Lý do báo cáo <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {reportReasons.map((r, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="reportReason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 accent-amber-600"
                      />
                      <span className="text-sm font-medium text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  value={reason === 'Lý do khác' ? reason : ''}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết (nếu chọn Lý do khác)..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 mt-2"
                  rows={3}
                  disabled={reason !== 'Lý do khác'}
                />
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
                disabled={!reason.trim() || isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiFlag size={13} />
                )}
                <span>Gửi báo cáo</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}