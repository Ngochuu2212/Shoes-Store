import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiPhone, FiPackage, FiClock, FiRefreshCw,
  FiTruck, FiZap, FiAlertCircle
} from 'react-icons/fi'
import { MdOutlineDeliveryDining } from 'react-icons/md'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Pagination } from '~/components/common/Pagination'
import { formatPrice } from '~/utils/formatters'

const SHIPPING_METHOD_CONFIG = {
  standard: { label: 'Ti\u00eau chu\u1ea9n', color: 'bg-blue-100 text-blue-700', icon: FiTruck },
  express: { label: 'Nhanh', color: 'bg-orange-100 text-orange-700', icon: FiZap },
  same_day: { label: 'Ho\u1ea3 t\u1ed1c', color: 'bg-red-100 text-red-700', icon: FiAlertCircle }
}

const PAYMENT_LABEL = {
  cod: { label: 'COD', color: 'bg-yellow-100 text-yellow-700' },
  vnpay: { label: 'VNPAY', color: 'bg-purple-100 text-purple-700' },
  momo: { label: 'MoMo', color: 'bg-pink-100 text-pink-700' },
  wallet: { label: 'V\u00ed', color: 'bg-green-100 text-green-700' }
}

const OrderCard = ({ order, onAccept, accepting }) => {
  const shippingCfg = SHIPPING_METHOD_CONFIG[order.shipping_method] || SHIPPING_METHOD_CONFIG.standard
  const ShippingIcon = shippingCfg.icon
  const paymentCfg = PAYMENT_LABEL[order.payment_method] || { label: order.payment_method, color: 'bg-gray-100 text-gray-600' }
  const isAccepting = accepting === order.id

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <FiPackage size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">\u0110\u01a1n #{order.id}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 whitespace-nowrap">
            \u23f3 Ch\u1edd nh\u1eadn
          </span>
        </div>

        {/* Store */}
        <div className="flex items-center gap-2 mb-3.5 pb-3.5 border-b border-gray-50">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
            {order.store_name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <p className="text-sm font-semibold text-gray-700 truncate">{order.store_name || 'C\u1eeda h\u00e0ng'}</p>
        </div>

        {/* Recipient */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2.5">
            <FiMapPin size={13} className="mt-0.5 text-orange-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{order.recipient_name}</p>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mt-0.5">{order.shipping_address}</p>
            </div>
          </div>
          {order.recipient_phone && (
            <div className="flex items-center gap-2.5">
              <FiPhone size={13} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">{order.recipient_phone}</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${shippingCfg.color}`}>
            <ShippingIcon size={10} />
            {shippingCfg.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${paymentCfg.color}`}>
            {paymentCfg.label}
          </span>
          {order.payment_status === 'paid' && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
              \u0110\u00e3 thanh to\u00e1n
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Gi\u00e1 tr\u1ecb \u0111\u01a1n</p>
            <p className="text-xl font-extrabold text-orange-600">{formatPrice(order.total_amount)}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => onAccept(order.id)}
            disabled={isAccepting}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm shadow-orange-200 transition-all duration-200"
          >
            {isAccepting
              ? <FiRefreshCw size={14} className="animate-spin" />
              : <MdOutlineDeliveryDining size={17} />
            }
            {isAccepting ? '\u0110ang nh\u1eadn...' : 'Nh\u1eadn \u0111\u01a1n'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export const ShipperAvailableOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [accepting, setAccepting] = useState(null)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })

  const fetchOrders = async (page = 1, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await shipperApiService.getAvailableOrders(page, 9)
      setOrders(data.orders || data)
      if (data.pagination) setPagination(data.pagination)
    } catch {
      if (!silent) toast.error('Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch \u0111\u01a1n h\u00e0ng')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAccept = async (orderId) => {
    setAccepting(orderId)
    try {
      await shipperApiService.acceptOrder(orderId)
      toast.success(`\u2705 \u0110\u00e3 nh\u1eadn \u0111\u01a1n #${orderId} th\u00e0nh c\u00f4ng!`)
      fetchOrders(pagination.currentPage, true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kh\u00f4ng th\u1ec3 nh\u1eadn \u0111\u01a1n h\u00e0ng')
    } finally {
      setAccepting(null)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">
            <FiClock size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">\u0110\u01a1n ch\u1edd nh\u1eadn</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? '\u0110ang t\u1ea3i...' : `${orders.length} \u0111\u01a1n \u0111ang ch\u1edd shipper`}
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
          L\u00e0m m\u1edbi
        </motion.button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-1.5 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                    <div className="h-2.5 bg-gray-100 rounded-full w-1/3 animate-pulse" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-full w-4/5 animate-pulse" />
                <div className="h-9 bg-gray-100 rounded-xl animate-pulse mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <FiPackage size={36} className="text-orange-300" />
          </div>
          <p className="text-gray-600 font-semibold">Kh\u00f4ng c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o \u0111ang ch\u1edd</p>
          <p className="text-gray-400 text-sm mt-1.5">H\u00e3y quay l\u1ea1i sau ho\u1eb7c nh\u1ea5n &quot;L\u00e0m m\u1edbi&quot;</p>
          <button
            onClick={() => fetchOrders()}
            className="mt-5 px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            T\u1ea3i l\u1ea1i ngay
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} onAccept={handleAccept} accepting={accepting} />
              ))}
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
