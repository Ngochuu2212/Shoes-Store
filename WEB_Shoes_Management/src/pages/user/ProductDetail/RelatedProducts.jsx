import { motion } from 'framer-motion'
import { ProductSection } from '~/components/user/ProductSection'

export const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) return null

  return (
    <motion.div
      className="mt-12"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <ProductSection title="Sản phẩm liên quan" products={products} icon="related" />
    </motion.div>
  )
}