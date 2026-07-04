import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiCheckCircle, FiXCircle, FiPackage, FiImage } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Pagination } from '~/components/common/Pagination'
import { formatPrice } from '~/utils/formatters'

const StatusBadge = ({ status }) => {
  const MAP = {
    completed: { label: 'Hoàn tất', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-700' }
  }
  const cfg = MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
}

const OrderCard = ({ order }) => {
  const proofImages = typeof order.delivery_proof_images === 'string'
    ? JSON.parse(order.delivery_proof_images || '[]')
    : (order.delivery_proof_images || [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800">Đơn #{order.id}</p>
          <p className="text-xs text-gray-400">
            {order.delivery_completed_at
              ? `Hoàn tất: ${new Date(order.delivery_completed_at).toLocaleDateString('vi-VN')}`
              : new Date(order.created_at).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-600 mb-3">
        <div className="flex items-start gap-2">
          <FiMapPin size={13} className="mt-0.5 text-gray-400 shrink-0" />
          <div>
            <p className="font-medium text-gray-700">{order.recipient_name}</p>
            <p className="text-xs text-gray-400 line-clamp-1">{order.shipping_address}</p>
          </div>
        </div>
      </div>

      {proofImages.length > 0 && (
        <div className="flex gap-2 mb-3">
          {proofImages.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="proof" className="w-12 h-12 object-cover rounded-lg border" />
          ))}
          {proofImages.length > 4 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              +{proofImages.length - 4}
            </div>
          )}
        </div>
      )}

      {order.delivery_note && (
        <p className="text-xs text-gray-500 italic mb-2">📝 {order.delivery_note}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <p className="text-sm font-bold text-gray-800">{formatPrice(order.total_amount)}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FiImage size={12} />
          <span>{proofImages.length} ảnh</span>
        </div>
      </div>
    </motion.div>
  )
}

export const ShipperHistoryPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const data = await shipperApiService.getDeliveryHistory(page, 10)
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch {
      toast.error('Không thể tải lịch sử giao hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử giao hàng</h1>
        <p className="text-gray-500 text-sm mt-1">Tất cả đơn hàng đã hoàn tất hoặc bị hủy</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-44 animate-pulse bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiCheckCircle size={48} className="mx-auto mb-3 opacity-40" />
          <p>Chưa có lịch sử giao hàng</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
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
