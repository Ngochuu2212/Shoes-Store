import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiX, FiAlertTriangle, FiBox } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này khỏi danh sách không?',
  productInfo = null,
  isLoading = false
}) => {
  const getProductImage = (info) => {
    if (!info) return null

    // Ưu tiên ảnh từ variant_image
    if (info.variant_image) {
      // Nếu variant_image là object có secure_url
      if (info.variant_image.secure_url) {
        return info.variant_image.secure_url
      }
      // Nếu variant_image là string JSON
      if (typeof info.variant_image === 'string') {
        try {
          const parsed = JSON.parse(info.variant_image)
          if (parsed && parsed.secure_url) {
            return parsed.secure_url
          }
        } catch (e) {
          // Bỏ qua
        }
      }
    }

    // Fallback sang images
    if (info.images) {
      return getImageUrl(info.images, null)
    }

    // Fallback sang product_images
    if (info.product_images) {
      return getImageUrl(info.product_images, null)
    }

    return null
  }

  const imageUrl = getProductImage(productInfo)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Lớp nền mờ bên dưới (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Khung nội dung Modal chính */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10 p-5 relative"
          >
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX size={18} />
            </button>

            {/* Tiêu đề Modal kèm Icon cảnh báo */}
            <div className="flex items-center gap-2 text-amber-500 mb-3 text-left">
              <FiAlertTriangle size={20} className="shrink-0" />
              <h3 className="font-extrabold text-gray-900 text-base">{title}</h3>
            </div>

            {/* Đoạn text mô tả hành động */}
            <p className="text-xs text-gray-500 text-left leading-normal mb-4">
              {message}
            </p>

            {/* ── KHỐI HIỂN THỊ TRỰC QUAN SẢN PHẨM SẮP BỊ XÓA ── */}
            {productInfo && (
              <div className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 mb-5 text-left items-center animate-fadeIn">
                {/* Icon hoặc hình ảnh */}
                <div className="w-14 h-14 bg-white border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={productInfo.product_name || productInfo.name}
                        className="w-full h-full object-cover"
                      />
                      {productInfo.variant_image && (
                        <div className="absolute top-0 right-0 bg-brand-primary text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-lg">
                          VAR
                        </div>
                      )}
                    </>
                  ) : (
                    <FiBox size={24} className="text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-bold text-gray-800 text-xs truncate">
                    {productInfo.product_name || productInfo.name || 'Biến thể sản phẩm'}
                  </h4>

                  {/* Hiển thị thông tin size, color, stock */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {productInfo.size && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold">
                        Size: {productInfo.size}
                      </span>
                    )}
                    {productInfo.color && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-semibold">
                        Màu: {productInfo.color}
                      </span>
                    )}
                    {productInfo.stock !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        productInfo.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        Tồn: {productInfo.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Thanh công cụ nút bấm hành động ở đáy */}
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
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={13} />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}