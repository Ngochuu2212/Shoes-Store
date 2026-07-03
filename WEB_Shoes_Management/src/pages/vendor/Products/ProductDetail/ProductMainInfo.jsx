import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiGrid, FiInfo, FiLayers, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'

export const ProductMainInfo = ({ product }) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  // 🔥 Lấy tất cả ảnh từ variants thay vì product.images
  const getVariantImages = () => {
    const images = []

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        if (variant.image) {
          try {
            let imageData = variant.image
            // Nếu là string JSON thì parse
            if (typeof variant.image === 'string') {
              imageData = JSON.parse(variant.image)
            }
            // Nếu có secure_url thì thêm vào danh sách
            if (imageData && imageData.secure_url) {
              // Kiểm tra trùng lặp
              const exists = images.some(img => img.secure_url === imageData.secure_url)
              if (!exists) {
                images.push({
                  secure_url: imageData.secure_url,
                  public_id: imageData.public_id,
                  variantId: variant.id,
                  size: variant.size,
                  color: variant.color
                })
              }
            }
          } catch (e) {
            console.error('Lỗi parse ảnh variant:', e)
          }
        }
      })
    }

    return images
  }

  // Lấy danh sách ảnh từ variants
  const variantImages = getVariantImages()

  // Nếu không có ảnh từ variants, thử lấy từ product.images (fallback)
  let fallbackImages = []
  if (variantImages.length === 0 && product.images) {
    try {
      fallbackImages = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images
    } catch (e) {
      fallbackImages = []
    }
  }

  // Sử dụng ảnh từ variants, nếu không có thì dùng fallback
  const imagesArray = variantImages.length > 0 ? variantImages : fallbackImages
  const mainImageUrl = imagesArray?.[activeImgIndex]?.secure_url || 'https://placehold.co/600x600?text=No+Image'

  // Kiểm tra có reject_reason không
  const hasRejectReason = product.reject_reason &&
    (product.status === 'rejected' || product.status === 'banned')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* THƯ VIỆN HÌNH ẢNH (Bên trái - 5 cột) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-sm overflow-hidden flex items-center justify-center aspect-square group">
          <motion.img
            key={activeImgIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Danh sách ảnh thumbnails phụ bên dưới */}
        {imagesArray?.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {imagesArray.map((img, idx) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 cursor-pointer transition-all duration-200 ${
                  activeImgIndex === idx ? 'border-brand-primary shadow-sm' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img src={img.secure_url} alt="thumbnail" className="w-full h-full object-cover" />
                {/* Hiển thị thông tin size/color nếu có */}
                {img.size && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold text-center py-0.5 truncate px-1">
                    {img.size} {img.color ? `- ${img.color}` : ''}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Thông tin số lượng ảnh */}
        <div className="text-xs text-gray-400 font-semibold text-center">
          {imagesArray.length > 0 ? (
            <span>Hiển thị {imagesArray.length} ảnh từ các biến thể</span>
          ) : (
            <span>Chưa có ảnh nào được thêm</span>
          )}
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT SẢN PHẨM (Bên phải - 7 cột) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Card thông tin hệ thống */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5 flex-1 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3">
            <FiInfo className="text-brand-primary" /> Thông số thuộc tính
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiGrid className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Danh mục sản phẩm</p>
                <p className="font-extrabold text-gray-800 mt-0.5">{product.category_name || 'Mặc định / Đang cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiLayers className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Sàn hiển thị</p>
                <p className="font-extrabold text-gray-800 mt-0.5">
                  {product.is_active === 1 ? (
                    <span className="text-green-600">Đang hiển thị mở bán</span>
                  ) : (
                    <span className="text-gray-500">Đang ngừng bán / Ẩn</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiCalendar className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Ngày đăng bán</p>
                <p className="font-bold text-gray-700 mt-0.5">{new Date(product.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiCalendar className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Cập nhật cuối</p>
                <p className="font-bold text-gray-700 mt-0.5">{new Date(product.updated_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          {/* 👇 THÊM: Hiển thị lý do từ chối/khóa */}
          {hasRejectReason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <FiAlertCircle className="text-red-500" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                    Lý do từ chối/khóa sản phẩm
                  </p>
                  <p className="text-sm font-semibold text-red-700 mt-1 leading-relaxed">
                    {product.reject_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Khối mô tả sản phẩm */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả sản phẩm chi tiết</h4>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-semibold text-gray-600 leading-relaxed min-h-[120px] whitespace-pre-line">
              {product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}