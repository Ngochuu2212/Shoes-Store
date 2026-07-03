import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'

export const QuickVariantPicker = ({
  selectedSize,
  setSelectedSize,
  selectedColor,
  isSizeDisabled,
  onClose,
  getAvailableSizesForColor
}) => {
  // Lấy danh sách size có sẵn cho màu đang chọn
  const availableSizes = selectedColor
    ? (getAvailableSizesForColor ? getAvailableSizesForColor(selectedColor) : [])
    : []

  // Hàm lấy màu hiển thị cho dot
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

  // Nếu không có màu được chọn, hiển thị thông báo
  if (!selectedColor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 rounded-xl p-5 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-800">Chọn phân loại</p>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Vui lòng chọn màu sắc trước</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 rounded-xl p-5 flex flex-col shadow-2xl max-h-full"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header với nút đóng */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <p className="text-sm font-bold text-gray-800">
            Chọn kích cỡ
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
              style={{ backgroundColor: getColorDisplay(selectedColor) }}
            />
            <span className="text-xs font-semibold text-gray-700">{selectedColor}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
        >
          <FiX size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Danh sách size */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {availableSizes.length > 0 ? (
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Kích cỡ có sẵn
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSizes.map(size => {
                const isDisabled = isSizeDisabled(size)
                const isSelected = selectedSize === size
                return (
                  <button
                    key={size}
                    onClick={() => !isDisabled && setSelectedSize(size)}
                    disabled={isDisabled}
                    className={`cursor-pointer py-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold text-center
                      ${isSelected ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-md' :
                    isDisabled ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50' :
                      'border-gray-200 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 text-gray-700'}`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">Không có kích cỡ nào cho màu này</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}