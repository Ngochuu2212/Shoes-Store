import { useEffect } from 'react'
import { FiCheck } from 'react-icons/fi'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { RecommendedProducts } from '~/components/user/RecommendedProducts'
import { useDispatch } from 'react-redux'
import { setCartCount, clearPendingOrderIds } from '~/redux/user/cartSlice'
import { cartApiService } from '~/services/user/cartService'
import { motion } from 'framer-motion'
import { usePageTitle } from '~/hooks/usePageTitle'

export const OrderSuccessPage = () => {
  usePageTitle('Đặt hàng thành công', 'Cảm ơn bạn đã mua sắm tại Shoes Platform')
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()

  useEffect(() => {
    // Xóa pending order ids khi vào trang thành công
    dispatch(clearPendingOrderIds())

    const fetchRemainingCart = async () => {
      try {
        const data = await cartApiService.getCart()
        if (Array.isArray(data)) {
          const totalItems = data.reduce((sum, item) => sum + item.cart_quantity, 0)
          dispatch(setCartCount(totalItems))
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật giỏ hàng:', error)
      }
    }

    fetchRemainingCart()
  }, [dispatch])

  const stateData = location.state?.orderData
  const urlOrderIds = searchParams.get('orderIds')
  const urlMethod = searchParams.get('method')

  const displayOrderId = stateData?.orderId || (urlOrderIds ? `#${urlOrderIds.split(',').join(', #')}` : '#ORD-UNKNOWN')
  const displayMethod = stateData?.paymentMethod || (urlMethod === 'VNPAY' ? 'Cổng thanh toán điện tử VNPay' : urlMethod === 'MOMO' ? 'Ví điện tử MoMo' : 'Thanh toán khi nhận hàng (COD)')
  const displayDate = stateData?.orderDate || new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })

  const categoryIds = location.state?.categoryIds || []
  const excludedIds = location.state?.excludedIds || []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white ring ring-brand-primary/50 max-w-[480px] w-full rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full border-[3px] border-[#00bfa5] flex items-center justify-center mb-6"
          >
            <FiCheck size={48} className="text-[#00bfa5]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-extrabold text-brand-secondary mb-3 tracking-tight"
          >
            Đặt hàng thành công!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 leading-relaxed mb-8 px-4"
          >
            Cảm ơn bạn đã mua sắm tại <span className="text-base font-extrabold text-brand-primary tracking-wide">Shoes Shop</span>.<br />
            Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, ease: 'easeOut' }}
            className="bg-gray-50/80 w-full rounded-2xl p-5 space-y-3.5 mb-8 border border-gray-100"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Mã đơn hàng:</span>
              <span className="font-bold text-gray-900">{displayOrderId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Ngày đặt:</span>
              <span className="font-bold text-gray-900">{displayDate}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Phương thức:</span>
              <span className="font-bold text-brand-primary">{displayMethod}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full space-y-3"
          >
            <Link to="/orders" className="w-full flex items-center justify-center py-3.5 bg-[#f04a5e] hover:bg-[#d93c50] text-white font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-95">
              Theo dõi đơn hàng
            </Link>
            <Link to="/products" className="w-full flex items-center justify-center py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 active:scale-95">
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: 'circOut' }}
          className="w-full"
        >
          <RecommendedProducts type="post-checkout" categoryIds={categoryIds} excludedIds={excludedIds} limit={8} />
        </motion.div>
      </main>
    </div>
  )
}