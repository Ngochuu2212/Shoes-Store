import { motion } from 'framer-motion'
import { FiShoppingBag, FiDollarSign, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatPrice, formatDateTime } from '~/utils/formatters'

export const UserOrdersCard = ({ user }) => {
  const orderStats = user.orderStats || {
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0
  }

  const recentOrders = user.recentOrders || []

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700' },
      processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' },
      shipped: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    }
    return config[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <FiShoppingBag className="text-blue-500" size={16} />
        </div>
        Thông tin đơn hàng
      </h3>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng đơn</p>
          <p className="text-2xl font-black text-gray-900">{orderStats.totalOrders}</p>
        </div>
        <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng chi tiêu</p>
          <p className="text-lg font-black text-emerald-600">{formatPrice(orderStats.totalSpent)}</p>
        </div>
      </div>

      {/* Chi tiết trạng thái đơn hàng */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-amber-50 rounded-xl p-2 text-center">
          <FiClock className="mx-auto text-amber-500" size={14} />
          <p className="text-[10px] font-bold text-amber-600">{orderStats.pendingOrders}</p>
          <p className="text-[8px] text-amber-500">Chờ xử lý</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-2 text-center">
          <FiTruck className="mx-auto text-purple-500" size={14} />
          <p className="text-[10px] font-bold text-purple-600">{orderStats.shippingOrders}</p>
          <p className="text-[8px] text-purple-500">Đang giao</p>
        </div>
        <div className="bg-green-50 rounded-xl p-2 text-center">
          <FiCheckCircle className="mx-auto text-green-500" size={14} />
          <p className="text-[10px] font-bold text-green-600">{orderStats.deliveredOrders}</p>
          <p className="text-[8px] text-green-500">Đã giao</p>
        </div>
        <div className="bg-red-50 rounded-xl p-2 text-center">
          <FiXCircle className="mx-auto text-red-500" size={14} />
          <p className="text-[10px] font-bold text-red-600">{orderStats.cancelledOrders}</p>
          <p className="text-[8px] text-red-500">Đã hủy</p>
        </div>
      </div>

      {/* Đơn hàng gần đây */}
      {recentOrders.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-500 mb-2">Đơn hàng gần đây</p>
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const status = getStatusBadge(order.status)
              return (
                <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50/50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-800">#{order.id}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">{formatPrice(order.total_amount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="mt-4 text-center">
        <Link
          to={`/admin/orders?userId=${user.id}`}
          className="text-sm font-semibold text-emerald-600 hover:underline transition-all duration-200 inline-flex items-center gap-1"
        >
          Xem tất cả đơn hàng
          <FiPackage size={14} />
        </Link>
      </div>
    </motion.div>
  )
}