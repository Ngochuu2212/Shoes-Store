import { motion, AnimatePresence } from 'framer-motion'
import { ProductSection } from '~/components/user/ProductSection'
import { Pagination } from '~/components/common/Pagination'

export const StoreProductList = ({ products, pagination, onPageChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={pagination?.page || 1}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ProductSection
            title="Sản phẩm của Shop"
            products={products || []}
            icon="related"
          />
        </motion.div>
      </AnimatePresence>

      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="-mt-6 mb-8 flex justify-center"
        >
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </motion.div>
      )}
    </motion.div>
  )
}