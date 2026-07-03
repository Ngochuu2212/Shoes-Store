import { formatDateTime, formatPrice, getImageUrl } from '~/utils/formatters'
import {
  FiEye, FiMoreVertical, FiShoppingBag, FiUser, FiHome,
  FiClock, FiPackage, FiTruck, FiCheckCircle, FiXCircle,
  FiInfo
} from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constant'

export const OrderTable = ({ orders, onForceCancel }) => {
  const getStatusConfig = (status) => {
    const config = {
      [ORDER_STATUS.PENDING]: {
        label: 'Chờ xử lý',
        icon: FiClock,
        color: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      [ORDER_STATUS.PROCESSING]: {
        label: 'Đang xử lý',
        icon: FiPackage,
        color: 'bg-purple-50 text-purple-600 border-purple-200'
      },
      [ORDER_STATUS.SHIPPED]: {
        label: 'Đang giao',
        icon: FiTruck,
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
      },
      [ORDER_STATUS.DELIVERED]: {
        label: 'Đã giao',
        icon: FiCheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200'
      },
      [ORDER_STATUS.CANCELLED]: {
        label: 'Đã hủy',
        icon: FiXCircle,
        color: 'bg-red-50 text-red-600 border-red-200'
      }
    }
    return config[status] || config[ORDER_STATUS.PENDING]
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    if (paymentStatus === PAYMENT_STATUS.PAID) {
      return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Đã thanh toán</span>
    } else if (paymentStatus === PAYMENT_STATUS.REFUNDED) {
      return <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Đã hoàn tiền</span>
    }
    return <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">Chưa thanh toán</span>
  }

  // Hàm hiển thị trạng thái với tooltip nếu có cancel_reason
  const renderStatusBadge = (order) => {
    const statusConfig = getStatusConfig(order.status)
    const StatusIcon = statusConfig.icon

    // Nếu là đơn hàng đã hủy và có cancel_reason
    if (order.status === ORDER_STATUS.CANCELLED && order.cancel_reason) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color} cursor-help`}>
              <StatusIcon size={12} />
              {statusConfig.label}
              <FiInfo size={10} className="opacity-70" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-3">
            <p className="font-semibold mb-1 text-emerald-400">Lý do hủy:</p>
            <p className="break-words text-gray-200">{order.cancel_reason}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    // Nếu là đơn hàng đã hủy nhưng không có lý do
    if (order.status === ORDER_STATUS.CANCELLED) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
          <StatusIcon size={12} />
          {statusConfig.label}
        </span>
      )
    }

    // Các trạng thái khác
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
        <StatusIcon size={12} />
        {statusConfig.label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-4 min-w-[100px]">Mã đơn</th>
              <th className="py-4 px-4 min-w-[180px]">Khách hàng</th>
              <th className="py-4 px-4 min-w-[180px]">Cửa hàng</th>
              <th className="py-4 px-4 text-center">Tổng tiền</th>
              <th className="py-4 px-4 text-center">Thanh toán</th>
              <th className="py-4 px-4 text-center min-w-[140px]">Trạng thái</th>
              <th className="py-4 px-4 text-center">Ngày tạo</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isCancellable = order.status !== ORDER_STATUS.DELIVERED &&
                                     order.status !== ORDER_STATUS.CANCELLED

                const buyerAvatar = getImageUrl(order.buyer_avatar,
                  `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(order.buyer_name || 'User')}`)
                const storeLogo = getImageUrl(order.store_logo,
                  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(order.store_name || 'Store')}`)

                return (
                  <tr key={order.order_id} className="hover:bg-gray-50/40 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-extrabold text-emerald-600">#{order.order_id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={buyerAvatar}
                          alt={order.buyer_name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{order.buyer_name}</p>
                          <p className="text-[10px] text-gray-400">ID: {order.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={storeLogo}
                          alt={order.store_name}
                          className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{order.store_name}</p>
                          <p className="text-[10px] text-gray-400">ID: {order.store_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-emerald-600">
                        {formatPrice(order.total_amount)}
                      </span>
                      {order.discount_amount > 0 && (
                        <p className="text-[10px] text-red-400">-{formatPrice(order.discount_amount)}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center min-w-[130px]">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {renderStatusBadge(order)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(order.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/admin/orders/${order.order_id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {/* Dropdown hành động */}
                        {isCancellable && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200">
                                <FiMoreVertical size={13} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100 min-w-[200px]">
                              <DropdownMenuItem
                                onClick={() => onForceCancel(order.order_id)}
                                className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                              >
                                <FiXCircle size={14} /> Ép hủy đơn hàng
                              </DropdownMenuItem>
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
  )
}