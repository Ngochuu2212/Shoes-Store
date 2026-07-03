import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiCamera, FiTrash2, FiUploadCloud, FiImage } from 'react-icons/fi'

export const CategoryFormAvatar = ({ imagePreview, onImageChange, onRemoveImage, isEditMode }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageChange(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onImageChange(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getImageUrl = () => {
    if (imagePreview) {
      if (typeof imagePreview === 'object' && imagePreview.secure_url) {
        return imagePreview.secure_url
      }
      return imagePreview
    }
    return null
  }

  const imageUrl = getImageUrl()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 sticky top-24"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiImage className="text-emerald-500" size={16} />
        </div>
        Ảnh danh mục
      </h3>

      <div className="flex flex-col items-center gap-4">
        {/* Image Preview */}
        <div className="relative group">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-emerald-100 shadow-lg bg-gray-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Category"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-2">
                <FiImage size={40} className="text-gray-300" />
                <span className="text-[10px] text-gray-400 font-semibold">Chưa có ảnh</span>
              </div>
            )}
          </div>

          {imageUrl && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemoveImage}
              className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all duration-200 cursor-pointer"
            >
              <FiTrash2 size={14} />
            </motion.button>
          )}
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDragging ? 'bg-emerald-100 text-emerald-500' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiUploadCloud size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragging ? 'Thả ảnh vào đây' : 'Nhấn hoặc kéo thả ảnh'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP (Tối đa 3MB)
              </p>
            </div>
          </div>
        </div>

        {isEditMode && (
          <p className="text-xs text-gray-400 text-center">
            * Để trống nếu không muốn thay đổi ảnh
          </p>
        )}
      </div>
    </motion.div>
  )
}