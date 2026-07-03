import { motion } from 'framer-motion'
import { FiPackage } from 'react-icons/fi'
import { getReviewImage } from '~/utils/formatters'

export const ProductInfoCard = ({ product }) => {
  if (!product || !product.name) return null

  // Lấy ảnh từ variants hoặc product_images
  const imageUrl = getReviewImage(product, 'https://placehold.co/80x80?text=Product')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
    >
      <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
        <FiPackage className="text-brand-primary" /> Thông tin sản phẩm
      </h3>
      <div className="flex items-center gap-4">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
        />
        <div className="flex-1">
          <p className="font-extrabold text-gray-800 text-lg">{product.name}</p>
          <p className="text-sm text-gray-500 mt-1">Mã sản phẩm: #{product.id}</p>
          {product.variants && product.variants.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {product.variants.length} biến thể
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}