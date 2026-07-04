import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiPackage, FiCheck } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Pagination } from '~/components/common/Pagination'
import { formatPrice } from '~/utils/formatters'

const OrderCard = ({ order, onAccept }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-bold text-gray-800">Đơn #{order.id}</p>
        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
      </div>
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Chờ nhận
      </span>
    </div>

    <div className="space-y-2 text-sm text-gray-600 mb-4">
      <div className="flex items-start gap-2">
        <FiMapPin size={14} className="mt-0.5 text-gray-400 shrink-0" />
        <div>
          <p className="font-medium text-gray-700">{order.recipient_name}</p>
          <p className="text-xs text-gray-400">{order.shipping_address}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FiPhone size={14} className="text-gray-400" />
        <span>{order.recipient_phone}</span>
      </div>
      {order.store_name && (
        <div className="flex items-center gap-2">
          <FiPackage size={14} className="text-gray-400" />
          <span>{order.store_name}</span>
        </div>
      )}
    </div>

    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-gray-800">{formatPrice(order.total_amount)}</p>
        <p className="text-xs text-gray-400">{order.payment_method} • {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
      </div>
      <button
        onClick={() => onAccept(order.id)}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
      >
        <FiCheck size={14} /> Nhận đơn
      </button>
    </div>
  </motion.div>
)

export const ShipperAvailableOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const data = await shipperApiService.getAvailableOrders(page, 10)
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAccept = async (orderId) => {
    try {
      await shipperApiService.acceptOrder(orderId)
      toast.success(`Đã nhận đơn #${orderId} thành công!`)
      fetchOrders(pagination.currentPage)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể nhận đơn hàng.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đơn chờ nhận</h1>
        <p className="text-gray-500 text-sm mt-1">Các đơn hàng đang chờ shipper nhận giao</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiPackage size={48} className="mx-auto mb-3 opacity-40" />
          <p>Chưa có đơn hàng nào đang chờ giao</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onAccept={handleAccept} />
            ))}
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
