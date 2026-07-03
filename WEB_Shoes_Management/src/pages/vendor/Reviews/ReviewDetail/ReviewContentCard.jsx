import { motion } from 'framer-motion'
import { FiMessageSquare, FiImage, FiZoomIn } from 'react-icons/fi'

export const ReviewContentCard = ({ comment, images, onImageClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
    >
      <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
        <FiMessageSquare className="text-brand-primary" /> Nội dung đánh giá
      </h3>

      {/* Nội dung */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment || 'Không có nội dung đánh giá.'}
        </p>
      </div>

      {/* Hình ảnh đính kèm - Grid layout */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiImage className="text-brand-primary" size={18} />
            <h4 className="text-sm font-extrabold text-gray-700">
              Hình ảnh đính kèm ({images.length})
            </h4>
          </div>

          <div className={`grid gap-3 ${
            images.length === 1 ? 'grid-cols-1 max-w-[300px]' :
              images.length === 2 ? 'grid-cols-2' :
                images.length === 3 ? 'grid-cols-2 md:grid-cols-3' :
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {images.map((img, idx) => {
              const imageUrl = img.secure_url || img
              return (
                <div
                  key={idx}
                  className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 aspect-square"
                  onClick={() => onImageClick(idx)}
                >
                  <img
                    src={imageUrl}
                    alt={`Review ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <FiZoomIn className="text-white" size={24} />
                  </div>
                  {images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {idx + 1}/{images.length}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}