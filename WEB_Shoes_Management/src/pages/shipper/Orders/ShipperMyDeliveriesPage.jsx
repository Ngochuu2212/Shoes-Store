import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiPhone, FiTruck, FiCamera, FiCheck, FiPackage, FiX, FiUpload } from 'react-icons/fi'
import { shipperApiService } from '~/services/shipper/shipperApiService'
import { toast } from 'react-toastify'
import { Pagination } from '~/components/common/Pagination'
import { formatPrice } from '~/utils/formatters'

// Badge trạng thái
const StatusBadge = ({ status }) => {
  const MAP = {
    accepted_by_shipper: { label: 'Đã nhận', cls: 'bg-blue-100 text-blue-700' },
    shipping: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-700' },
    delivered: { label: 'Đã giao - chờ xác nhận', cls: 'bg-purple-100 text-purple-700' }
  }
  const cfg = MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
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
  const canStart = order.status === 'accepted_by_shipper'
  const canMarkDelivered = order.status === 'shipping'
  const canComplete = order.status === 'delivered' && order.delivery_proof_images?.length > 0
  const needsProof = order.status === 'delivered' && (!order.delivery_proof_images || order.delivery_proof_images.length === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800">Đơn #{order.id}</p>
          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
        <div className="flex items-start gap-2">
          <FiMapPin size={13} className="mt-0.5 text-gray-400 shrink-0" />
          <div>
            <p className="font-medium text-gray-700">{order.recipient_name}</p>
            <p className="text-xs text-gray-400 line-clamp-1">{order.shipping_address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FiPhone size={13} className="text-gray-400" />
          <span>{order.recipient_phone}</span>
        </div>
      </div>

      {/* Proof images preview */}
      {order.delivery_proof_images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {order.delivery_proof_images.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt="proof" className="w-12 h-12 object-cover rounded-lg border" />
          ))}
          {order.delivery_proof_images.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              +{order.delivery_proof_images.length - 3}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <p className="text-sm font-bold text-gray-800">{formatPrice(order.total_amount)}</p>
        <div className="flex gap-2">
          {canStart && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => onAction('start', order.id)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200">
              <FiTruck size={12} /> Bắt đầu giao
            </motion.button>
          )}
          {canMarkDelivered && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => onAction('delivered', order.id)} className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200">
              <FiCheck size={12} /> Đã giao
            </motion.button>
          )}
          {needsProof && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => onOpenUpload(order.id)} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200">
              <FiCamera size={12} /> Upload ảnh
            </motion.button>
          )}
          {canComplete && (
            <>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => onOpenUpload(order.id)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200">
                <FiCamera size={12} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => onAction('complete', order.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200">
                <FiCheck size={12} /> Hoàn tất
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const ShipperMyDeliveriesPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [uploadOrderId, setUploadOrderId] = useState(null)

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const data = await shipperApiService.getMyDeliveries(page, 10)
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAction = async (action, orderId) => {
    try {
      if (action === 'start') await shipperApiService.startDelivery(orderId)
      else if (action === 'delivered') await shipperApiService.markDelivered(orderId)
      else if (action === 'complete') await shipperApiService.completeDelivery(orderId)
      toast.success('Cập nhật thành công!')
      fetchOrders(pagination.currentPage)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đơn đang giao</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý các đơn hàng bạn đang xử lý</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-52 animate-pulse bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiPackage size={48} className="mx-auto mb-3 opacity-40" />
          <p>Bạn chưa có đơn hàng đang giao</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={{ ...order, delivery_proof_images: typeof order.delivery_proof_images === 'string' ? JSON.parse(order.delivery_proof_images || '[]') : (order.delivery_proof_images || []) }}
                onAction={handleAction}
                onOpenUpload={setUploadOrderId}
              />
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

      {uploadOrderId && (
        <UploadProofModal
          orderId={uploadOrderId}
          onClose={() => setUploadOrderId(null)}
          onSuccess={() => { setUploadOrderId(null); fetchOrders(pagination.currentPage) }}
        />
      )}
    </div>
  )
}
