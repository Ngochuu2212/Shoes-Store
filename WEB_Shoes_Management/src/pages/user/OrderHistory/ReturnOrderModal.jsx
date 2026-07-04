import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiRefreshCw, FiCheck } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { Textarea } from '~/components/ui/textarea'

const RETURN_REASONS = [
  'Kích cỡ không vừa (quá rộng hoặc quá chật)',
  'Sản phẩm bị lỗi sản xuất, rách, hỏng đế',
  'Cửa hàng giao sai sản phẩm, màu sắc, hoặc kích thước',
  'Sản phẩm thực tế khác xa so với hình ảnh mô tả',
  'Nghi ngờ sản phẩm là hàng giả, kém chất lượng',
  'Tôi không còn nhu cầu mua sản phẩm này nữa',
  'Lý do khác'
]

export const ReturnOrderModal = ({ isOpen, onClose, onConfirm, order }) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  if (!order) return null

  const handleConfirm = () => {
    let finalReason = ''
    if (selectedReason === 'Lý do khác') {
      finalReason = customReason.trim()
    } else {
      finalReason = selectedReason
    }

    if (!finalReason) return

    onConfirm(order.order_id, finalReason)
    // Reset state
    setSelectedReason('')
    setCustomReason('')
  }

  const getItemImage = (item) => {
    if (item.variant_image) {
      if (item.variant_image.secure_url) {
        return item.variant_image.secure_url
      }
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
    if (item.product_images) {
      return getImageUrl(item.product_images, 'https://placehold.co/100x100?text=Product')
    }
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
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <FiRefreshCw size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-orange-600 text-lg">Yêu cầu Trả hàng</h3>
                  <p className="text-xs text-gray-500">Mã đơn hàng: #{order.order_id}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Warning note */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <div className="text-amber-600 shrink-0 mt-0.5">ℹ️</div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Lưu ý:</strong> Yêu cầu trả hàng của bạn sẽ được gửi tới cửa hàng để xem xét. Nếu được chấp nhận, Shipper sẽ liên hệ để thu hồi sản phẩm. Sau khi giao trả thành công, tiền sẽ được hoàn trả đầy đủ vào ví của bạn.
                </p>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Sản phẩm muốn hoàn trả:</p>
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-xs truncate">{item.product_name}</h4>
                          <p className="text-[10px] text-gray-400">Size: {item.size} | Màu: {item.color} | Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Chọn lý do trả hàng */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Vui lòng chọn lý do trả hàng (bắt buộc):</p>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {RETURN_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                        selectedReason === reason
                          ? 'border-orange-500 bg-orange-50/50 text-orange-600 font-bold shadow-sm'
                          : 'border-gray-100 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span>{reason}</span>
                      {selectedReason === reason && <FiCheck size={16} className="shrink-0 text-orange-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ô nhập lý do khác */}
              {selectedReason === 'Lý do khác' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  <Textarea
                    placeholder="Vui lòng nhập lý do cụ thể..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="rounded-xl border-gray-200 focus:ring-orange-500 min-h-[100px] text-sm"
                  />
                  <p className="text-[10px] text-gray-400">* Thông tin này giúp shop nắm bắt lỗi sản phẩm tốt hơn</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedReason || (selectedReason === 'Lý do khác' && !customReason.trim())}
                className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                Gửi yêu cầu trả hàng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
