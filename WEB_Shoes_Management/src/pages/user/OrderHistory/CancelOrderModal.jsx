import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { Textarea } from '~/components/ui/textarea'
import { CANCEL_REASONS } from '~/utils/constant'

export const CancelOrderModal = ({ isOpen, onClose, onConfirm, order }) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  if (!order) return null

  const handleConfirm = () => {
    let finalReason = ''
    if (selectedReason === 'Lý do khác') {
      finalReason = customReason || 'Lý do khác (không có nội dung cụ thể)'
    } else {
      finalReason = selectedReason
    }

    if (!finalReason) {
      finalReason = 'Không có lý do cụ thể'
    }

    onConfirm(order.order_id, finalReason)
    // Reset state sau khi xác nhận
    setSelectedReason('')
    setCustomReason('')
  }

  const getItemImage = (item) => {
    // Ưu tiên ảnh từ variant_image
    if (item.variant_image) {
      // Nếu variant_image là object có secure_url
      if (item.variant_image.secure_url) {
        return item.variant_image.secure_url
      }
      // Nếu variant_image là string JSON
      if (typeof item.variant_image === 'string') {
        try {
          const parsed = JSON.parse(item.variant_image)
          if (parsed && parsed.secure_url) {
            return parsed.secure_url
          }
        } catch (e) {
          // Bỏ qua
        }
      }
    }
    // Fallback sang product_images (nếu có)
    if (item.product_images) {
      return getImageUrl(item.product_images, 'https://placehold.co/100x100?text=Product')
    }
    // Fallback sang images (cũ)
    if (item.images) {
      return getImageUrl(item.images, 'https://placehold.co/100x100?text=Product')
    }
    return 'https://placehold.co/100x100?text=Product'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 relative flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-orange-500 text-lg">Hủy đơn hàng</h3>
                  <p className="text-xs text-gray-500">Mã đơn: #{order.order_id}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Danh sách sản phẩm trong đơn */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Sản phẩm trong đơn:</p>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {order.items?.map((item, idx) => {
                    const imageUrl = getItemImage(item)
                    return (
                      <div key={idx} className="flex gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-2 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm relative">
                          <img
                            src={imageUrl}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                          {item.variant_image && (
                            <div className="absolute top-0 right-0 bg-brand-primary text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-lg">
                              VAR
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-xs truncate">{item.product_name}</h4>
                          <p className="text-[10px] text-gray-400">Size: {item.size} | Màu: {item.color}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Chọn lý do */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Vui lòng chọn lý do hủy:</p>
                <div className="grid grid-cols-1 gap-2">
                  {CANCEL_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                        selectedReason === reason
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold shadow-sm'
                          : 'border-gray-100 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {reason}
                      {selectedReason === reason && <FiCheck size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ô nhập lý do khác */}
              {selectedReason === 'Lý do khác' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  <Textarea
                    placeholder="Nhập lý do cụ thể của bạn tại đây..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="rounded-xl border-gray-200 focus:ring-brand-primary min-h-[100px] text-sm"
                  />
                  <p className="text-[10px] text-gray-400">* Vui lòng nhập lý do để shop có thể cải thiện dịch vụ</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Giữ đơn hàng
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedReason || (selectedReason === 'Lý do khác' && !customReason.trim())}
                className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#c73652] transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                Xác nhận hủy
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}