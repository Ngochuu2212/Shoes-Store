import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiDollarSign, FiUser, FiHome, FiCreditCard,
  FiCalendar, FiClock, FiCheckCircle, FiXCircle,
  FiInfo, FiSend, FiFileText
} from 'react-icons/fi'
import { adminPayoutApiService } from '~/services/admin/adminPayoutApiService'
import { formatDateTime, formatPrice, getImageUrl } from '~/utils/formatters' // 🆕 Thêm getImageUrl
import { PAYOUT_STATUS } from '~/utils/constant'
import { ProcessPayoutModal } from '../ProcessPayoutModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminPayoutDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payout, setPayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  usePageTitle(
    payout ? `Yêu cầu rút tiền #${payout.id}` : 'Chi tiết yêu cầu rút tiền',
    payout ? `Xem chi tiết yêu cầu rút tiền #${payout.id} của ${payout.store_name}` : 'Xem chi tiết yêu cầu rút tiền'
  )

  const fetchPayoutDetail = async () => {
    try {
      setLoading(true)
      const res = await adminPayoutApiService.getPayoutDetail(id)
      setPayout(res)
    } catch (error) {
      toast.error(error.message || 'Không thể tải chi tiết yêu cầu rút tiền')
      navigate('/admin/payouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchPayoutDetail()
  }, [id])

  const getStatusConfig = (status) => {
    const config = {
      [PAYOUT_STATUS.PENDING]: {
        label: 'Đang chờ duyệt',
        icon: FiClock,
        color: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      [PAYOUT_STATUS.APPROVED]: {
        label: 'Đã duyệt',
        icon: FiCheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200'
      },
      [PAYOUT_STATUS.REJECTED]: {
        label: 'Đã từ chối',
        icon: FiXCircle,
        color: 'bg-red-50 text-red-600 border-red-200'
      }
    }
    return config[status] || config[PAYOUT_STATUS.PENDING]
  }

  const handleProcessPayout = async (targetStatus, adminNote) => {
    setIsSubmitting(true)
    try {
      const res = await adminPayoutApiService.processPayout(id, targetStatus, adminNote)
      toast.success(res.message)
      setIsProcessModalOpen(false)
      fetchPayoutDetail()
    } catch (error) {
      toast.error(error.message || 'Xử lý yêu cầu thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải chi tiết yêu cầu rút tiền...
        </motion.span>
      </div>
    )
  }

  if (!payout) return null

  const statusConfig = getStatusConfig(payout.status)
  const StatusIcon = statusConfig.icon
  const isPending = payout.status === PAYOUT_STATUS.PENDING

  const storeLogo = getImageUrl(payout.logo,
    `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(payout.store_name || 'Store')}`)
  const vendorAvatar = getImageUrl(payout.avatar,
    `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(payout.vendor_name || 'User')}`)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/payouts')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Yêu cầu rút tiền #{payout.id}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                <StatusIcon size={14} />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FiCalendar size={14} className="text-gray-400" />
              {formatDateTime(payout.created_at)}
            </p>
          </div>
        </div>

        {isPending && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProcessModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
          >
            <FiSend size={16} />
            Xử lý yêu cầu
          </motion.button>
        )}
      </motion.div>

      {/* Thông tin chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin cửa hàng */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FiHome className="text-emerald-500" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin cửa hàng</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Logo cửa hàng */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <img
                src={storeLogo}
                alt={payout.store_name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200"
              />
              <div>
                <p className="text-[10px] font-bold text-gray-400">Tên cửa hàng</p>
                <p className="font-bold text-gray-800">{payout.store_name}</p>
                <p className="text-xs text-gray-500">ID: {payout.store_id}</p>
              </div>
            </div>

            {/* Avatar chủ shop */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <img
                src={vendorAvatar}
                alt={payout.vendor_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <p className="text-[10px] font-bold text-gray-400">Chủ cửa hàng</p>
                <p className="font-semibold text-gray-700">{payout.vendor_name}</p>
                <p className="text-xs text-gray-500">{payout.vendor_email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Thông tin rút tiền */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FiDollarSign className="text-purple-500" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin rút tiền</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-gray-400">Số tiền yêu cầu</p>
              <p className="text-2xl font-black text-emerald-600">{formatPrice(payout.amount)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">Ngân hàng</p>
                <p className="font-semibold text-gray-700 text-sm">{payout.bank_name}</p>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">Số tài khoản</p>
                <p className="font-semibold text-gray-700 text-sm">{payout.account_number}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400">Tên chủ tài khoản</p>
              <p className="font-semibold text-gray-700">{payout.account_name}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ghi chú Admin (nếu có) */}
      {payout.admin_note && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 border border-gray-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-500/10 flex items-center justify-center shrink-0">
              <FiFileText className="text-gray-500" size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ghi chú xử lý</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">
                {payout.admin_note}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal xử lý yêu cầu */}
      <ProcessPayoutModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onConfirm={handleProcessPayout}
        payout={payout}
        isLoading={isSubmitting}
      />
    </motion.div>
  )
}