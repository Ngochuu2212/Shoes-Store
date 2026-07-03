import { useState, useEffect } from 'react'
import { productService } from '~/services/user/productService'
import { ProductSection } from '~/components/user/ProductSection'

export const RecommendedProducts = ({
  type = 'empty-cart',
  categoryIds = [],
  excludedIds = [],
  limit = 8,
  onAddToCartSuccess
}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        let data = []
        if (type === 'empty-cart') {
          data = await productService.getEmptyCartRecommendations(limit)
        } else if (type === 'post-checkout') {
          data = await productService.getPostCheckoutRecommendations(categoryIds, excludedIds, limit)
        }

        // Đảm bảo data là mảng trước khi set state
        if (Array.isArray(data)) {
          setProducts(data)
        }
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm gợi ý:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [type, categoryIds.join(','), excludedIds.join(','), limit])

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!products || products.length === 0) return null

  return (
    <ProductSection
      title="Có thể bạn sẽ thích"
      products={products}
      icon="related"
      onAddToCartSuccess={onAddToCartSuccess}
    />
  )
}