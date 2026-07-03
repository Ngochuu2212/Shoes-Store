import { useState, useEffect } from 'react'
import { FiShoppingCart, FiInfo, FiHeart, FiStar } from 'react-icons/fi'
import { FaEye } from 'react-icons/fa'
import { formatPrice, formatSold } from '~/utils/formatters'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addToFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { incrementCartCount } from '~/redux/user/cartSlice'
import { productService } from '~/services/user/productService'
import { cartApiService } from '~/services/user/cartService'
import { toast } from 'react-toastify'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { QuickVariantPicker } from './QuickVariantPicker'

export const ProductCard = ({ product, sortBy, onAddToCartSuccess }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const favoriteIds = useSelector((state) => state.user.favoriteIds)
  const isFavorite = favoriteIds.includes(product.id)
  const rating = Math.round(parseFloat(product?.rating_avg || 0))

  // ── STATE QUẢN LÝ KHAY CHỌN BIẾN THỂ ──
  const [showVariantPicker, setShowVariantPicker] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)

  const variants = product?.variants || []

  // Lấy ảnh từ variants theo màu sắc
  const getImageByColor = (color) => {
    if (!color) return null
    const variant = variants.find(v => v.color === color && v.image)
    if (variant) {
      try {
        let imageData = variant.image
        if (typeof variant.image === 'string') {
          imageData = JSON.parse(variant.image)
        }
        if (imageData && imageData.secure_url) {
          return imageData.secure_url
        }
      } catch (e) {
        return null
      }
    }
    return null
  }

  // Lấy ảnh đầu tiên từ variants hoặc product.images
  const getDefaultImage = () => {
    for (const variant of variants) {
      if (variant.image) {
        try {
          let imageData = variant.image
          if (typeof variant.image === 'string') {
            imageData = JSON.parse(variant.image)
          }
          if (imageData && imageData.secure_url) {
            return imageData.secure_url
          }
        } catch (e) {
          continue
        }
      }
    }
    if (product?.images) {
      try {
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        if (Array.isArray(images) && images.length > 0) {
          return images[0]?.secure_url
        }
      } catch (e) {
        return null
      }
    }
    return null
  }

  // Lấy màu đầu tiên có ảnh để focus sẵn
  const getDefaultColor = () => {
    for (const variant of variants) {
      if (variant.image && variant.color) {
        try {
          let imageData = variant.image
          if (typeof variant.image === 'string') {
            imageData = JSON.parse(variant.image)
          }
          if (imageData && imageData.secure_url) {
            return variant.color
          }
        } catch (e) {
          continue
        }
      }
    }
    return null
  }

  // Cập nhật ảnh khi chọn màu
  useEffect(() => {
    if (!selectedColor) {
      const defaultColor = getDefaultColor()
      if (defaultColor) {
        setSelectedColor(defaultColor)
      }
    }

    if (selectedColor) {
      const imageUrl = getImageByColor(selectedColor)
      if (imageUrl) {
        setCurrentImage(imageUrl)
      } else {
        setCurrentImage(getDefaultImage())
      }
    } else {
      setCurrentImage(getDefaultImage())
    }
  }, [selectedColor, variants])

  // Lọc danh sách thuộc tính gốc duy nhất
  const uniqueSizes = [...new Set(variants.map(v => v.size))]
  const uniqueColors = [...new Set(variants.map(v => v.color))]

  // Kiểm tra màu nào có ảnh
  const getColorWithImage = (color) => {
    return getImageByColor(color) !== null
  }

  const isColorDisabled = (color) => {
    if (selectedSize) {
      const match = variants.find(v => v.size === selectedSize && v.color === color)
      return !match || match.stock <= 0
    }
    return !variants.some(v => v.color === color && v.stock > 0)
  }

  const isSizeDisabled = (size) => {
    if (selectedColor) {
      const match = variants.find(v => v.color === selectedColor && v.size === size)
      return !match || match.stock <= 0
    }
    return !variants.some(v => v.size === size && v.stock > 0)
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích sản phẩm!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      const response = await productService.toggleFavorite(product.id)
      if (response) {
        toast.success(response.message)
        if (response.isFavorite) {
          dispatch(addToFavorites(product.id))
        } else {
          dispatch(removeFromFavorites(product.id))
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  // XỬ LÝ KHI BẤM NÚT "THÊM VÀO GIỎ"
  const handleAddToCartSubmit = async (e) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thực hiện thêm sản phẩm vào giỏ hàng!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    if (!showVariantPicker) {
      setShowVariantPicker(true)
      const firstAvailableVariant = variants.find(v => v.stock > 0)
      if (firstAvailableVariant) {
        setSelectedSize(firstAvailableVariant.size)
        if (!selectedColor) {
          setSelectedColor(firstAvailableVariant.color)
        }
      }
      return
    }

    const matchedVariant = variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    )

    if (!matchedVariant || matchedVariant.stock <= 0) {
      toast.error('Biến thể bạn chọn hiện đã hết hàng!')
      return
    }

    try {
      const response = await cartApiService.addToCart(matchedVariant.id, 1)
      if (response) {
        toast.success(response.message || 'Đã thêm vào giỏ hàng thành công!')
        dispatch(incrementCartCount(1))
        setShowVariantPicker(false)

        if (onAddToCartSuccess) {
          onAddToCartSuccess()
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng!')
    }
  }

  // Lấy giá hiển thị
  const hasDiscount = product?.discount_percentage && parseFloat(product.discount_percentage) > 0
  const originalPrice = product?.price || 0
  const salePrice = product?.sale_price || (hasDiscount ? originalPrice * (1 - parseFloat(product.discount_percentage) / 100) : originalPrice)

  // Lấy danh sách màu có ảnh để hiển thị dot
  const colorsWithImage = uniqueColors.filter(color => getColorWithImage(color))

  const getColorDisplay = (color) => {
    const colorMap = {
      'Đỏ': '#FF0000',
      'Red': '#FF0000',
      'Xanh Dương': '#0066FF',
      'Blue': '#0066FF',
      'Xanh Lá': '#00CC66',
      'Green': '#00CC66',
      'Đen': '#000000',
      'Black': '#000000',
      'Trắng': '#FFFFFF',
      'White': '#FFFFFF',
      'Vàng': '#FFD700',
      'Yellow': '#FFD700',
      'Tím': '#800080',
      'Purple': '#800080',
      'Hồng': '#FF69B4',
      'Pink': '#FF69B4',
      'Cam': '#FF8C00',
      'Orange': '#FF8C00',
      'Xám': '#808080',
      'Gray': '#808080',
      'Nâu': '#8B4513',
      'Brown': '#8B4513'
    }

    const match = color.match(/\(([^)]+)\)/)
    if (match) {
      const colorName = match[1].trim()
      return colorMap[colorName] || color.toLowerCase()
    }

    return colorMap[color] || color.toLowerCase()
  }

  // Lấy danh sách size có sẵn cho màu đang chọn
  const getAvailableSizesForColor = (color) => {
    if (!color) return []
    return variants
      .filter(v => v.color === color && v.stock > 0)
      .map(v => v.size)
  }

  return (
    <div className="group bg-white shadow-bold rounded-2xl p-4 transition-all duration-300 hover:shadow-bold hover:-translate-y-1 flex flex-col justify-between min-h-[410px] relative overflow-hidden">

      <div>
        {/* Khối hình ảnh */}
        <div className="relative overflow-hidden rounded-xl mb-3 bg-gray-50 h-56 w-full flex items-center justify-center">
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-brand-primary text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              -{Math.round(parseFloat(product.discount_percentage))}%
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 z-10 p-1.5 backdrop-blur-sm rounded-full ring-1 transition-all duration-300 hover:scale-110 cursor-pointer
                  ${isFavorite ? 'bg-red-500 text-white ring-red-500' : 'bg-white/80 text-brand-secondary ring-brand-secondary'}`}
              >
                <FiHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}</p></TooltipContent>
          </Tooltip>

          <Link to={`/product/${product.slug}`} className="w-full h-full">
            <img
              src={currentImage || getDefaultImage() || 'https://placehold.co/400x400/f6f9fc/a0aabf?text=No+Image'}
              alt={product?.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* ── KHAY CHỌN BIẾN THỂ TRƯỢT LÊN TRÊN KHU VỰC ẢNH ── */}
          {showVariantPicker && (
            <QuickVariantPicker
              variants={variants}
              uniqueSizes={getAvailableSizesForColor(selectedColor)}
              uniqueColors={uniqueColors}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedColor={selectedColor}
              setSelectedColor={(color) => {
                setSelectedColor(color)
                // Tự động chọn size đầu tiên của màu mới
                const availableSizes = getAvailableSizesForColor(color)
                if (availableSizes.length > 0) {
                  setSelectedSize(availableSizes[0])
                }
                const imageUrl = getImageByColor(color)
                if (imageUrl) {
                  setCurrentImage(imageUrl)
                }
              }}
              isSizeDisabled={isSizeDisabled}
              isColorDisabled={isColorDisabled}
              onClose={() => {
                setShowVariantPicker(false)
                setSelectedSize(null)
              }}
              onSubmit={handleAddToCartSubmit}
              getImageByColor={getImageByColor}
              getAvailableSizesForColor={getAvailableSizesForColor}
            />
          )}
        </div>

        {/* Dot màu sắc bên dưới ảnh */}
        {colorsWithImage.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3">
            {colorsWithImage.map((color, idx) => {
              const isActive = selectedColor === color
              const imageUrl = getImageByColor(color)
              const bgColor = getColorDisplay(color)

              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setSelectedColor(color)
                        // Tự động chọn size đầu tiên của màu mới
                        const availableSizes = getAvailableSizesForColor(color)
                        if (availableSizes.length > 0) {
                          setSelectedSize(availableSizes[0])
                        }
                        if (showVariantPicker) {
                          const availableVariant = variants.find(v => v.color === color && v.stock > 0)
                          if (availableVariant) {
                            setSelectedSize(availableVariant.size)
                          }
                        }
                      }}
                      className={`relative w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 cursor-pointer
                        ${isActive
                  ? 'border-brand-primary scale-110 shadow-lg shadow-brand-primary/30'
                  : 'border-gray-300 hover:border-gray-400'}`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {/* Badge số lượng nếu có nhiều hơn 1 variant cùng màu */}
                      {variants.filter(v => v.color === color).length > 1 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-700 text-white text-[6px] font-bold rounded-full flex items-center justify-center">
                          {variants.filter(v => v.color === color).length}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-semibold">{color}</p>
                      {imageUrl && (
                        <img src={imageUrl} alt={color} className="w-12 h-12 rounded-lg object-cover mt-1" />
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}

        {/* Khối thông tin văn bản */}
        <div className="space-y-1.5 text-left">
          <Link to={`/product/${product.slug}`} className="font-semibold text-gray-800 line-clamp-2 break-words transition-colors duration-300 hover:text-brand-primary">
            {product?.name}
          </Link>
          <p className="text-xs text-gray-500 line-clamp-3 break-words min-h-[32px]">{product?.description}</p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span>({product?.rating_avg || 0})</span>
            <span>|</span>
            {sortBy === 'views_desc' ? (
              <span className="flex items-center gap-1 text-blue-500 font-medium">
                <FaEye /> {product?.view_count || 0} lượt xem
              </span>
            ) : (
              <span>Đã bán {formatSold(product?.sold || 0)}</span>
            )}
          </div>
        </div>
      </div>

      <div>
        {/* Khối hiển thị giá */}
        <div className="flex items-center gap-2 pt-2 text-left">
          {hasDiscount ? (
            <>
              <p className="font-bold text-lg text-brand-primary">
                {formatPrice(salePrice)}
              </p>
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </p>
            </>
          ) : (
            <p className="font-bold text-lg text-gray-800">
              {formatPrice(originalPrice)}
            </p>
          )}
        </div>

        {/* Khối thanh công cụ Button */}
        <div className="flex gap-2 mt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={`/product/${product.slug}`} className="flex-1 bg-white ring ring-brand-secondary hover:bg-brand-secondary text-brand-secondary hover:text-white py-2.5 rounded-lg flex items-center justify-center transition-all duration-300">
                <FiInfo size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent><p>Chi tiết sản phẩm</p></TooltipContent>
          </Tooltip>

          <button
            onClick={handleAddToCartSubmit}
            className="flex-[2] bg-brand-primary hover:bg-[#c73652] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
          >
            <FiShoppingCart size={16} />
            {showVariantPicker && selectedSize && selectedColor ? 'Thêm ngay' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>

    </div>
  )
}