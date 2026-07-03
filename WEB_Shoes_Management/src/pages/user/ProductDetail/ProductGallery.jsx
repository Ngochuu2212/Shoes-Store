import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const ProductGallery = forwardRef(({ images, productName, variants = [], onColorChange, selectedColor }, ref) => {
  // Lấy tất cả ảnh từ variants
  const getVariantImages = () => {
    const variantImages = []
    if (variants && Array.isArray(variants)) {
      variants.forEach(variant => {
        if (variant.image) {
          try {
            let imageData = variant.image
            if (typeof variant.image === 'string') {
              imageData = JSON.parse(variant.image)
            }
            if (imageData && imageData.secure_url) {
              // Kiểm tra trùng lặp
              const exists = variantImages.some(img => img.secure_url === imageData.secure_url)
              if (!exists) {
                variantImages.push({
                  secure_url: imageData.secure_url,
                  public_id: imageData.public_id,
                  color: variant.color,
                  size: variant.size,
                  variantId: variant.id
                })
              }
            }
          } catch (e) {
            console.error('Lỗi parse ảnh variant:', e)
          }
        }
      })
    }
    return variantImages
  }

  const variantImages = getVariantImages()

  // Fallback sang product.images nếu không có ảnh từ variants
  const fallbackImages = images?.length > 0 ? images : [
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh' }
  ]

  const displayImages = variantImages.length > 0 ? variantImages : fallbackImages

  const [activeImg, setActiveImg] = useState(displayImages[0]?.secure_url || fallbackImages[0]?.secure_url)
  const [activeIdx, setActiveIdx] = useState(0)

  // Hàm đổi ảnh theo màu
  const changeColor = (color) => {
    if (!color) return
    const index = displayImages.findIndex(img => img.color === color)
    if (index !== -1) {
      setActiveImg(displayImages[index].secure_url)
      setActiveIdx(index)
      if (onColorChange) {
        onColorChange(color)
      }
    }
  }

  // Expose method cho component cha
  useImperativeHandle(ref, () => ({
    changeColor
  }))

  // Khi variants thay đổi, cập nhật ảnh đầu tiên
  useEffect(() => {
    if (displayImages.length > 0) {
      // Nếu có selectedColor từ cha, ưu tiên hiển thị màu đó
      if (selectedColor) {
        const index = displayImages.findIndex(img => img.color === selectedColor)
        if (index !== -1) {
          setActiveImg(displayImages[index].secure_url)
          setActiveIdx(index)
          if (onColorChange) {
            onColorChange(selectedColor)
          }
          return
        }
      }
      setActiveImg(displayImages[0].secure_url)
      setActiveIdx(0)
      if (onColorChange && displayImages[0].color) {
        onColorChange(displayImages[0].color)
      }
    }
  }, [variants, selectedColor])

  // Khi selectedColor thay đổi từ bên ngoài, cập nhật ảnh
  useEffect(() => {
    if (selectedColor) {
      const index = displayImages.findIndex(img => img.color === selectedColor)
      if (index !== -1 && index !== activeIdx) {
        setActiveImg(displayImages[index].secure_url)
        setActiveIdx(index)
      }
    }
  }, [selectedColor])

  const handleSelect = (img, idx) => {
    setActiveImg(img.secure_url)
    setActiveIdx(idx)
    if (onColorChange && img.color) {
      onColorChange(img.color)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            src={activeImg}
            alt={productName}
            className="w-full h-full object-cover absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        {displayImages[activeIdx]?.color && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
            Màu: {displayImages[activeIdx].color}
          </div>
        )}
      </div>

      <motion.div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } }
        }}
      >
        {displayImages.map((img, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleSelect(img, idx)}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors duration-200 cursor-pointer
              ${activeIdx === idx ? 'border-brand-primary shadow-md' : 'border-transparent hover:border-gray-200'}`}
          >
            <img src={img.secure_url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            {img.color && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 truncate px-1">
                {img.color}
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
})
