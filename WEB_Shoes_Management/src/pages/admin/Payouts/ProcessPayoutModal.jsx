import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiXCircle, FiSend } from 'react-icons/fi'
import { PAYOUT_STATUS } from '~/utils/constant'

export const ProcessPayoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  payout,
  isLoading
}) => {
  const [selectedAction, setSelectedAction] = useState('')
  const [adminNote, setAdminNote] = useState('')

  if (!isOpen || !payout) return null

  const handleConfirm = () => {
    if (!selectedAction) {
      return
    }
    onConfirm(selectedAction, adminNote)
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
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900">Xử lý yêu cầu rút tiền</h3>
                <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase">Thông tin yêu cầu</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-gray-800">
                      Cửa hàng: <span className="font-bold text-emerald-600">{payout.store_name}</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Số tiền: <span className="font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(payout.amount)}đ</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Ngân hàng: <span className="font-bold text-gray-700">{payout.bank_name}</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Số tài khoản: <span className="font-bold text-gray-700">{payout.account_number}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                    Lựa chọn xử lý <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedAction(PAYOUT_STATUS.APPROVED)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedAction === PAYOUT_STATUS.APPROVED
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'
                      }`}
                    >
                      <FiCheckCircle size={24} className={`mx-auto mb-2 ${
                        selectedAction === PAYOUT_STATUS.APPROVED ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <p className="font-bold text-sm text-gray-700">Duyệt</p>
                      <p className="text-[10px] text-gray-400">Chấp nhận yêu cầu</p>
                    </button>
                    <button
                      onClick={() => setSelectedAction(PAYOUT_STATUS.REJECTED)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedAction === PAYOUT_STATUS.REJECTED
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:bg-red-50/30'
                      }`}
                    >
                      <FiXCircle size={24} className={`mx-auto mb-2 ${
                        selectedAction === PAYOUT_STATUS.REJECTED ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <p className="font-bold text-sm text-gray-700">Từ chối</p>
                      <p className="text-[10px] text-gray-400">Từ chối yêu cầu</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                    Ghi chú (không bắt buộc)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={selectedAction === PAYOUT_STATUS.APPROVED
                      ? 'Nhập mã giao dịch hoặc ghi chú chuyển khoản...'
                      : 'Nhập lý do từ chối...'
                    }
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="cursor-pointer flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedAction || isLoading}
                  className={`cursor-pointer flex-1 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAction === PAYOUT_STATUS.APPROVED
                      ? 'bg-green-500 hover:bg-green-600'
                      : selectedAction === PAYOUT_STATUS.REJECTED
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-400'
                  }`}
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