import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiHome, FiUser, FiMail, FiPhone, FiMapPin,
  FiStar, FiPackage, FiDollarSign, FiClock, FiCheckCircle,
  FiXCircle, FiEye, FiCalendar, FiExternalLink
} from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { formatDateTime, formatRelativeTime, getImageUrl, formatPrice } from '~/utils/formatters'
import { managerStoreApiService } from '~/services/manager/managerStoreApiService'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { StoreProductsList } from './StoreProductsList'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerStoreDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  usePageTitle(
    store ? `Cửa hàng ${store.owner_name}` : 'Chi tiết cửa hàng',
    store ? `Xem chi tiết cửa hàng ${store.owner_name} - ${store.owner_name}` : 'Xem chi tiết cửa hàng'
  )

  const fetchStoreDetail = async () => {
    try {
      setLoading(true)
      const res = await managerStoreApiService.getStoreDetail(id)
      setStore(res)
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin cửa hàng')
      navigate('/manager/stores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStoreDetail()
  }, [id])

  const handleApprove = async () => {
    try {
      const res = await managerStoreApiService.approveStoreSingle(id)
      toast.success(res.message)
      fetchStoreDetail()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleReject = () => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      title: 'Từ chối cửa hàng',
      message: 'Vui lòng nhập lý do từ chối đăng ký cửa hàng. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do từ chối...'
    })
  }

  const handleBan = () => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      title: 'Khóa cửa hàng',
      message: 'Vui lòng nhập lý do khóa cửa hàng. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do khóa...'
    })
  }

  const handleModalConfirm = async (reason) => {
    setIsLoading(true)
    try {
      if (modalConfig.type === 'reject') {
        const res = await managerStoreApiService.rejectStoreSingle(id, reason)
        toast.success(res.message)
        navigate('/manager/stores')
      } else if (modalConfig.type === 'ban') {
        const res = await managerStoreApiService.banStoreSingle(id, reason)
        toast.success(res.message)
        fetchStoreDetail()
      }
      setModalConfig({ isOpen: false, type: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isPending = store?.is_active === 0 && (!store?.owner_role || store?.owner_role !== 'VENDOR')
  const isBanned = store?.is_active === 0 && store?.owner_role === 'VENDOR'
  const isActive = store?.is_active === 1
  const rating = Number(store?.rating_average) || 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải thông tin cửa hàng...
        </motion.span>
      </div>
    )
  }

  if (!store) return null

  const logoUrl = getImageUrl(store.logo, 'https://placehold.co/200x200?text=Store')
  const bannerUrl = getImageUrl(store.banner, 'https://placehold.co/1200x300?text=Banner')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/manager/stores')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">{store.owner_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Mã cửa hàng: #{store.id}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          {isPending && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-green-500/20 cursor-pointer"
              >
                <FiCheckCircle size={16} />
                Phê duyệt
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-red-500/20 cursor-pointer"
              >
                <FiXCircle size={16} />
                Từ chối
              </motion.button>
            </>
          )}
          {isActive && (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBan}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-red-500/20 cursor-pointer"
            >
              <FaBan size={16} />
              Khóa cửa hàng
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-r from-gray-200 to-gray-300 shadow-md"
      >
        <img
          src={bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
      </motion.div>

      {/* Thông tin cửa hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="relative"
              >
                <img
                  src={logoUrl}
                  alt={store.owner_name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg -mt-20 bg-white"
                />
              </motion.div>
              <h2 className="text-xl font-black text-gray-900 mt-4">{store.owner_name}</h2>
              <div className="flex items-center gap-1 mt-2">
                <FiStar className="text-yellow-500 fill-yellow-500" size={16} />
                <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">/5</span>
              </div>
              <div className="mt-4 w-full">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-center inline-block ${
                  isActive ? 'bg-green-100 text-green-700' :
                    isPending ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                }`}>
                  {isActive ? 'ĐANG HOẠT ĐỘNG' : isPending ? 'CHỜ DUYỆT' : 'ĐÃ KHÓA'}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 text-sm">
                <FiHome className="text-gray-400" size={16} />
                <span className="text-gray-600">Số dư ví: <strong className="text-brand-primary">{formatPrice(store.balance)}</strong></span>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 text-sm">
                <FiPackage className="text-gray-400" size={16} />
                <span className="text-gray-600">Tổng sản phẩm: <strong>{store.total_products || 0}</strong></span>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 text-sm">
                <FiCalendar className="text-gray-400" size={16} />
                <span className="text-gray-600">Ngày tham gia: <strong>{formatDateTime(store.created_at)}</strong></span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Cột phải */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin liên hệ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <FiUser className="text-brand-primary" size={16} />
              </div>
              Thông tin chủ sở hữu
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-1">
                <FiUser size={16} className="text-gray-400" />
                <span className="text-gray-600"><strong className="font-semibold text-gray-800">Tên chủ shop:</strong> {store.owner_name}</span>
              </div>
              <div className="flex items-center gap-3 py-1">
                <FiMail size={16} className="text-gray-400" />
                <span className="text-gray-600"><strong className="font-semibold text-gray-800">Email:</strong> {store.owner_email}</span>
              </div>
              <div className="flex items-center gap-3 py-1">
                <FiPhone size={16} className="text-gray-400" />
                <span className="text-gray-600"><strong className="font-semibold text-gray-800">Số điện thoại:</strong> {store.owner_phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-3 py-1">
                <FiClock size={16} className="text-gray-400" />
                <span className="text-gray-600"><strong className="font-semibold text-gray-800">Ngày tham gia:</strong> {formatDateTime(store.owner_joined_at)} <span className="text-gray-400 text-xs">({formatRelativeTime(store.owner_joined_at)})</span></span>
              </div>
            </div>
          </motion.div>

          {/* Địa chỉ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <FiMapPin className="text-brand-primary" size={16} />
              </div>
              Địa chỉ cửa hàng
            </h3>
            <div className="flex items-start gap-2">
              <FiMapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-600 leading-relaxed">{store.address || 'Chưa cập nhật địa chỉ'}</p>
            </div>
          </motion.div>

          {/* Giới thiệu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <FiEye className="text-brand-primary" size={16} />
              </div>
              Giới thiệu
            </h3>
            <div className="flex items-start gap-2">
              <FiEye size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-600 leading-relaxed">{store.bio || 'Chưa có giới thiệu'}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Danh sách sản phẩm của cửa hàng */}
      <StoreProductsList storeId={store.id} storeName={store.owner_name} />

      <ConfirmReasonModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
      />
    </motion.div>
  )
}