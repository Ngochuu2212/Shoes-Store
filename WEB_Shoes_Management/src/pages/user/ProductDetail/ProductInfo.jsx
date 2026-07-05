import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiHeart, FiMinus, FiPlus, FiShoppingCart, FiTruck, FiRefreshCcw, FiZap, FiStar } from 'react-icons/fi'
import { formatPrice, formatSold, calculateFinalPrice } from '~/utils/formatters'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addToFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { cartApiService } from '~/services/user/cartService'
import { setCartCount } from '~/redux/user/cartSlice'
import { productService } from '~/services/user/productService'
import { toast } from 'react-toastify'

// Variant dùng chung cho stagger children
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

export const ProductInfo = ({ product, onColorChangeFromGallery, onColorSelect }) => {

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const favoriteIds = useSelector((state) => state.user.favoriteIds)
  const isFavorite = favoriteIds.includes(product.id)
  const [loading, setLoading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích sản phẩm!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    if (loading) return
    setLoading(true)
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
      console.error('Lỗi khi toggle favorite tại Info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    if (!currentVariant) {
      toast.error('Vui lòng chọn màu sắc và kích cỡ!')
      return
    }
    if (quantity > currentVariant.stock) {
      toast.error(`Số lượng vượt quá số hàng có sẵn (${currentVariant.stock})!`)
      return
    }
    setIsAddingToCart(true)
    try {
      const res = await cartApiService.addToCart(currentVariant.id, quantity)
      if (res) {
        toast.success(res.message || 'Đã thêm sản phẩm vào giỏ hàng!')
        const cartData = await cartApiService.getCart()
        const totalItems = cartData.reduce((sum, item) => sum + item.cart_quantity, 0)
        dispatch(setCartCount(totalItems))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng!')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const { variants = [] } = product
  const uniqueColors = [...new Set(variants.map(v => v.color))]
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || '')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const finalPrice = calculateFinalPrice(product.price, product.discount_percentage)
  const availableSizes = variants.filter(v => v.color === selectedColor)
  const currentVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize)

  useEffect(() => {
    if (onColorChangeFromGallery && onColorChangeFromGallery !== selectedColor) {
      setSelectedColor(onColorChangeFromGallery)
    }
  }, [onColorChangeFromGallery])

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].size)
      setQuantity(1)
    }
  }, [selectedColor, variants])

  const handleQuantityChange = (type) => {
    const stock = currentVariant?.stock || 0
    if (type === 'minus' && quantity > 1) setQuantity(prev => prev - 1)
    if (type === 'plus' && quantity < stock) setQuantity(prev => prev + 1)
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    if (onColorSelect) {
      onColorSelect(color)
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Info */}
      <motion.div className="space-y-2 sm:space-y-3" variants={itemVariants}>
        <span className="inline-block bg-[#e94560]/10 text-brand-primary text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit">
          Sản phẩm nổi bật
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

        {/* Rating, Views, Sold - Responsive với TEXT vẫn giữ nguyên */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-500">
          {/* ⭐ Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`${i < Math.round(product.rating_avg || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                size={14}
              />
            ))}
            <span className="text-gray-900 font-semibold ml-0.5 sm:ml-1">{product.rating_avg}</span>
          </div>

          <span className="text-gray-300">|</span>

          {/* 👁️ Lượt xem */}
          <div className="flex items-center gap-1">
            <span>{product.view_count || 0}</span>
            <span>Lượt xem</span>
          </div>

          <span className="text-gray-300">|</span>

          {/* 📦 Đã bán */}
          <div className="flex items-center gap-1">
            <span>{formatSold(product.sold)}</span>
            <span>Đã bán</span>
          </div>

          <span className="text-gray-300">|</span>

          {/* ❤️ Yêu thích */}
          <motion.button
            className={`flex items-center gap-1 sm:gap-2 transition-colors duration-300 cursor-pointer group select-none text-xs sm:text-sm
              ${isFavorite ? 'text-brand-primary font-semibold' : 'hover:text-brand-primary'}`}
            onClick={handleToggleFavorite}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              animate={isFavorite ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FiHeart
                size={14}
                className={`transition-all duration-300 group-hover:fill-brand-primary 
                  ${isFavorite ? 'text-brand-primary fill-brand-primary' : ''}`}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </motion.span>
            <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Giá - Responsive với TEXT vẫn giữ nguyên */}
      <motion.div className="bg-gray-50 rounded-2xl p-4 sm:p-6 flex flex-col gap-2" variants={itemVariants}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary">
            {formatPrice(finalPrice)}
          </span>
          {product?.discount_percentage && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-sm sm:text-lg text-gray-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
              <span className="bg-brand-primary text-white text-[10px] sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-sm">
                -{product.discount_percentage}%
              </span>
            </div>
          )}
        </div>
        {product?.promotion_name && (
          <div className="text-xs sm:text-sm font-semibold text-brand-secondary bg-[#0f3460]/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg w-fit flex items-center gap-1 sm:gap-1.5">
            <FiZap className="text-brand-secondary" size={16} />
            <span>{product.promotion_name}</span>
          </div>
        )}
      </motion.div>

      {/* Mô tả ngắn */}
      <motion.p className="text-gray-600 text-xs sm:text-sm leading-relaxed" variants={itemVariants}>
        {product.description}
      </motion.p>

      {/* Biến thể: Màu sắc */}
      {uniqueColors.length > 0 && (
        <motion.div className="space-y-2 sm:space-y-3" variants={itemVariants}>
          <h3 className="font-bold text-xs sm:text-sm text-gray-800 uppercase">
            Màu sắc: <span className="font-normal text-gray-600 capitalize">{selectedColor}</span>
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {uniqueColors.map(color => (
              <motion.button
                key={color}
                onClick={() => handleColorSelect(color)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 rounded-lg text-[10px] sm:text-sm font-semibold transition-all duration-300 cursor-pointer
                  ${selectedColor === color ? 'border-brand-primary text-brand-primary bg-[#e94560]/5' : 'border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary'}`}
              >
                {color}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Biến thể: Kích cỡ */}
      {availableSizes.length > 0 && (
        <motion.div className="space-y-2 sm:space-y-3" variants={itemVariants}>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-gray-800 uppercase">Kích cỡ</h3>
            <span className="text-[10px] sm:text-sm font-semibold text-brand-primary hover:text-[#c73652] hover:underline transition-colors duration-300 cursor-pointer">
              Bảng quy đổi kích cỡ
            </span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {availableSizes.map(v => {
              const isOutOfStock = v.stock === 0
              return (
                <motion.button
                  key={v.size}
                  disabled={isOutOfStock}
                  onClick={() => setSelectedSize(v.size)}
                  whileHover={!isOutOfStock ? { scale: 1.06 } : {}}
                  whileTap={!isOutOfStock ? { scale: 0.94 } : {}}
                  className={`w-10 h-10 sm:w-14 sm:h-12 flex items-center justify-center border-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm
                    ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400'
                  : selectedSize === v.size ? 'border-brand-primary text-brand-primary bg-[#e94560]/5 cursor-pointer'
                    : 'border-gray-200 text-gray-700 hover:border-brand-primary hover:text-brand-primary cursor-pointer'}`}
                >
                  {v.size}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Danh mục */}
      {product?.category_name && (
        <motion.div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-1 sm:mt-2" variants={itemVariants}>
          <h3 className="font-bold text-xs sm:text-sm text-gray-800 uppercase">Danh mục</h3>
          <Link
            to={`/products?categories=${product.category_slug}`}
            className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-[10px] sm:text-sm font-semibold rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all duration-300"
          >
            {product.category_name}
          </Link>
        </motion.div>
      )}

      {/* Số lượng */}
      <motion.div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-1 sm:mt-2" variants={itemVariants}>
        <h3 className="font-bold text-xs sm:text-sm text-gray-800 uppercase">Số lượng</h3>
        <div className="flex items-center border border-gray-200 rounded-lg h-9 sm:h-11 w-24 sm:w-32">
          <motion.button
            onClick={() => handleQuantityChange('minus')}
            whileTap={{ scale: 0.85 }}
            className="flex-1 flex justify-center text-gray-500 hover:text-brand-primary transition-colors duration-300 cursor-pointer"
          >
            <FiMinus size={14} />
          </motion.button>
          <span className="flex-1 text-center font-semibold text-gray-800 border-x border-gray-200 h-full flex items-center justify-center text-sm">
            {quantity}
          </span>
          <motion.button
            onClick={() => handleQuantityChange('plus')}
            whileTap={{ scale: 0.85 }}
            className="flex-1 flex justify-center text-gray-500 hover:text-brand-primary transition-colors duration-300 cursor-pointer"
          >
            <FiPlus size={14} />
          </motion.button>
        </div>
        <span className="text-xs sm:text-sm text-gray-500">{currentVariant?.stock || 0} sản phẩm có sẵn</span>
      </motion.div>

      {/* Nút Hành Động */}
      <motion.div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4" variants={itemVariants}>
        <motion.button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !currentVariant || currentVariant.stock === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full xs:flex-1 bg-white border-2 border-brand-primary text-brand-primary font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e94560]/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <FiShoppingCart size={18} />
          {isAddingToCart ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
        </motion.button>
      </motion.div>

      {/* Info Phụ */}
      <motion.div
        className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm text-gray-600">
          <FiTruck size={16} className="text-green-500 shrink-0" />
          <span>Miễn phí vận chuyển toàn quốc</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm text-gray-600">
          <FiRefreshCcw size={16} className="text-blue-500 shrink-0" />
          <span>Đổi trả trong 30 ngày</span>
        </div>
      </motion.div>
    </motion.div>
  )
}