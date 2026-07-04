import { useState } from 'react'
import { FiEye, FiCheckCircle, FiXCircle, FiTruck, FiPackage, FiClock, FiChevronDown, FiCreditCard, FiAlertCircle, FiInfo, FiPhone, FiRefreshCw } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { formatPrice } from '~/utils/formatters'
import { ORDER_STATUS, PAYMENT_METHODS } from '~/utils/constant'
import { CancelRequestModal } from './CancelRequestModal'
import { ReturnRequestModal } from './ReturnRequestModal'
import { Link } from 'react-router-dom'

export const OrderTable = ({ orders, selectedIds, onSelectRow, onSelectAll, onUpdateStatus, onAssignShipper, onCancelRequest, onReturnRequest, onUpdateStatusBulk }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  const [cancelOrderReason, setCancelOrderReason] = useState('')

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [returnOrderId, setReturnOrderId] = useState(null)
  const [returnOrderReason, setReturnOrderReason] = useState('')

  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN')
  }

  // Tính phí sàn và tiền thực nhận
  const calculateNetAmount = (totalAmount, commissionRate) => {
    const fee = totalAmount * (commissionRate / 100)
    const netAmount = totalAmount - fee
    return { fee, netAmount }
  }

  const getStatusBadge = (status) => {
    switch (status) {
    case ORDER_STATUS.PENDING:
      return { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-600 border-amber-100', icon: FiClock }
    case ORDER_STATUS.PROCESSING:
      return { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-600 border-blue-100', icon: FiPackage }
    case ORDER_STATUS.WAITING_FOR_SHIPPER:
      return { label: 'Chờ Shipper', className: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: FiClock }
    case ORDER_STATUS.ACCEPTED_BY_SHIPPER:
      return { label: 'Shipper nhận', className: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: FiTruck }
    case ORDER_STATUS.SHIPPING:
      return { label: 'Đang giao', className: 'bg-orange-50 text-orange-600 border-orange-100', icon: FiTruck }
    case ORDER_STATUS.SHIPPED:
      return { label: 'Đang giao', className: 'bg-purple-50 text-purple-600 border-purple-100', icon: FiTruck }
    case ORDER_STATUS.DELIVERED:
      return { label: 'Đã giao', className: 'bg-purple-50 text-purple-600 border-purple-100', icon: FiCheckCircle }
    case ORDER_STATUS.COMPLETED:
      return { label: 'Hoàn thành', className: 'bg-green-50 text-green-600 border-green-100', icon: FiCheckCircle }
    case ORDER_STATUS.CANCEL_REQUESTED:
      return { label: 'Yêu cầu hủy', className: 'bg-orange-50 text-orange-600 border-orange-100', icon: FiAlertCircle }
    case ORDER_STATUS.CANCELLED:
      return { label: 'Đã hủy', className: 'bg-red-50 text-red-500 border-red-100', icon: FiXCircle }
    
    // Trạng thái trả hàng mới
    case ORDER_STATUS.RETURN_REQUESTED:
      return { label: 'Yêu cầu trả hàng', className: 'bg-orange-550/10 text-orange-600 border-orange-200 font-bold', icon: FiAlertCircle }
    case ORDER_STATUS.RETURN_WAITING_FOR_SHIPPER:
      return { label: 'Trả hàng - Chờ Shipper', className: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: FiClock }
    case ORDER_STATUS.RETURN_ACCEPTED_BY_SHIPPER:
      return { label: 'Trả hàng - Shipper nhận', className: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: FiTruck }
    case ORDER_STATUS.RETURN_SHIPPING:
      return { label: 'Trả hàng - Đang thu hồi', className: 'bg-orange-50 text-orange-600 border-orange-100', icon: FiTruck }
    case ORDER_STATUS.RETURN_DELIVERED:
      return { label: 'Trả hàng - Đã giao Shop', className: 'bg-purple-555/10 text-purple-600 border-purple-200', icon: FiCheckCircle }
    case ORDER_STATUS.RETURN_COMPLETED:
      return { label: 'Đã trả hàng', className: 'bg-green-50 text-green-600 border-green-100', icon: FiCheckCircle }

    default:
      return { label: status, className: 'bg-gray-50 text-gray-500 border-gray-100', icon: FiClock }
    }
  }

  const getPaymentMethodBadge = (method) => {
    switch (method) {
    case PAYMENT_METHODS.COD:
      return { label: 'COD', className: 'bg-blue-50 text-blue-600 border-blue-100', icon: FiCreditCard }
    case PAYMENT_METHODS.VNPAY:
      return { label: 'VNPAY', className: 'bg-green-50 text-green-600 border-green-100', icon: FiCreditCard }
    case PAYMENT_METHODS.MOMO:
      return { label: 'MoMo', className: 'bg-purple-50 text-purple-600 border-purple-100', icon: FiCreditCard }
    default:
      return { label: method, className: 'bg-gray-50 text-gray-500 border-gray-100', icon: FiCreditCard }
    }
  }

  const getStatusActions = (currentStatus) => {
    const actions = []
    if (currentStatus === ORDER_STATUS.PENDING) {
      actions.push({ value: ORDER_STATUS.PROCESSING, label: 'Xác nhận đơn hàng', icon: FiCheckCircle, color: 'text-blue-600' })
      actions.push({ value: ORDER_STATUS.CANCELLED, label: 'Từ chối đơn hàng', icon: FiXCircle, color: 'text-red-500' })
    }
    if (currentStatus === ORDER_STATUS.PROCESSING) {
      actions.push({ value: 'assign_shipper', label: 'Bàn giao cho Shipper', icon: FiTruck, color: 'text-orange-600' })
    }
    return actions
  }

  const handleOpenCancelModal = (orderId, cancelReason) => {
    setCancelOrderId(orderId)
    setCancelOrderReason(cancelReason || '')
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async (decision, reason) => {
    await onCancelRequest(cancelOrderId, decision, reason)
    setIsCancelModalOpen(false)
    setCancelOrderId(null)
    setCancelOrderReason('')
  }

  const handleOpenReturnModal = (orderId, returnReason) => {
    setReturnOrderId(orderId)
    setReturnOrderReason(returnReason || '')
    setIsReturnModalOpen(true)
  }

  const handleConfirmReturn = async (decision, reason) => {
    await onReturnRequest(returnOrderId, decision, reason)
    setIsReturnModalOpen(false)
    setReturnOrderId(null)
    setReturnOrderReason('')
  }

  const hasTooltipReason = (order) => {
    return (
      ((order.status === ORDER_STATUS.CANCEL_REQUESTED || order.status === ORDER_STATUS.CANCELLED) && order.cancel_reason) ||
      (order.status === ORDER_STATUS.RETURN_REQUESTED && order.return_reason) ||
      (order.status === ORDER_STATUS.COMPLETED && order.return_reject_reason)
    )
  }

  const getTooltipReasonContent = (order) => {
    if (order.status === ORDER_STATUS.RETURN_REQUESTED) {
      return { title: 'Lý do yêu cầu trả hàng:', text: order.return_reason }
    }
    if (order.return_reject_reason) {
      return { title: 'Lý do từ chối trả hàng:', text: order.return_reject_reason }
    }
    return {
      title: `Lý do ${order.status === ORDER_STATUS.CANCEL_REQUESTED ? 'yêu cầu hủy' : 'hủy đơn'}:`,
      text: order.cancel_reason
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="py-4 px-4">Mã đơn hàng</th>
                <th className="py-4 px-4">Khách hàng</th>
                <th className="py-4 px-4 text-right">Tổng tiền</th>
                <th className="py-4 px-4 text-right">Phí sàn</th>
                <th className="py-4 px-4 text-right">Thực nhận</th>
                <th className="py-4 px-4 text-center">PTTT</th>
                <th className="py-4 px-4 text-center">Ngày đặt</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-16 text-gray-400 font-medium">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isChecked = selectedIds.includes(order.id)
                  const StatusBadge = getStatusBadge(order.status)
                  const PaymentBadge = getPaymentMethodBadge(order.payment_method)
                  const actions = getStatusActions(order.status)
                  const showCancelRequest = order.status === ORDER_STATUS.CANCEL_REQUESTED
                  const showReturnRequest = order.status === ORDER_STATUS.RETURN_REQUESTED
                  const showTooltipReason = hasTooltipReason(order)
                  const tooltipContent = getTooltipReasonContent(order)
                  const { fee, netAmount } = calculateNetAmount(order.total_amount, order.commission_rate_snapshot)

                  return (
                    <tr key={order.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-brand-primary/5' : ''}`}>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                          checked={isChecked}
                          onChange={() => onSelectRow(order.id)}
                          disabled={order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-extrabold text-gray-800">#{order.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{order.recipient_name || '—'}</span>
                          {order.recipient_phone && (
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FiPhone size={10} />
                              {order.recipient_phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-brand-primary">{formatPrice(order.total_amount)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-amber-600">{formatPrice(fee)}</span>
                          <span className="text-[10px] text-gray-400">({order.commission_rate_snapshot}%)</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-green-600">{formatPrice(netAmount)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${PaymentBadge.className}`}>
                          <PaymentBadge.icon size={10} />
                          {PaymentBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {showTooltipReason ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${StatusBadge.className}`}>
                                    <StatusBadge.icon size={12} />
                                    {StatusBadge.label}
                                    <FiInfo size={10} className="opacity-70" />
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] rounded-lg bg-gray-800 text-white text-xs border-none font-semibold p-3">
                                <p className="font-bold mb-1">{tooltipContent.title}</p>
                                <p className="text-gray-300 break-words">{tooltipContent.text}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${StatusBadge.className}`}>
                              <StatusBadge.icon size={12} />
                              {StatusBadge.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Xem chi tiết */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={`/vendor/orders/detail/${order.id}`}
                                className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                              >
                                <FiEye size={13} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                              Xem chi tiết
                            </TooltipContent>
                          </Tooltip>

                          {/* Xử lý yêu cầu hủy */}
                          {showCancelRequest && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleOpenCancelModal(order.id, order.cancel_reason)}
                                  className="inline-flex p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                                >
                                  <FiAlertCircle size={13} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-lg bg-orange-600 text-white text-xs border-none font-semibold">
                                Xử lý yêu cầu hủy
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Xử lý yêu cầu trả hàng */}
                          {showReturnRequest && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleOpenReturnModal(order.id, order.return_reason)}
                                  className="inline-flex p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                                >
                                  <FiRefreshCw size={13} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-lg bg-orange-600 text-white text-xs border-none font-semibold">
                                Xử lý yêu cầu trả hàng
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Cập nhật trạng thái */}
                          {actions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-1.5 p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200">
                                  <FiCheckCircle size={13} />
                                  <FiChevronDown size={10} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="rounded-xl shadow-lg border-gray-100 min-w-[180px] z-50">
                                {actions.map((action) => (
                                  <DropdownMenuItem
                                    key={action.value}
                                    onClick={() => action.value === 'assign_shipper'
                                      ? onAssignShipper(order.id)
                                      : onUpdateStatus(order.id, action.value)
                                    }
                                    className="text-xs font-bold cursor-pointer py-2.5 gap-2"
                                  >
                                    <action.icon size={14} className={action.color} />
                                    <span className={action.color}>{action.label}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        customerReason={cancelOrderReason}
        isLoading={false}
      />

      <ReturnRequestModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
        customerReason={returnOrderReason}
        isLoading={false}
      />
    </>
  )
}