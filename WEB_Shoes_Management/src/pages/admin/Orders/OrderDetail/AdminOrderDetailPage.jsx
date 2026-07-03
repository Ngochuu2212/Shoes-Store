import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { adminOrderApiService } from '~/services/admin/adminOrderApiService'
import { ORDER_STATUS } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { OrderDetailHeader } from './OrderDetailHeader'
import { OrderBuyerInfo } from './OrderBuyerInfo'
import { OrderRecipientInfo } from './OrderRecipientInfo'
import { OrderStoreInfo } from './OrderStoreInfo'
import { OrderSummaryCard } from './OrderSummaryCard'
import { OrderCancelReason } from './OrderCancelReason'
import { OrderProductList } from './OrderProductList'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminOrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forceCancelModal, setForceCancelModal] = useState({ isOpen: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  usePageTitle(
    'Chi tiết đơn hàng',
    order ? `Xem chi tiết đơn hàng #${order.order_id}` : 'Xem chi tiết đơn hàng'
  )

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const res = await adminOrderApiService.getOrderDetail(orderId)
      setOrder(res)
    } catch (error) {
      toast.error(error.message || 'Không thể tải chi tiết đơn hàng')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) fetchOrderDetail()
  }, [orderId])

  const handleForceCancel = () => {
    setForceCancelModal({ isOpen: true })
  }

  const handleConfirmForceCancel = async (reason) => {
    if (!reason || !reason.trim()) {
      toast.warning('Vui lòng nhập lý do ép hủy đơn hàng')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await adminOrderApiService.forceCancelOrder(orderId, reason)
      toast.success(res.message)
      setForceCancelModal({ isOpen: false })
      fetchOrderDetail()
    } catch (error) {
      toast.error(error.message || 'Ép hủy đơn hàng thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải chi tiết đơn hàng...
        </motion.span>
      </div>
    )
  }

  if (!order) return null

  const isCancellable = order.status !== ORDER_STATUS.DELIVERED &&
                       order.status !== ORDER_STATUS.CANCELLED

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <OrderDetailHeader
        order={order}
        onBack={() => navigate('/admin/orders')}
        onForceCancel={handleForceCancel}
        isCancellable={isCancellable}
      />

      {/* Thông tin chính - 3 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrderBuyerInfo order={order} delay={0.1} />
        <OrderRecipientInfo order={order} delay={0.15} />
        <OrderStoreInfo order={order} delay={0.2} />
      </div>

      {/* Thông tin đơn hàng */}
      <OrderSummaryCard order={order} delay={0.25} />

      {/* Lý do hủy (nếu có) */}
      <OrderCancelReason order={order} delay={0.3} />

      {/* Danh sách sản phẩm */}
      <OrderProductList order={order} delay={0.35} />

      {/* Modal ép hủy */}
      <ConfirmReasonModal
        isOpen={forceCancelModal.isOpen}
        onClose={() => setForceCancelModal({ isOpen: false })}
        onConfirm={handleConfirmForceCancel}
        title="Ép hủy đơn hàng"
        message={`Bạn đang chuẩn bị ép hủy đơn hàng #${order.id}. Hành động này sẽ hoàn lại số lượng tồn kho và chuyển trạng thái thanh toán sang "Đã hoàn tiền". Vui lòng nhập lý do chi tiết.`}
        placeholder="Nhập lý do ép hủy đơn hàng (tối thiểu 10 ký tự)..."
        isLoading={isSubmitting}
        type="danger"
      />
    </motion.div>
  )
}