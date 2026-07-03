import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSend, FiStar, FiHash } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { orderTrackingApiService } from '~/services/user/orderTrackingApiService'
import { reviewService } from '~/services/user/reviewService'

import { StoreReviewSection } from './StoreReviewSection'
import { ProductReviewSection } from './ProductReviewSection'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ReviewOrderPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()

  usePageTitle(
    `Đánh giá đơn hàng #${orderId}`,
    `Đánh giá sản phẩm và cửa hàng cho đơn hàng #${orderId}`
  )

  const [order, setOrder] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      storeRating: 5,
      storeComment: '',
      productRating: 5,
      productComment: '',
      productImages: []
    }
  })

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderTrackingApiService.getOrderDetail(orderId)
        if (data.is_reviewed) {
          toast.info('Đơn hàng này đã được đánh giá rồi.')
          navigate(`/orders/${orderId}`)
          return
        }
        setOrder(data)
      } catch (error) {
        toast.error('Không tìm thấy đơn hàng.')
        navigate('/orders')
      } finally {
        setLoadingOrder(false)
      }
    }
    fetchOrder()
  }, [orderId, navigate])

  const onSubmitReview = async (formData) => {
    if (formData.productRating === 0 || formData.storeRating === 0) {
      toast.warning('Vui lòng chọn số sao đánh giá cho cả Cửa hàng và Sản phẩm.')
      return
    }

    setIsSubmitting(true)
    try {
      const storePayload = { rating: formData.storeRating, comment: formData.storeComment }

      const productFormData = new FormData()
      productFormData.append('rating', formData.productRating)
      productFormData.append('comment', formData.productComment)

      formData.productImages.forEach(img => productFormData.append('reviewImages', img))

      await Promise.all([
        reviewService.createStoreReview(orderId, storePayload),
        reviewService.createProductReview(orderId, productFormData)
      ])

      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp.')
      navigate(`/orders/${orderId}`)

    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingOrder) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"
      />
    </div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 } // Các khối xuất hiện cách nhau 0.15s
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 w-full max-w-4xl mx-auto px-4 py-10"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-secondary tracking-tight flex items-center gap-2.5">
              <FiStar className="text-yellow-400 fill-yellow-400" size={28} />
              Đánh giá đơn hàng
            </h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
              <FiHash className="text-gray-400" size={16} />
              <span>Mã đơn: <strong className="text-brand-primary">#{order?.order_id}</strong></span>
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-300 cursor-pointer active:scale-95 shrink-0"
          >
            <FiArrowLeft size={16} /> Quay lại
          </button>
        </motion.div>

        {/* Form chính bọc lại tất cả */}
        <form onSubmit={handleSubmit(onSubmitReview)}>
          <motion.div variants={itemVariants}>
            <StoreReviewSection
              store={{ name: order?.store_name }}
              control={control} register={register} errors={errors}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ProductReviewSection
              items={order?.items}
              control={control} register={register} errors={errors}
              watch={watch} setValue={setValue}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-brand-primary text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-brand-primary/30 hover:bg-[#c73652] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-wait cursor-pointer"
            >
              <FiSend size={18} />
              {isSubmitting ? 'Đang tải lên hệ thống...' : 'Gửi Đánh Giá Ngay'}
            </button>
          </motion.div>
        </form>
      </motion.main>

    </div>
  )
}