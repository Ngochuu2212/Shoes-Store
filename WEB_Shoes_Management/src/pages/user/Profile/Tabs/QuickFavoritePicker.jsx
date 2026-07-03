import { FiCheck, FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react'

export const QuickFavoritePicker = ({
  product,
  variants = [],
  uniqueSizes = [],
  uniqueColors = [],
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  onClose,
  onSubmit
}) => {
  // State local để quản lý selection trong picker
  const [localSize, setLocalSize] = useState(selectedSize)
  const [localColor, setLocalColor] = useState(selectedColor)

  // Đồng bộ với props khi mở picker
  useEffect(() => {
    setLocalSize(selectedSize)
    setLocalColor(selectedColor)
  }, [selectedSize, selectedColor])

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

  // Lấy tên màu không có dấu ngoặc để hiển thị
  const getColorName = (color) => {
    const match = color.match(/^([^(]+)/)
    return match ? match[1].trim() : color
  }

  // Lấy danh sách size có stock cho màu đã chọn
  const getAvailableSizesForColor = (color) => {
    if (!color) return []
    return variants
      .filter(v => v.color === color && v.stock > 0)
      .map(v => v.size)
      .filter((size, index, self) => self.indexOf(size) === index)
  }

  // Kiểm tra màu có thể chọn
  const canSelectColor = (color) => {
    return variants.some(v => v.color === color && v.stock > 0)
  }

  // Xử lý chọn màu
  const handleColorClick = (color) => {
    // Cập nhật state local ngay lập tức
    setLocalColor(color)
    // Gọi callback lên parent
    setSelectedColor(color)

    // Lấy danh sách size có stock với màu này
    const availableSizes = getAvailableSizesForColor(color)

    if (availableSizes.length > 0) {
      const firstSize = availableSizes[0]
      // Cập nhật state local ngay lập tức
      setLocalSize(firstSize)
      // Gọi callback lên parent
      setSelectedSize(firstSize)
    } else {
      setLocalSize(null)
      setSelectedSize(null)
    }
  }

  // Xử lý chọn size
  const handleSizeClick = (size) => {
    // Cập nhật state local ngay lập tức
    setLocalSize(size)
    // Gọi callback lên parent
    setSelectedSize(size)

    // Nếu chưa có màu, tự động chọn màu đầu tiên có stock với size này
    if (!localColor) {
      const firstColor = variants.find(v => v.size === size && v.stock > 0)
      if (firstColor) {
        setLocalColor(firstColor.color)
        setSelectedColor(firstColor.color)
      }
    }
  }

  // Xử lý submit
  const handleSubmit = () => {
    if (localSize && localColor) {
      onSubmit(product)
    }
  }

  // Lấy danh sách size hiển thị
  const displayedSizes = localColor
    ? getAvailableSizesForColor(localColor)
    : uniqueSizes

  return (
    <div className="absolute inset-y-0 right-0 left-24 sm:left-28 bg-white/95 z-10 px-4 py-2 flex items-center justify-between animate-slideLeft border-l border-gray-100 shadow-xl">
      <div className="flex-1 space-y-2 text-left pr-4">
        {variants.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Sản phẩm chưa có thông tin Size/Màu.</p>
        ) : (
          <>
            {/* Lựa chọn Màu sắc */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 min-w-[50px]">Màu sắc:</span>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueColors.map(color => {
                    const isDisabled = !canSelectColor(color)
                    const isSelected = localColor === color
                    const bgColor = getColorDisplay(color)
                    const displayName = getColorName(color)

                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleColorClick(color)}
                        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 transition-all duration-200 text-[11px] font-medium
                          ${isSelected
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                        : isDisabled
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-gray-400 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: bgColor }}
                        />
                        <span>{displayName}</span>
                        {isSelected && <FiCheck size={10} className="text-brand-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lựa chọn Kích cỡ */}
            {uniqueSizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 min-w-[50px]">Kích cỡ:</span>
                <div className="flex flex-wrap gap-1">
                  {uniqueSizes.map(size => {
                    const isAvailable = displayedSizes.includes(size)
                    const isSelected = localSize === size

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleSizeClick(size)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-all ${
                          !isAvailable
                            ? 'bg-gray-100 border-gray-200 text-gray-400/80 line-through opacity-60 cursor-not-allowed select-none'
                            : isSelected
                              ? 'border-brand-primary bg-brand-primary text-white shadow-sm cursor-pointer'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-brand-bg cursor-pointer'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {localColor && displayedSizes.length === 0 && (
              <p className="text-xs text-red-500 italic">
                Màu này hiện không có size nào còn hàng
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={variants.length === 0 || !localSize || !localColor}
          className="bg-brand-primary hover:bg-[#c73652] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          <FiCheck size={12} /> Thêm
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
        >
          <FiX size={12} /> Hủy
        </button>
      </div>
    </div>
  )
}