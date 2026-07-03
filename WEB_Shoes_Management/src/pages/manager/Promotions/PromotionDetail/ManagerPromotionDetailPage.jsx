import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiEdit2, FiTag, FiPercent, FiDollarSign, FiCalendar, FiInfo, FiClock } from 'react-icons/fi'
import { toast } from 'react-toastify'

import { managerPromotionApiService } from '~/services/manager/managerPromotionApiService'
import { formatPrice } from '~/utils/formatters'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerPromotionDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageTitle(
    promotion ? `Mã HT: ${promotion.name}` : 'Chi tiết mã hệ thống',
    'Xem chi tiết mã giảm giá hệ thống'
  )

  useEffect(() => {
    setLoading(true)
    managerPromotionApiService.getPromotionDetail(id)
      .then(setPromotion)
      .catch((err) => {
        toast.error(err.message || 'Không thể tải thông tin mã giảm giá.')
        navigate('/manager/promotions')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const isExpired = () => {
    if (!promotion?.end_date) return false
    return new Date(promotion.end_date) < new Date()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu...</span>
      </div>
    )
  }

  if (!promotion) return null
  const expired = isExpired()

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/manager/promotions')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm cursor-pointer">
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-blue-600 tracking-tight font-mono">{promotion.name}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${promotion.is_active && !expired ? 'bg-green-50 text-green-600' : expired ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                {promotion.is_active && !expired ? 'ĐANG HOẠT ĐỘNG' : expired ? 'ĐÃ HẾT HẠN' : 'TẠM DỪNG'}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100">
                MÃ HỆ THỐNG
              </span>
            </div>
            {promotion.description && <p className="text-sm text-gray-500 mt-1">{promotion.description}</p>}
          </div>
        </div>
        {!expired && (
          <Link to={`/manager/promotions/edit/${id}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
            <FiEdit2 size={15} /> Chỉnh sửa
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin khuyến mãi */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
            <FiInfo className="text-blue-600" /> Thông tin chi tiết
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><FiTag size={13} /> Mã giảm giá</span>
              <span className="font-mono font-black text-gray-900 tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm">{promotion.name}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><FiPercent size={13} /> Giảm giá (%)</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-black">
                {Number(promotion.discount_value)}%
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><FiDollarSign size={13} /> Đơn hàng tối thiểu</span>
              <span className="font-bold text-gray-700">{formatPrice(promotion.min_order_value)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><FiDollarSign size={13} /> Giảm tối đa</span>
              <span className="font-bold text-gray-700">{promotion.max_discount_amount ? formatPrice(promotion.max_discount_amount) : 'Không giới hạn'}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><FiClock size={13} /> Trạng thái</span>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${promotion.is_active && !expired ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {promotion.is_active && !expired ? 'Đang hoạt động' : expired ? 'Đã hết hạn' : 'Tạm dừng'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Thời gian áp dụng */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
            <FiCalendar className="text-blue-600" /> Thời gian áp dụng
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400">Ngày bắt đầu</span>
              <span className="font-bold text-gray-700">{formatDate(promotion.start_date)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400">Ngày kết thúc</span>
              <span className={`font-bold ${expired ? 'text-red-500' : 'text-gray-700'}`}>{formatDate(promotion.end_date)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400">Ngày tạo</span>
              <span className="font-bold text-gray-700">{formatDate(promotion.created_at)}</span>
            </div>
            <div className="py-3">
              <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl ${promotion.is_active && !expired ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                <span className="text-sm font-black">
                  {promotion.is_active && !expired
                    ? `🎉 Mã hệ thống đang được áp dụng toàn sàn`
                    : expired ? '⏰ Mã đã hết hạn sử dụng' : '⏸ Mã đang tạm dừng'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
