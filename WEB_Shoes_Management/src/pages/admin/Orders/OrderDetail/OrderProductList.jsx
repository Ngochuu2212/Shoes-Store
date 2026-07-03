import { motion } from 'framer-motion'
import { FiShoppingBag, FiImage, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useState } from 'react'
import { formatPrice } from '~/utils/formatters'

export const OrderProductList = ({ order, delay = 0.35 }) => {
  const [expandedVariants, setExpandedVariants] = useState({})

  const getProductImage = (item) => {
    // Ưu tiên 1: variant_image (ảnh của biến thể đã chọn)
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
        } catch (e) {}
      }
    }

    // Ưu tiên 2: product_images
    if (item.product_images) {
      if (Array.isArray(item.product_images) && item.product_images.length > 0) {
        const firstImage = item.product_images[0]
        if (firstImage && firstImage.secure_url) {
          return firstImage.secure_url
        }
      }
      if (typeof item.product_images === 'string') {
        try {
          const parsed = JSON.parse(item.product_images)
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].secure_url) {
            return parsed[0].secure_url
          }
        } catch (e) {}
      }
    }

    return null
  }

  const getVariantImage = (variant) => {
    if (!variant || !variant.image) return null
    if (variant.image.secure_url) return variant.image.secure_url
    if (typeof variant.image === 'string') {
      try {
        const parsed = JSON.parse(variant.image)
        return parsed?.secure_url || null
      } catch (e) {
        return null
      }
    }
    return null
  }

  const toggleVariants = (itemId) => {
    setExpandedVariants(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiShoppingBag className="text-emerald-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Chi tiết sản phẩm</p>
          <p className="text-xs text-gray-500">{order.items?.length || 0} sản phẩm</p>
        </div>
      </div>

      <div className="space-y-3">
        {order.items?.map((item, idx) => {
          const productImage = getProductImage(item)
          const hasVariantImage = !!(item.variant_image && item.variant_image.secure_url)
          const hasAllVariants = item.all_variants && item.all_variants.length > 0
          const isExpanded = expandedVariants[item.item_id] || false

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 + 0.4 }}
              className="bg-gray-50/50 rounded-xl border border-gray-100 transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50/80 transition-colors duration-200">
                {/* Ảnh sản phẩm */}
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0 relative">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FiImage size={20} className="text-gray-300" />
                    </div>
                  )}
                  {hasVariantImage && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                      VAR
                    </div>
                  )}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.product_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Size:</span> {item.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Màu:</span>
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: item.color?.toLowerCase() || '#ccc' }}
                      />
                      {item.color}
                    </span>
                    {hasVariantImage && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Có ảnh phân loại
                      </span>
                    )}
                  </div>
                </div>

                {/* Giá tiền */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600">{formatPrice(item.price)}</p>
                  <p className="text-xs text-gray-400">SL: {item.quantity}</p>
                  <p className="text-xs font-semibold text-gray-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>

              {hasAllVariants && (
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => toggleVariants(item.item_id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100/50 transition-colors duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <FiImage size={14} />
                      {isExpanded ? 'Ẩn' : 'Xem'} tất cả biến thể ({item.all_variants.length})
                    </span>
                    {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pb-3 space-y-2"
                    >
                      {item.all_variants.map((variant, vIdx) => {
                        const variantImageUrl = getVariantImage(variant)
                        const isSelectedVariant = variant.id === item.variant_id

                        return (
                          <div
                            key={vIdx}
                            className={`flex items-center gap-3 p-2 rounded-lg border ${
                              isSelectedVariant
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-white/50 border-gray-100'
                            }`}
                          >
                            {/* Ảnh variant */}
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                              {variantImageUrl ? (
                                <img
                                  src={variantImageUrl}
                                  alt={`${variant.color} - ${variant.size}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                  <FiImage size={12} className="text-gray-300" />
                                </div>
                              )}
                            </div>

                            {/* Thông tin variant */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-gray-700">Size: {variant.size}</span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1 text-gray-700">
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full border border-gray-200"
                                    style={{ backgroundColor: variant.color?.toLowerCase() || '#ccc' }}
                                  />
                                  {variant.color}
                                </span>
                                {isSelectedVariant && (
                                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    Đã chọn
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tồn kho */}
                            <div className="text-right text-xs">
                              <span className={`font-semibold ${variant.stock > 0 ? 'text-gray-600' : 'text-red-500'}`}>
                                {variant.stock} đôi
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Tổng kết sản phẩm */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-gray-500">Tổng số lượng: <span className="font-bold text-gray-700">{totalQuantity}</span></p>
          <p className="text-sm text-gray-500">Tổng tiền: <span className="font-bold text-emerald-600">{formatPrice(order.total_amount)}</span></p>
        </div>
      </div>
    </motion.div>
  )
}