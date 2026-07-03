import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ProductGallery } from '~/pages/user/ProductDetail/ProductGallery'
import { ProductInfo } from '~/pages/user/ProductDetail/ProductInfo'
import { StoreInfo } from '~/pages/user/ProductDetail/StoreInfo'
import { RelatedProducts } from '~/pages/user/ProductDetail/RelatedProducts'
import { ProductReview } from '~/pages/user/ProductDetail/ProductReview'
import { productService } from '~/services/user/productService'
import { BreadCrumb } from '~/components/user/BreadCrumb'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ProductDetailPage = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [storeId, setStoreId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState('')
  const galleryRef = useRef(null)

  usePageTitle(
    product?.name || 'Chi tiết sản phẩm',
    product?.description || 'Xem chi tiết sản phẩm giày dép tại Shoes Platform'
  )

  useEffect(() => {
    const fetchProduct = async () => {
      const productData = await productService.getProductDetail(slug)
      setProduct(productData)
      setStoreId(productData.store_id)

      // Set màu đầu tiên từ variants
      if (productData.variants && productData.variants.length > 0) {
        const firstVariant = productData.variants[0]
        setSelectedColor(firstVariant.color || '')
      }

      setLoading(false)
    }
    fetchProduct()
  }, [slug])

  const handleColorChangeFromGallery = (color) => {
    setSelectedColor(color)
  }

  const handleColorSelectFromInfo = (color) => {
    setSelectedColor(color)
    // Gọi hàm để đổi ảnh trong Gallery
    if (galleryRef.current && galleryRef.current.changeColor) {
      galleryRef.current.changeColor(color)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    )
  }

  if (!product) return <div>Sản phẩm không tồn tại</div>

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">

      <main className="app-container py-8 flex-1">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BreadCrumb
            items={[
              { label: 'Trang chủ', link: '/' },
              { label: product?.category_name || 'Danh mục', link: `/products?categories=${product?.category_slug}` },
              { label: product?.name || 'Chi tiết', link: null }
            ]}
          />
        </motion.div>

        {/* Khối nội dung chính */}
        <motion.div
          className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cột trái: Ảnh */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
            >
              <ProductGallery
                ref={galleryRef}
                images={product.images}
                productName={product.name}
                variants={product.variants}
                onColorChange={handleColorChangeFromGallery}
                selectedColor={selectedColor}
              />
            </motion.div>

            {/* Cột phải: Thông tin */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            >
              <ProductInfo
                product={product}
                onColorChangeFromGallery={selectedColor}
                onColorSelect={handleColorSelectFromInfo}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Các section bên dưới */}
        <StoreInfo storeId={storeId} />
        <ProductReview product={product} />
        <RelatedProducts products={product.relatedProducts} />
      </main>
    </div>
  )
}