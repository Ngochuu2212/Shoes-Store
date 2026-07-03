import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiEdit2, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'

import { vendorProductApiService } from '~/services/vendor/vendorProductApiService'
import { ProductMetricsGrid } from './ProductMetricsGrid'
import { ProductMainInfo } from './ProductMainInfo'
import { ProductVariantsTable } from './ProductVariantsTable'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageTitle(
    product ? `Chi tiết sản phẩm ${product.name}` : 'Chi tiết sản phẩm',
    product ? `Xem chi tiết sản phẩm ${product.name} - ${product.category_name}` : 'Xem chi tiết sản phẩm'
  )

  useEffect(() => {
    setLoading(true)
    vendorProductApiService.getProductDetail(id)
      .then(setProduct)
      .catch((err) => {
        toast.error(err.message || 'Không thể tải thông tin chi tiết sản phẩm.')
        navigate('/vendor/products')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const renderModerationBadge = (status) => {
    switch (status) {
    case PRODUCT_MODERATION_STATUS.APPROVED: return <span className="bg-green-50 text-green-600 border border-green-100 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm">SẢN PHẨM HỢP LỆ (ĐÃ DUYỆT)</span>
    case PRODUCT_MODERATION_STATUS.PENDING: return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm">ĐANG CHỜ KIỂM DUYỆT</span>
    case PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL: return <span className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm">KHIẾU NẠI ĐANG CHỜ DUYỆT LẠI</span>
    case PRODUCT_MODERATION_STATUS.REJECTED: return <span className="bg-red-50 text-red-500 border border-red-100 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm">BỊ TỪ CHỐI HIỂN THỊ</span>
    case PRODUCT_MODERATION_STATUS.BANNED: return <span className="bg-red-900/10 text-red-700 border border-red-200 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm">VI PHẠM (ĐÃ BỊ KHÓA)</span>
    default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu chi tiết sản phẩm...</span>
      </div>
    )
  }

  if (!product) return null

  // Kiểm tra quyền chỉnh sửa tương tự như bảng Table
  const isDisableEdit = product.status === 'rejected' || product.status === 'banned'

  return (
    <div className="space-y-6 pb-10">

      {/* KHỐI TIÊU ĐỀ ĐẦU TRANG (HEADER) */}
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
            onClick={() => navigate('/vendor/products')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
            title="Quay lại danh sách"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-brand-primary tracking-tight">{product.name}</h2>
              {renderModerationBadge(product.status)}
            </div>
            <p className="text-xs font-bold text-gray-400 mt-1">Mã sản phẩm: #{product.id}</p>
          </div>
        </div>

        {/* Nút bấm chuyển sang trang Sửa sản phẩm */}
        {isDisableEdit ? (
          <div className="flex items-center gap-2 bg-gray-100 text-gray-500 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200">
            <FiAlertCircle size={14} />
            <span>Không cho phép chỉnh sửa</span>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={`/vendor/products/edit/${product.id}`}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer"
            >
              <FiEdit2 size={14} /> Chỉnh sửa thông tin
            </Link>
          </motion.div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <ProductMetricsGrid product={product} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ProductMainInfo product={product} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <ProductVariantsTable variants={product.variants} />
      </motion.div>

    </div>
  )
}