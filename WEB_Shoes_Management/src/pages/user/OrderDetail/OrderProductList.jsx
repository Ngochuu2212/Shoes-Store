import { formatPrice, getImageUrl } from '~/utils/formatters'
import { FiClock, FiTag, FiAlertTriangle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const OrderProductList = ({ order = {} }) => {
  const { store_name, store_logo, created_at, applied_voucher, cancel_reason, items = [] } = order

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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
      {/* Khối Header Cửa hàng */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-3">
          <img
            src={store_logo?.secure_url}
            alt={store_name}
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
          />
          <span className="font-bold text-gray-800">{store_name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <FiClock size={14} />
          <span>{new Date(created_at).toLocaleString('vi-VN')}</span>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-4">
        {items.map(item => {
          const imageUrl = getItemImage(item)
          return (
            <div key={item.item_id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0 transition-all duration-300">
              <Link to={`/product/${item.slug}`} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shrink-0 relative">
                <img
                  src={imageUrl}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-pointer"
                />
                {item.variant_image && (
                  <div className="absolute top-0 right-0 bg-brand-primary text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-lg">
                    VAR
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <Link to={`/product/${item.slug}`} className="font-bold text-sm text-gray-800 hover:text-brand-primary transition-colors duration-300 cursor-pointer">
                  {item.product_name}
                </Link>
                <p className="text-xs text-gray-500 mt-1">Size: {item.size} | Màu: {item.color}</p>
                <p className="text-sm font-bold text-brand-primary mt-1">{formatPrice(item.price)} <span className="text-gray-400 font-normal">x {item.quantity}</span></p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer chứa Voucher và Cancel Reason (Chỉ render khi có dữ liệu) */}
      {(applied_voucher || cancel_reason) && (
        <div className="mt-6 pt-4 border-t border-gray-50 space-y-3">
          {applied_voucher && (
            <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-2 rounded-lg w-fit">
              <FiTag size={14} />
              <span>Voucher áp dụng: {applied_voucher}</span>
            </div>
          )}

          {cancel_reason && (
            <div className="flex items-start gap-2 text-red-600 text-xs font-bold bg-red-50 px-3 py-2 rounded-lg">
              <FiAlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>Lý do hủy: {cancel_reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}