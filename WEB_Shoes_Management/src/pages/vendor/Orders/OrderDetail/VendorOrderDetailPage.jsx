import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft, FiPackage, FiUser, FiMapPin, FiCreditCard,
  FiFileText, FiDollarSign, FiTruck, FiClock, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiPrinter
} from 'react-icons/fi'
import { toast } from 'react-toastify'

import { vendorOrderApiService } from '~/services/vendor/vendorOrderApiService'
import { formatPrice } from '~/utils/formatters'
import { getImageUrl, getOrderItemImage } from '~/utils/formatters'
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '~/utils/constant'
import { CancelRequestModal } from '../CancelRequestModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorOrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  usePageTitle(
    order ? `Đơn hàng #${order.id}` : 'Chi tiết đơn hàng',
    order ? `Xem chi tiết đơn hàng #${order.id} - ${order.store_name}` : 'Xem chi tiết đơn hàng'
  )

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      // Lấy danh sách đơn hàng và tìm đơn theo id
      const res = await vendorOrderApiService.getVendorOrders({ searchOrderId: id })
      if (res.orders && res.orders.length > 0) {
        setOrder(res.orders[0])
      } else {
        toast.error('Không tìm thấy đơn hàng.')
        navigate('/vendor/orders')
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin đơn hàng.')
      navigate('/vendor/orders')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    switch (status) {
    case ORDER_STATUS.PENDING:
      return { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-600 border-amber-100', icon: FiClock, color: 'text-amber-600' }
    case ORDER_STATUS.PROCESSING:
      return { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-600 border-blue-100', icon: FiPackage, color: 'text-blue-600' }
    case ORDER_STATUS.WAITING_FOR_SHIPPER:
      return { label: 'Chờ Shipper', className: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: FiClock, color: 'text-yellow-700' }
    case ORDER_STATUS.ACCEPTED_BY_SHIPPER:
      return { label: 'Shipper đã nhận', className: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: FiTruck, color: 'text-indigo-600' }
    case ORDER_STATUS.SHIPPING:
      return { label: 'Đang giao', className: 'bg-orange-50 text-orange-600 border-orange-100', icon: FiTruck, color: 'text-orange-600' }
    case ORDER_STATUS.SHIPPED:
      return { label: 'Đang giao hàng', className: 'bg-purple-50 text-purple-600 border-purple-100', icon: FiTruck, color: 'text-purple-600' }
    case ORDER_STATUS.DELIVERED:
      return { label: 'Đã giao - chờ xác nhận', className: 'bg-purple-50 text-purple-600 border-purple-100', icon: FiCheckCircle, color: 'text-purple-600' }
    case ORDER_STATUS.COMPLETED:
      return { label: 'Hoàn thành', className: 'bg-green-50 text-green-600 border-green-100', icon: FiCheckCircle, color: 'text-green-600' }
    case ORDER_STATUS.CANCEL_REQUESTED:
      return { label: 'Yêu cầu hủy', className: 'bg-orange-50 text-orange-600 border-orange-100', icon: FiAlertCircle, color: 'text-orange-600' }
    case ORDER_STATUS.CANCELLED:
      return { label: 'Đã hủy', className: 'bg-red-50 text-red-500 border-red-100', icon: FiXCircle, color: 'text-red-500' }
    default:
      return { label: status, className: 'bg-gray-50 text-gray-500 border-gray-100', icon: FiClock, color: 'text-gray-500' }
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
    case PAYMENT_STATUS.PAID:
      return { label: 'Đã thanh toán', className: 'bg-green-50 text-green-600' }
    case PAYMENT_STATUS.UNPAID:
      return { label: 'Chưa thanh toán', className: 'bg-amber-50 text-amber-600' }
    case PAYMENT_STATUS.REFUNDED:
      return { label: 'Đã hoàn tiền', className: 'bg-blue-50 text-blue-600' }
    default:
      return { label: status, className: 'bg-gray-50 text-gray-500' }
    }
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
    case PAYMENT_METHODS.COD: return 'COD (Thanh toán khi nhận hàng)'
    case PAYMENT_METHODS.VNPAY: return 'VNPAY'
    case PAYMENT_METHODS.MOMO: return 'MoMo'
    default: return method
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await vendorOrderApiService.updateOrderStatus(id, newStatus)
      toast.success(res.message)
      fetchOrderDetail()
    } catch (error) {
      toast.error(error.message || 'Cập nhật trạng thái thất bại.')
    }
  }

  const handleCancelRequest = async (decision, reason) => {
    try {
      const res = await vendorOrderApiService.handleCancelRequest(id, decision, reason)
      toast.success(res.message)
      setIsCancelModalOpen(false)
      fetchOrderDetail()
    } catch (error) {
      toast.error(error.message || 'Xử lý yêu cầu hủy thất bại.')
    }
  }

  const handleAssignToShipper = async () => {
    try {
      const res = await vendorOrderApiService.assignToShipper(id)
      toast.success(res.message)
      fetchOrderDetail()
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Bàn giao thất bại.')
    }
  }

  const StatusBadge = order ? getStatusBadge(order.status) : null
  const PaymentStatusBadge = order ? getPaymentStatusBadge(order.payment_status) : null

  const canUpdateStatus = order &&
    order.status !== ORDER_STATUS.DELIVERED &&
    order.status !== ORDER_STATUS.COMPLETED &&
    order.status !== ORDER_STATUS.WAITING_FOR_SHIPPER &&
    order.status !== ORDER_STATUS.ACCEPTED_BY_SHIPPER &&
    order.status !== ORDER_STATUS.SHIPPING &&
    order.status !== ORDER_STATUS.CANCELLED &&
    !order.cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')

  const showCancelRequest = order?.status === ORDER_STATUS.CANCEL_REQUESTED

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Đang tải thông tin đơn hàng...</span>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/orders')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
            title="Quay lại danh sách"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-brand-primary tracking-tight">
                Chi tiết đơn hàng
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${StatusBadge.className}`}>
                <StatusBadge.icon size={12} />
                {StatusBadge.label}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 mt-1">Mã đơn hàng: #{order.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer"
          >
            <FiPrinter size={14} /> In đơn hàng
          </button>
        </div>
      </motion.div>

      {/* Thông tin chính - Grid 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin khách hàng & giao hàng */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin khách hàng */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
              <FiUser className="text-brand-primary" /> Thông tin khách hàng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Tên khách hàng</span>
                <span className="text-sm font-bold text-gray-800">{order.recipient_name || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Số điện thoại</span>
                <span className="text-sm font-bold text-gray-800">{order.recipient_phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">ID người dùng</span>
                <span className="text-sm font-bold text-gray-800">#{order.user_id}</span>
              </div>
            </div>
          </motion.div>

          {/* Địa chỉ giao hàng */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
              <FiMapPin className="text-brand-primary" /> Địa chỉ giao hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.shipping_address || '—'}
              </p>
            </div>
          </motion.div>

          {/* Danh sách sản phẩm */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
              <FiPackage className="text-brand-primary" /> Sản phẩm đã đặt
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => {
                // Lấy ảnh từ order item (ưu tiên variant_image)
                const imageUrl = getOrderItemImage(item)

                return (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200">
                    <img
                      src={imageUrl}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-extrabold text-gray-800">{item.product_name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {item.size && (
                          <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                  Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                  Màu: {item.color}
                          </span>
                        )}
                        {item.variant_image && item.variant_image.secure_url && (
                          <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                  Có ảnh phân loại
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-brand-primary">{formatPrice(item.price)}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                      <p className="text-xs font-bold text-gray-600 mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Cột bên phải - Thông tin đơn hàng & Thanh toán */}
        <div className="space-y-6">
          {/* Thông tin đơn hàng */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
              <FiFileText className="text-brand-primary" /> Thông tin đơn hàng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Mã đơn hàng</span>
                <span className="text-sm font-bold font-mono text-gray-800">#{order.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Ngày đặt hàng</span>
                <span className="text-sm font-bold text-gray-800">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Cập nhật cuối</span>
                <span className="text-sm font-bold text-gray-800">{formatDate(order.updated_at)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Trạng thái</span>
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${StatusBadge.color}`}>
                  <StatusBadge.icon size={14} />
                  {StatusBadge.label}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Thông tin thanh toán */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
              <FiCreditCard className="text-brand-primary" /> Thông tin thanh toán
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Phương thức</span>
                <span className="text-sm font-bold text-gray-800">{getPaymentMethodLabel(order.payment_method)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Trạng thái thanh toán</span>
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${PaymentStatusBadge.className === 'bg-green-50 text-green-600' ? 'text-green-600' : PaymentStatusBadge.className === 'bg-amber-50 text-amber-600' ? 'text-amber-600' : 'text-blue-600'}`}>
                  {PaymentStatusBadge.label}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tổng kết đơn hàng */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-brand-primary/5 to-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
              <FiDollarSign className="text-brand-primary" /> Tổng kết đơn hàng
            </h3>
            <div className="space-y-3">
              {/* Tổng tiền hàng (trước giảm giá, trước phí ship) */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng tiền hàng</span>
                <span className="text-sm font-bold text-gray-800">
                  {formatPrice(Number(order.total_amount) + Number(order.discount_amount) - Number(order.shipping_fee || 0))}
                </span>
              </div>

              {/* Giảm giá */}
              {order.discount_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Giảm giá</span>
                  <span className="text-sm font-bold text-green-600">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}

              {/* Phí vận chuyển */}
              {Number(order.shipping_fee) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phí vận chuyển ({order.shipping_method || 'standard'})</span>
                  <span className="text-sm font-bold text-orange-500">+{formatPrice(order.shipping_fee)}</span>
                </div>
              )}

              {/* Số dư ví dùng */}
              {Number(order.wallet_amount_used) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số dư ví</span>
                  <span className="text-sm font-bold text-blue-600">-{formatPrice(order.wallet_amount_used)}</span>
                </div>
              )}

              {/* Thành tiền (sau giảm giá, sau ví) */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-base font-extrabold text-gray-800">Thành tiền</span>
                <span className="text-xl font-extrabold text-brand-primary">{formatPrice(Math.max(0, Number(order.total_amount) - Number(order.wallet_amount_used || 0)))}</span>
              </div>

              {/* Phí sàn */}
              {order.commission_rate_snapshot && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Phí sàn ({order.commission_rate_snapshot}%)</span>
                  <span className="text-sm font-semibold text-amber-600">
          -{formatPrice((order.total_amount || 0) * order.commission_rate_snapshot / 100)}
                  </span>
                </div>
              )}

              {/* Tiền thực nhận */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-base font-extrabold text-gray-800">Tiền thực nhận</span>
                <span className="text-xl font-extrabold text-green-600">
                  {formatPrice((order.total_amount || 0) * (1 - (order.commission_rate_snapshot || 0) / 100))}
                </span>
              </div>

              {/* Chi tiết phí sàn (tooltip) */}
              {order.commission_rate_snapshot && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-500 text-center">
          * Phí sàn được tính dựa trên tỷ lệ {order.commission_rate_snapshot}% khi tạo đơn hàng
                  </p>
                </div>
              )}

              {/* Ảnh minh chứng giao hàng */}
              {(() => {
                let proofImgs = []
                try {
                  proofImgs = typeof order.delivery_proof_images === 'string'
                    ? JSON.parse(order.delivery_proof_images)
                    : (Array.isArray(order.delivery_proof_images) ? order.delivery_proof_images : [])
                } catch { proofImgs = [] }
                return proofImgs.length > 0 ? (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-sm font-bold text-gray-700">📸 Ảnh minh chứng giao hàng ({proofImgs.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {proofImgs.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`proof-${i}`} className="w-16 h-16 object-cover rounded-xl border border-gray-200 hover:scale-105 transition-transform cursor-pointer" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          </motion.div>


          {/* Lý do hủy (nếu có) */}
          {order.cancel_reason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-black text-red-700 flex items-center gap-2 mb-3">
                <FiXCircle className="text-red-600" /> Lý do hủy đơn hàng
              </h3>
              <p className="text-red-800 leading-relaxed text-sm">{order.cancel_reason}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          {canUpdateStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              {order.status === ORDER_STATUS.PENDING && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(ORDER_STATUS.PROCESSING)}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer"
                  >
                    <FiCheckCircle size={16} /> Xác nhận đơn hàng
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(ORDER_STATUS.CANCELLED)}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer"
                  >
                    <FiXCircle size={16} /> Từ chối đơn hàng
                  </button>
                </div>
              )}

              {order.status === ORDER_STATUS.PROCESSING && (
                <button
                  onClick={handleAssignToShipper}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer"
                >
                  <FiTruck size={16} /> Bàn giao cho Shipper
                </button>
              )}

              {showCancelRequest && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer"
                >
                  <FiAlertCircle size={16} /> Xử lý yêu cầu hủy đơn
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal xử lý yêu cầu hủy */}
      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelRequest}
        isLoading={false}
      />
    </div>
  )
}