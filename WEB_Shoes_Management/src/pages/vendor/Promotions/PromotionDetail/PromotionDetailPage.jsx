import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiEdit2, FiTag, FiPercent, FiDollarSign, FiCalendar, FiInfo, FiClock } from 'react-icons/fi'
import { toast } from 'react-toastify'

import { vendorPromotionApiService } from '~/services/vendor/vendorPromotionApiService'
import { formatPrice } from '~/utils/formatters'
import { usePageTitle } from '~/hooks/usePageTitle'

export const PromotionDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageTitle(
    promotion ? `Khuyến mãi: ${promotion.name}` : 'Chi tiết khuyến mãi',
    promotion ? `Xem chi tiết chương trình khuyến mãi ${promotion.name}` : 'Xem chi tiết chương trình khuyến mãi'
  )

  useEffect(() => {
    setLoading(true)
    vendorPromotionApiService.getPromotionDetail(id)
      .then(setPromotion)
      .catch((err) => {
        toast.error(err.message || 'Không thể tải thông tin khuyến mãi.')
        navigate('/vendor/promotions')
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
        <div className="w-9 h-9 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu khuyến mãi...</span>
      </div>
    )
  }

  if (!promotion) return null

  const expired = isExpired()

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/promotions')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-brand-primary tracking-tight font-mono">{promotion.name}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${promotion.is_active && !expired ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {promotion.is_active && !expired ? 'ĐANG HOẠT ĐỘNG' : expired ? 'ĐÃ HẾT HẠN' : 'TẠM DỪNG'}
              </span>
            </div>
            {promotion.description && <p className="text-sm text-gray-500 mt-1">{promotion.description}</p>}
          </div>
        </div>

        {!expired && (
          <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={`/vendor/promotions/edit/${promotion.id}`}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer"
            >
              <FiEdit2 size={14} /> Chỉnh sửa
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Thông tin chi tiết */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Thông số */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3">
            <FiInfo className="text-brand-primary" /> Thông số chương trình
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <FiPercent className="text-brand-primary" /> Giảm giá
              </span>
              <span className="text-xl font-black text-red-600">{promotion.discount_value}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <FiDollarSign className="text-brand-primary" /> Đơn hàng tối thiểu
              </span>
              <span className="text-lg font-bold text-gray-800">{formatPrice(promotion.min_order_value)}</span>
            </div>

            {promotion.max_discount_amount && (
              <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                  <FiDollarSign className="text-brand-primary" /> Giảm tối đa
                </span>
                <span className="text-lg font-bold text-gray-800">{formatPrice(promotion.max_discount_amount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <FiClock className="text-brand-primary" /> Trạng thái
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${promotion.is_active && !expired ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {promotion.is_active && !expired ? 'Đang chạy' : expired ? 'Đã hết hạn' : 'Đã tạm dừng'}
              </span>
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3">
            <FiCalendar className="text-brand-primary" /> Thời gian áp dụng
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Ngày bắt đầu</span>
              <span className="text-base font-bold text-gray-800">{formatDate(promotion.start_date)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Ngày kết thúc</span>
              <span className={`text-base font-bold ${expired ? 'text-red-600' : 'text-gray-800'}`}>
                {formatDate(promotion.end_date)}
                {expired && <span className="ml-2 text-[10px] bg-red-100 px-2 py-0.5 rounded-full">Đã hết hạn</span>}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Ngày tạo</span>
              <span className="text-sm text-gray-600">{formatDate(promotion.created_at)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Cập nhật cuối</span>
              <span className="text-sm text-gray-600">{formatDate(promotion.updated_at)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}