import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiCheckCircle, FiXCircle, FiPackage, FiImage, FiRefreshCw } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Pagination } from '~/components/common/Pagination'
import { formatPrice } from '~/utils/formatters'

const HISTORY_STATUS = {
  completed: { label: 'Hoàn tất', cls: 'bg-green-100 text-green-700', border: 'border-l-green-400', icon: FiCheckCircle },
  cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-700', border: 'border-l-red-400', icon: FiXCircle },
  return_completed: { label: 'Đã hoàn trả', cls: 'bg-green-100 text-green-700', border: 'border-l-green-400', icon: FiCheckCircle }
}

const StatusBadge = ({ status }) => {
  const cfg = HISTORY_STATUS[status] || { label: status, cls: 'bg-gray-100 text-gray-600', icon: FiPackage }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

const OrderCard = ({ order }) => {
  const proofImages = typeof order.delivery_proof_images === 'string'
    ? JSON.parse(order.delivery_proof_images || '[]')
    : (order.delivery_proof_images || [])
  const statusCfg = HISTORY_STATUS[order.status] || { border: 'border-l-gray-300' }
  const isCompleted = order.status === 'completed' || order.status === 'return_completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 border-l-4 ${statusCfg.border} overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${isCompleted ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              {isCompleted
                ? <FiCheckCircle size={18} className="text-green-500" />
                : <FiXCircle size={18} className="text-red-400" />
              }
            </div>
            <div>
              <p className="font-extrabold text-gray-800 text-sm">Đơn #{order.id}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {order.delivery_completed_at
                  ? `Hoàn tất: ${new Date(order.delivery_completed_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                  : new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Recipient / Return Store */}
        <div className="flex items-start gap-2.5 mb-4">
          <FiMapPin size={14} className="mt-0.5 text-orange-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              {order.status === 'return_completed' ? 'Cửa hàng nhận hàng trả' : 'Người nhận'}
            </p>
            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">
              {order.status === 'return_completed' ? order.store_name : order.recipient_name}
            </p>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {order.status === 'return_completed' ? order.store_address : order.shipping_address}
            </p>
          </div>
        </div>

        {/* Proof images */}
        {proofImages.length > 0 && (
          <div className="mb-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
              <FiImage size={12} /> Ảnh minh chứng ({proofImages.length})
            </p>
            <div className="flex gap-2">
              {proofImages.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="proof" className="w-12 h-12 object-cover rounded-xl border border-gray-250 hover:scale-105 transition-transform" />
              ))}
              {proofImages.length > 4 && (
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-extrabold">
                  +{proofImages.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {order.delivery_note && (
          <p className="text-xs text-gray-500 italic mb-4 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">📝 {order.delivery_note}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Tổng tiền</p>
            <p className="text-xl font-black text-gray-800 mt-0.5">{formatPrice(order.total_amount)}</p>
          </div>
          {proofImages.length === 0 && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              <FiImage size={13} /> Không có ảnh
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const ShipperHistoryPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })

  const fetchOrders = async (page = 1, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await shipperApiService.getDeliveryHistory(page, 9)
      setOrders(data.orders)
      if (data.pagination) setPagination(data.pagination)
    } catch {
      if (!silent) toast.error('Không thể tải lịch sử giao hàng')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md shadow-green-200">
            <FiCheckCircle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Lịch sử giao hàng</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? 'Đang tải...' : `${orders.length} đơn hoàn tất / hủy`}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => fetchOrders(pagination.currentPage, true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-60"
        >
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Làm mới
        </motion.button>
      </div>

      {/* Stats bar */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-sm shadow-emerald-150">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Hoàn thành</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Giao thành công</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-black shadow-sm shadow-red-150">
              {orders.filter(o => o.status === 'cancelled').length}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Đã hủy</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Giao thất bại</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-1/3 animate-pulse" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-full w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <FiCheckCircle size={36} className="text-green-300" />
          </div>
          <p className="text-gray-600 font-semibold">Chưa có lịch sử giao hàng</p>
          <p className="text-gray-400 text-sm mt-1.5">Hoàn thành đơn hàng đầu tiên của bạn</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          </AnimatePresence>
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(p) => fetchOrders(p)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
