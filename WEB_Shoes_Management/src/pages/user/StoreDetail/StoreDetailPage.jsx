import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreProfileHeader } from './StoreProfileHeader'
import { StoreProductList } from './StoreProductList'
import { StoreReview } from './StoreReview'
import { storeService } from '~/services/user/storeService'
import { toast } from 'react-toastify'
import { FiStar } from 'react-icons/fi'
import { usePageTitle } from '~/hooks/usePageTitle'


export const StoreDetailPage = () => {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  usePageTitle(
    store?.name ? `Cửa hàng ${store.name}` : 'Chi tiết cửa hàng',
    store?.bio || 'Xem thông tin cửa hàng và sản phẩm tại Shoes Platform'
  )

  // State cho Sản phẩm
  const [products, setProducts] = useState([])
  const [productPagination, setProductPagination] = useState(null)

  // State cho Đánh giá
  const [reviews, setReviews] = useState([])
  const [reviewPagination, setReviewPagination] = useState(null)

  const [loading, setLoading] = useState(true)

  // Hàm tải thông tin khởi tạo ban đầu (Gọi 3 API cùng lúc)
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [storeDetail, productsData, reviewsData] = await Promise.all([
        storeService.getStoreDetail(id),
        storeService.getStoreProducts(id, 1, 12),
        storeService.getStoreReviews(id, 1, 8)
      ])

      setStore(storeDetail)

      setProducts(productsData.products)
      setProductPagination(productsData.pagination)

      setReviews(reviewsData.reviews)
      setReviewPagination(reviewsData.pagination)
    } catch (error) {
      toast.error('Không tìm thấy thông tin cửa hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Xử lý chuyển trang SẢN PHẨM
  const handleProductPageChange = async (newPage) => {
    try {
      const data = await storeService.getStoreProducts(id, newPage, 12)
      setProducts(data.products)
      setProductPagination(data.pagination)
      window.scrollTo({ top: 400, behavior: 'smooth' })
    } catch (error) {
      toast.error('Lỗi khi tải trang sản phẩm.')
    }
  }

  // Xử lý chuyển trang ĐÁNH GIÁ
  const handleReviewPageChange = async (newPage) => {
    try {
      const data = await storeService.getStoreReviews(id, newPage, 8)
      setReviews(data.reviews)
      setReviewPagination(data.pagination)
      window.scrollTo({ top: 400, behavior: 'smooth' })
    } catch (error) {
      toast.error('Lỗi khi tải trang đánh giá.')
    }
  }

  // Cấu hình Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  const reviewSectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  const productSectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 } }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <main className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 flex-1 w-full">
        <AnimatePresence mode="wait">
          {loading && !store ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="w-full animate-pulse"
            >
              <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
              <div className="h-96 bg-gray-200 rounded-3xl mb-8"></div>
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
            </motion.div>
          ) : (
            store && (
              <motion.div
                key="store-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="w-full flex flex-col"
              >
                <motion.div variants={headerVariants}>
                  <StoreProfileHeader store={store} />
                </motion.div>

                {/* Phần Đánh giá */}
                <motion.div variants={reviewSectionVariants} className="mt-8">
                  <div className="text-2xl font-extrabold text-brand-secondary tracking-tight flex items-center gap-3 mb-2">
                    <FiStar className="w-7 h-7 text-brand-primary fill-brand-primary" />
                    <h2 className="text-2xl font-bold text-gray-900">
        Đánh giá từ khách hàng
                    </h2>
                  </div>
                  <StoreReview
                    reviews={reviews}
                    pagination={reviewPagination}
                    onPageChange={handleReviewPageChange}
                  />
                </motion.div>

                {/* Phần Sản phẩm */}
                <motion.div variants={productSectionVariants} className="mt-12">
                  <StoreProductList
                    products={products}
                    pagination={productPagination}
                    onPageChange={handleProductPageChange}
                  />
                </motion.div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}