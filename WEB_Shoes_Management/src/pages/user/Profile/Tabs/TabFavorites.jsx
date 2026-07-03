import { useState, useEffect } from 'react'
import { FiHeart, FiHome, FiPlus, FiShoppingCart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { formatPrice, formatSold } from '~/utils/formatters'
import { cartApiService } from '~/services/user/cartService'
import { incrementCartCount } from '~/redux/user/cartSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import { QuickFavoritePicker } from './QuickFavoritePicker'

export const TabFavorites = ({ loading, favoriteProducts, onRemoveFavoriteItem }) => {
  const dispatch = useDispatch()

  const [activePickerProductId, setActivePickerProductId] = useState(null)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [productImages, setProductImages] = useState({})

  const getColorDisplay = (color) => {
    const colorMap = {
      'Đỏ': '#FF0000', 'Red': '#FF0000',
      'Xanh Dương': '#0066FF', 'Blue': '#0066FF',
      'Xanh Lá': '#00CC66', 'Green': '#00CC66',
      'Đen': '#000000', 'Black': '#000000',
      'Trắng': '#FFFFFF', 'White': '#FFFFFF',
      'Vàng': '#FFD700', 'Yellow': '#FFD700',
      'Tím': '#800080', 'Purple': '#800080',
      'Hồng': '#FF69B4', 'Pink': '#FF69B4',
      'Cam': '#FF8C00', 'Orange': '#FF8C00',
      'Xám': '#808080', 'Gray': '#808080',
      'Nâu': '#8B4513', 'Brown': '#8B4513'
    }
    const match = color.match(/\(([^)]+)\)/)
    if (match) {
      const colorName = match[1].trim()
      return colorMap[colorName] || color.toLowerCase()
    }
    return colorMap[color] || color.toLowerCase()
  }

  const getImageByColor = (product, color) => {
    if (!color || !product.variants) return null
    const variant = product.variants.find(v => v.color === color && v.image)
    if (variant) {
      try {
        let imageData = variant.image
        if (typeof variant.image === 'string') imageData = JSON.parse(variant.image)
        if (imageData?.secure_url) return imageData.secure_url
      } catch (e) {
        return null
      }
    }
    return null
  }

  const getDefaultImage = (product) => {
    if (product.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.image) {
          try {
            let imageData = variant.image
            if (typeof variant.image === 'string') imageData = JSON.parse(variant.image)
            if (imageData?.secure_url) return imageData.secure_url
          } catch (e) { continue }
        }
      }
    }
    if (product.images) {
      try {
        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        const imgArray = Array.isArray(parsed) ? parsed : [parsed]
        return imgArray[0]?.secure_url || 'https://via.placeholder.com/120'
      } catch {
        return 'https://via.placeholder.com/120'
      }
    }
    return 'https://via.placeholder.com/120'
  }

  const getDefaultColor = (product) => {
    if (product.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.image && variant.color) {
          try {
            let imageData = variant.image
            if (typeof variant.image === 'string') imageData = JSON.parse(variant.image)
            if (imageData?.secure_url) return variant.color
          } catch (e) { continue }
        }
      }
    }
    return null
  }

  useEffect(() => {
    const initialImages = {}
    favoriteProducts.forEach(product => {
      const defaultColor = getDefaultColor(product)
      if (defaultColor) {
        const image = getImageByColor(product, defaultColor)
        initialImages[product.id] = image || getDefaultImage(product)
      } else {
        initialImages[product.id] = getDefaultImage(product)
      }
    })
    setProductImages(initialImages)
  }, [favoriteProducts])

  const getSelected = (productId) => selectedVariants[productId] || { size: null, color: null }

  const setSelected = (productId, patch) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { ...getSelected(productId), ...patch }
    }))
  }

  const handleColorSelect = (product, color) => {
    const image = getImageByColor(product, color)
    if (image) {
      setProductImages(prev => ({ ...prev, [product.id]: image }))
    }
  }

  const handleOpenPicker = (product) => {
    const variants = product.variants || []
    const firstAvailable = variants.find(v => v.stock > 0)

    setActivePickerProductId(product.id)

    if (firstAvailable) {
      setSelected(product.id, { size: firstAvailable.size, color: firstAvailable.color })
      handleColorSelect(product, firstAvailable.color)
    } else {
      setSelected(product.id, { size: null, color: null })
    }
  }

  const handleAddToCartSubmit = async (product) => {
    const { size: selectedSize, color: selectedColor } = getSelected(product.id)
    const variants = product.variants || []
    const matchedVariant = variants.find(v => v.size === selectedSize && v.color === selectedColor)

    if (!matchedVariant || matchedVariant.stock <= 0) {
      toast.error('Biến thể bạn chọn hiện đã hết hàng trong hệ thống!')
      return
    }

    try {
      const response = await cartApiService.addToCart(matchedVariant.id, 1)
      if (response) {
        toast.success(response.message || `Đã thêm ${product.name} vào giỏ hàng!`)
        dispatch(incrementCartCount(1))
        setActivePickerProductId(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng!')
    }
  }

  if (loading && favoriteProducts.length === 0) {
    return <div className="text-center py-10 text-gray-400 italic animate-fadeIn">Đang tải danh sách giày yêu thích...</div>
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="pt-8 w-full animate-fadeIn">
        <h3 className="text-base font-extrabold text-brand-secondary border-l-4 border-brand-secondary pl-3 mb-6">Sản phẩm yêu thích của tôi</h3>
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FiHeart size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
          <Link to="/products" className="text-sm text-brand-primary font-bold hover:underline mt-2 inline-block">Khám phá cửa hàng ngay</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 space-y-6 w-full animate-fadeIn">
      <h3 className="text-base font-extrabold text-brand-secondary border-l-4 border-brand-secondary pl-3 flex items-center gap-2">
        <FiHeart className="shrink-0 text-brand-secondary" size={18}/>
        <span>Sản phẩm yêu thích của tôi</span>
      </h3>

      <div className="flex flex-col gap-4">
        {favoriteProducts.map((product) => {
          const rating = Math.round(parseFloat(product.rating_avg || 0))
          const variants = product.variants || []
          const currentImage = productImages[product.id] || getDefaultImage(product)

          const uniqueSizes = [...new Set(variants.map(v => v.size))]
          const uniqueColors = [...new Set(variants.map(v => v.color))]

          const colorsWithImage = uniqueColors.filter(color =>
            getImageByColor(product, color) !== null && variants.some(v => v.color === color && v.stock > 0)
          )
          const colorsWithStock = uniqueColors.filter(color =>
            variants.some(v => v.color === color && v.stock > 0)
          )
          const sizesWithStock = uniqueSizes.filter(size =>
            variants.some(v => v.size === size && v.stock > 0)
          )

          const isPickerOpen = activePickerProductId === product.id

          const { size: selectedSize, color: selectedColor } = getSelected(product.id)

          return (
            <div
              key={product.id}
              className="group bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center transition-all duration-300 hover:shadow-bold hover:-translate-y-0.5 relative overflow-hidden"
            >
              {/* Ảnh sản phẩm */}
              <Link to={`/product/${product.slug}`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 shrink-0 cursor-pointer relative">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {colorsWithImage.length > 1 && (
                  <div className="absolute top-0 right-0 bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                    {colorsWithImage.length}
                  </div>
                )}
              </Link>

              {/* Thông tin sản phẩm */}
              <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1 text-left">
                <Link
                  to={`/product/${product.slug}`}
                  className="font-bold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-1 hover:text-brand-primary transition-colors cursor-pointer block"
                >
                  {product.name}
                </Link>

                {/* Tên cửa hàng */}
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium">
                  <FiHome size={12} className="text-brand-secondary shrink-0" />
                  <span className="truncate">{product.store_name}</span>
                </div>

                {/* Rating và Đã bán - Responsive */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-400 pt-0.5">
                  {/* ⭐ Rating - luôn hiển thị */}
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                    <span className="text-gray-600 font-semibold ml-0.5 sm:ml-1">{parseFloat(product.rating_avg).toFixed(1)}</span>
                  </div>

                  {/* Dấu | - ẩn trên mobile */}
                  <span className="hidden xs:inline text-gray-300">|</span>

                  {/* Đã bán - Ẩn trên mobile, hiện từ tablet trở lên */}
                  <span className="hidden xs:inline">
                    Đã bán {formatSold(product.sold)}
                  </span>
                </div>
              </div>

              {/* Giá và nút hành động */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0 pt-0.5 min-w-[70px] sm:min-w-[100px]">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {/* Nút thêm vào giỏ */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleOpenPicker(product)}
                        className="text-brand-primary hover:bg-[#e94560]/10 p-1 sm:p-1.5 rounded-full transition-all cursor-pointer group/cart flex items-center justify-center gap-0.5"
                      >
                        <FiPlus size={12} className="font-bold" />
                        <FiShoppingCart size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Thêm vào giỏ hàng</p></TooltipContent>
                  </Tooltip>

                  {/* Nút bỏ thích */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onRemoveFavoriteItem(product.id)}
                        className="text-red-500 hover:text-red-600 p-1 sm:p-1.5 rounded-full hover:bg-red-50 transition-all cursor-pointer group/btn"
                      >
                        <FiHeart size={14} fill="currentColor" className="transition-transform duration-200 group-hover/btn:scale-110" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Bỏ thích</p></TooltipContent>
                  </Tooltip>
                </div>

                {/* Giá */}
                <p className="font-extrabold text-sm sm:text-base md:text-lg text-brand-secondary tracking-tight">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Picker - giữ nguyên */}
              {isPickerOpen && (
                <QuickFavoritePicker
                  product={product}
                  variants={variants}
                  uniqueSizes={sizesWithStock}
                  uniqueColors={colorsWithStock}
                  selectedSize={selectedSize}
                  setSelectedSize={(size) => {
                    setSelectedVariants(prev => {
                      const current = prev[product.id] || { size: null, color: null }
                      return {
                        ...prev,
                        [product.id]: {
                          ...current,
                          size: size
                        }
                      }
                    })
                  }}
                  selectedColor={selectedColor}
                  setSelectedColor={(color) => {
                    setSelectedVariants(prev => {
                      const current = prev[product.id] || { size: null, color: null }
                      return {
                        ...prev,
                        [product.id]: {
                          ...current,
                          color: color
                        }
                      }
                    })
                    handleColorSelect(product, color)
                  }}
                  onClose={() => {
                    setActivePickerProductId(null)
                    setSelectedVariants(prev => {
                      const current = prev[product.id] || { size: null, color: null }
                      return {
                        ...prev,
                        [product.id]: { size: null, color: null }
                      }
                    })
                  }}
                  onSubmit={handleAddToCartSubmit}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}