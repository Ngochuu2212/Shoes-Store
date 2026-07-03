import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAlertTriangle, FiSend, FiCheckCircle } from 'react-icons/fi'

export const ConfirmReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder,
  isLoading,
  hideReasonInput = false,
  type = 'danger',
  required = true
}) => {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (required && !reason.trim()) {
      return
    }
    onConfirm(reason)
    setReason('')
  }

  const getIcon = () => {
    switch (type) {
    case 'success':
      return <FiCheckCircle size={20} className="text-green-500" />
    case 'warning':
      return <FiAlertTriangle size={20} className="text-amber-500" />
    case 'danger':
    default:
      return <FiAlertTriangle size={20} className="text-red-500" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
    case 'success':
      return 'bg-green-500 hover:bg-green-600'
    case 'warning':
      return 'bg-amber-500 hover:bg-amber-600'
    case 'danger':
    default:
      return 'bg-red-500 hover:bg-red-600'
    }
  }

  const getIconColor = () => {
    switch (type) {
    case 'success':
      return 'text-green-500'
    case 'warning':
      return 'text-amber-500'
    case 'danger':
    default:
      return 'text-red-500'
    }
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
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 ${getIconColor()}`}>
                  {getIcon()}
                  <h3 className="font-extrabold text-gray-900 text-base">{title}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{message}</p>

              {/* Chỉ hiển thị textarea nếu không ẩn */}
              {!hideReasonInput && (
                <>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className={`w-full rounded-xl border p-3 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 resize-none
                      ${required && !reason.trim() ? 'border-gray-200' : 'border-gray-200'}`}
                  />
                  {required && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <span className="text-red-500 font-bold">*</span>
                      Bắt buộc nhập lý do
                    </p>
                  )}
                  {!required && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <span className="text-gray-400">(không bắt buộc)</span>
                    </p>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={onClose}
                  className="cursor-pointer flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || (required && !reason.trim())}
                  className={`cursor-pointer flex-1 px-4 py-2 ${getButtonColor()} text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend size={14} />
                  )}
                  Xác nhận
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}