import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiPhone, FiTruck, FiCamera, FiCheck, FiPackage, FiX, FiUpload, FiRefreshCw, FiCheckCircle } from 'react-icons/fi'
import { MdOutlineDeliveryDining } from 'react-icons/md'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Pagination } from '~/components/common/Pagination'
import { formatPrice } from '~/utils/formatters'

const STATUS_CONFIG = {
  accepted_by_shipper: { label: 'Đã nhận đơn', cls: 'bg-blue-100 text-blue-700', border: 'border-l-blue-400', dot: 'bg-blue-400' },
  shipping: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400', dot: 'bg-orange-400' },
  delivered: { label: 'Đã giao - chờ xác nhận', cls: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', dot: 'bg-purple-400' },
  
  // Trạng thái trả hàng
  return_accepted_by_shipper: { label: 'Đơn trả - Đã nhận', cls: 'bg-blue-100 text-blue-700', border: 'border-l-blue-400', dot: 'bg-blue-400' },
  return_shipping: { label: 'Đơn trả - Đang thu hồi', cls: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400', dot: 'bg-orange-400' },
  return_delivered: { label: 'Đơn trả - Đã giao Shop', cls: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', dot: 'bg-purple-400' }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot || 'bg-gray-400'}`} />
      {cfg.label}
    </span>
  )
}

// Modal upload ảnh minh chứng
const UploadProofModal = ({ orderId, onClose, onSuccess }) => {
  const [files, setFiles] = useState([])
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected].slice(0, 5))
  }

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index))

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Vui lòng chọn ít nhất 1 ảnh'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('proofImages', f))
      if (note) formData.append('note', note)
      await shipperApiService.uploadDeliveryProof(orderId, formData)
      toast.success('Đã upload ảnh minh chứng thành công!')
      onSuccess()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">Upload ảnh minh chứng - Đơn #{orderId}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><FiX size={18} /></button>
          </div>

          {/* File picker */}
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex flex-col items-center gap-2 mb-4"
          >
            <FiUpload size={24} />
            <span className="text-sm">Click để chọn ảnh (tối đa 5 ảnh)</span>
          </button>

          {/* Preview */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hidden group-hover:flex"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú (tùy chọn): Ví dụ: Đã giao trước cửa, khách không có nhà..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none h-20 mb-4 focus:outline-none focus:border-orange-400"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? <span className="animate-spin">⏳</span> : <FiCamera size={16} />}
            {uploading ? 'Đang upload...' : 'Upload ảnh minh chứng'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const OrderCard = ({ order, onAction, onOpenUpload }) => {
  const statusCfg = STATUS_CONFIG[order.status] || { border: 'border-l-gray-300' }
  const isReturn = order.status?.startsWith('return_')
  const canStart = order.status === 'accepted_by_shipper' || order.status === 'return_accepted_by_shipper'
  const canMarkDelivered = order.status === 'shipping' || order.status === 'return_shipping'
  const isDeliveredState = order.status === 'delivered' || order.status === 'return_delivered'
  const needsProof = isDeliveredState && (!order.delivery_proof_images || order.delivery_proof_images.length === 0)
  const canComplete = isDeliveredState && order.delivery_proof_images?.length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 border-l-4 ${statusCfg.border} overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
              <FiTruck size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="font-extrabold text-gray-800 text-sm">Đơn #{order.id}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Store info if return */}
        {isReturn && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide mb-1">Cửa hàng nhận trả</p>
            <p className="text-sm font-bold text-gray-700">{order.store_name}</p>
          </div>
        )}

        {/* Recipient */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-2.5">
            <FiMapPin size={14} className="mt-0.5 text-orange-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {isReturn ? 'Địa chỉ lấy hàng (Khách hàng)' : 'Người nhận & Địa chỉ'}
              </p>
              <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{order.recipient_name}</p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-0.5">{order.shipping_address}</p>
            </div>
          </div>
          {order.recipient_phone && (
            <div className="flex items-center gap-2.5 pt-1">
              <FiPhone size={13} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-600 font-semibold">{order.recipient_phone}</p>
            </div>
          )}
        </div>

        {/* Proof images */}
        {order.delivery_proof_images?.length > 0 && (
          <div className="mb-5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <p className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>✅ Ảnh minh chứng ({order.delivery_proof_images.length})</span>
            </p>
            <div className="flex gap-2">
              {order.delivery_proof_images.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="proof" className="w-12 h-12 object-cover rounded-xl border border-emerald-250 hover:scale-105 transition-transform" />
              ))}
              {order.delivery_proof_images.length > 4 && (
                <div className="w-12 h-12 rounded-xl bg-emerald-100/50 border border-emerald-250 flex items-center justify-center text-xs text-emerald-750 font-bold">
                  +{order.delivery_proof_images.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {needsProof && (
          <div className="mb-5 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium">
            ⚠️ Vui lòng chụp/tải ảnh xác nhận giao hàng.
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {isReturn ? 'Hoàn trả lại khách' : 'Giá trị đơn'}
            </p>
            <p className="text-2xl font-black text-gray-800 tracking-tight mt-0.5">{formatPrice(order.total_amount)}</p>
          </div>
          <div className="flex gap-2">
            {canStart && (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAction('start', order.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all duration-200 shadow-md shadow-blue-100 cursor-pointer"
              >
                <MdOutlineDeliveryDining size={16} />
                <span>{isReturn ? 'Bắt đầu đi lấy' : 'Bắt đầu giao'}</span>
              </motion.button>
            )}
            {canMarkDelivered && (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAction('delivered', order.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl text-xs font-bold transition-all duration-200 shadow-md shadow-purple-100 cursor-pointer"
              >
                <FiCheck size={14} />
                <span>{isReturn ? 'Đã lấy hàng' : 'Đã giao'}</span>
              </motion.button>
            )}
            {needsProof && (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onOpenUpload(order.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-all duration-200 shadow-md shadow-orange-100 cursor-pointer"
              >
                <FiCamera size={14} />
                <span>Upload ảnh</span>
              </motion.button>
            )}
            {canComplete && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenUpload(order.id)}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-250 text-gray-600 rounded-2xl text-sm transition-all duration-200 cursor-pointer border border-gray-200"
                >
                  <FiCamera size={15} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onAction('complete', order.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all duration-200 shadow-md shadow-emerald-100 cursor-pointer"
                >
                  <FiCheckCircle size={14} />
                  <span>Hoàn tất</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const ShipperMyDeliveriesPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [uploadOrderId, setUploadOrderId] = useState(null)

  const parseProofs = (order) => ({
    ...order,
    delivery_proof_images: typeof order.delivery_proof_images === 'string'
      ? JSON.parse(order.delivery_proof_images || '[]')
      : (order.delivery_proof_images || [])
  })

  const fetchOrders = async (page = 1, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await shipperApiService.getMyDeliveries(page, 9)
      setOrders((data.orders || []).map(parseProofs))
      if (data.pagination) setPagination(data.pagination)
    } catch {
      if (!silent) toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAction = async (action, orderId) => {
    try {
      if (action === 'start') await shipperApiService.startDelivery(orderId)
      else if (action === 'delivered') await shipperApiService.markDelivered(orderId)
      else if (action === 'complete') await shipperApiService.completeDelivery(orderId)
      toast.success('✅ Cập nhật thành công!')
      fetchOrders(pagination.currentPage, true)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-200">
            <FiTruck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Đang giao</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? 'Đang tải...' : `${orders.length} đơn hàng`}
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

      {/* Status breakdown bar */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shadow-sm shadow-blue-150">
              {orders.filter(o => o.status === 'accepted_by_shipper').length}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Đã nhận</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Chờ xuất phát</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shadow-sm shadow-orange-150">
              {orders.filter(o => o.status === 'shipping').length}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Đang giao</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Đang trên đường</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black shadow-sm shadow-purple-150">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Đã giao</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Chờ hoàn tất</p>
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
              <div className="h-3 bg-gray-100 rounded-full w-4/5 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded-xl animate-pulse mt-2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <FiPackage size={36} className="text-blue-300" />
          </div>
          <p className="text-gray-600 font-semibold">Bạn chưa có đơn hàng đang giao</p>
          <p className="text-gray-400 text-sm mt-1.5">Hãy nhận đơn từ mục &quot;Đơn chờ nhận&quot;</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={handleAction}
                  onOpenUpload={setUploadOrderId}
                />
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

      {uploadOrderId && (
        <UploadProofModal
          orderId={uploadOrderId}
          onClose={() => setUploadOrderId(null)}
          onSuccess={() => { setUploadOrderId(null); fetchOrders(pagination.currentPage, true) }}
        />
      )}
    </div>
  )
}
