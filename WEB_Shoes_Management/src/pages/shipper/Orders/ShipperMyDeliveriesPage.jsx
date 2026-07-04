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
  delivered: { label: 'Đã giao - chờ xác nhận', cls: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', dot: 'bg-purple-400' }
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
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
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
  const canStart = order.status === 'accepted_by_shipper'
  const canMarkDelivered = order.status === 'shipping'
  const needsProof = order.status === 'delivered' && (!order.delivery_proof_images || order.delivery_proof_images.length === 0)
  const canComplete = order.status === 'delivered' && order.delivery_proof_images?.length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${statusCfg.border} overflow-hidden hover:shadow-md transition-all duration-200`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <FiTruck size={15} className="text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Đơn #{order.id}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
          <StatusBadge status={order.status} />
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

        {/* Proof images */}
        {order.delivery_proof_images?.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
            <p className="text-[11px] text-green-700 font-medium mb-2">✅ Ảnh minh chứng ({order.delivery_proof_images.length})</p>
            <div className="flex gap-1.5">
              {order.delivery_proof_images.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="proof" className="w-11 h-11 object-cover rounded-lg border border-green-200" />
              ))}
              {order.delivery_proof_images.length > 4 && (
                <div className="w-11 h-11 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center text-xs text-green-600 font-medium">
                  +{order.delivery_proof_images.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {needsProof && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
            ⚠️ Cần upload ảnh minh chứng trước khi hoàn tất
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <p className="text-base font-extrabold text-gray-800">{formatPrice(order.total_amount)}</p>
          <div className="flex gap-2">
            {canStart && (
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => onAction('start', order.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm shadow-blue-200">
                <MdOutlineDeliveryDining size={15} /> Bắt đầu giao
              </motion.button>
            )}
            {canMarkDelivered && (
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => onAction('delivered', order.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm shadow-purple-200">
                <FiCheck size={13} /> Đã giao
              </motion.button>
            )}
            {needsProof && (
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => onOpenUpload(order.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm shadow-orange-200">
                <FiCamera size={13} /> Upload ảnh
              </motion.button>
            )}
            {canComplete && (
              <>
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => onOpenUpload(order.id)}
                  className="flex items-center gap-1.5 px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition-all duration-200">
                  <FiCamera size={13} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => onAction('complete', order.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm shadow-green-200">
                  <FiCheckCircle size={13} /> Hoàn tất
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
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-2xl font-black text-blue-600">{orders.filter(o => o.status === 'accepted_by_shipper').length}</p>
            <p className="text-xs text-blue-700 font-medium mt-0.5">Đã nhận đơn</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <p className="text-2xl font-black text-orange-600">{orders.filter(o => o.status === 'shipping').length}</p>
            <p className="text-xs text-orange-700 font-medium mt-0.5">Đang giao</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <p className="text-2xl font-black text-purple-600">{orders.filter(o => o.status === 'delivered').length}</p>
            <p className="text-xs text-purple-700 font-medium mt-0.5">Chờ xác nhận</p>
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
