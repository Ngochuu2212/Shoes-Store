import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { orderTrackingApiService } from '~/services/user/orderTrackingApiService'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiBox, FiInfo } from 'react-icons/fi'
import { OrderProductList } from './OrderProductList'
import { OrderShippingInfo } from './OrderShippingInfo'
import { OrderPaymentSummary } from './OrderPaymentSummary'
import { ORDER_STATUS } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageTitle(
    `Đơn hàng #${orderId}`,
    `Xem chi tiết đơn hàng #${orderId}`
  )

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await orderTrackingApiService.getOrderDetail(orderId)
        setOrder(data)
      } catch (error) {
        toast.error('Không tìm thấy đơn hàng.')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [orderId])

  if (loading || !order) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <FiBox className="text-brand-primary" size={32} />
      </motion.div>
    </div>
  )

  // Hàm render giao diện cho trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
    case ORDER_STATUS.PENDING: return <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full text-xs ml-3">ĐƠN HÀNG MỚI</span>
    case ORDER_STATUS.PROCESSING: return <span className="text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG XỬ LÝ</span>
    case ORDER_STATUS.WAITING_FOR_SHIPPER: return <span className="text-yellow-700 font-bold bg-yellow-50 px-3 py-1 rounded-full text-xs ml-3">CHỜ SHIPPER</span>
    case ORDER_STATUS.ACCEPTED_BY_SHIPPER: return <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-xs ml-3">SHIPPER ĐÃ NHẬN</span>
    case ORDER_STATUS.SHIPPING: return <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG GIAO HÀNG</span>
    case ORDER_STATUS.SHIPPED: return <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG GIAO HÀNG</span>
    case ORDER_STATUS.DELIVERED: return <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs ml-3">ĐÃ GIAO - CHỜ XÁC NHẬN</span>
    case ORDER_STATUS.COMPLETED: return <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs ml-3">ĐÃ GIAO THÀNH CÔNG</span>
    case ORDER_STATUS.CANCELLED: return <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-xs ml-3">ĐÃ HỦY</span>
    case ORDER_STATUS.CANCEL_REQUESTED: return <span className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG YÊU CẦU HỦY</span>
    
    // Trạng thái trả hàng mới
    case ORDER_STATUS.RETURN_REQUESTED: return <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs ml-3">YÊU CẦU TRẢ HÀNG</span>
    case ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER: return <span className="text-yellow-700 font-bold bg-yellow-50 px-3 py-1 rounded-full text-xs ml-3">TRẢ HÀNG - CHỜ SHIPPER</span>
    case ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER: return <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-xs ml-3">TRẢ HÀNG - SHIPPER ĐÃ NHẬN</span>
    case ORDER_STATUS.RETURN_SHIPPING: return <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs ml-3">TRẢ HÀNG - ĐANG THU HỒI</span>
    case ORDER_STATUS.RETURN_DELIVERED: return <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs ml-3">TRẢ HÀNG - ĐÃ GIAO SHOP</span>
    case ORDER_STATUS.RETURN_COMPLETED: return <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs ml-3">ĐÃ TRẢ HÀNG THÀNH CÔNG</span>
    
    default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">

      <main className="max-w-5xl mx-auto px-4 flex-1 w-full">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="bg-white rounded-3xl p-8 md:p-16 my-8 overflow-hidden shadow-shadow-custom"
        >

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, ease: 'anticipate' }}
              className="text-base sm:text-lg md:text-xl font-extrabold text-brand-secondary flex flex-wrap items-center gap-2"
            >
              <FiInfo className="text-brand-primary shrink-0" />
              <span>Chi tiết đơn hàng #{order.order_id}</span>
              <span className="inline-block">{renderStatusBadge(order.status)}</span>
            </motion.h2>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-300 cursor-pointer active:scale-95 shrink-0 w-full sm:w-auto"
            >
              <FiArrowLeft size={14} className="sm:w-4 sm:h-4" />
              <span>Quay lại danh sách</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, ease: 'easeOut' }}
              className="lg:col-span-2 space-y-6"
            >
              <OrderProductList order={order} />
              <OrderPaymentSummary order={order} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, ease: 'circOut' }}
              className="space-y-6"
            >
              <OrderShippingInfo order={order} />
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}