import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiPackage, FiStar, FiClock, FiEye,
  FiAlertCircle, FiUsers, FiGrid, FiCheckCircle,
  FiXCircle, FiDollarSign, FiImage
} from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { formatPrice, formatDateTime, getImageUrl, getFirstVariantImage } from '~/utils/formatters'
import { managerProductApiService } from '~/services/manager/managerProductApiService'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  usePageTitle(
    product ? `Chi tiết sản phẩm ${product.name}` : 'Chi tiết sản phẩm',
    product ? `Xem chi tiết sản phẩm ${product.name} - ${product.category_name}` : 'Xem chi tiết sản phẩm'
  )

  const fetchProductDetail = async () => {
    try {
      setLoading(true)
      const res = await managerProductApiService.getProductDetail(id)
      setProduct(res)
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin sản phẩm')
      navigate('/manager/products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchProductDetail()
  }, [id])

  const handleUpdateStatus = async (targetStatus, reason = null) => {
    setIsLoading(true)
    try {
      const res = await managerProductApiService.updateProductStatus(product.id, targetStatus, reason)
      toast.success(res.message)
      fetchProductDetail()
      setModalConfig({ isOpen: false, type: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = () => handleUpdateStatus(PRODUCT_MODERATION_STATUS.APPROVED)
  const handleReject = () => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      title: 'Từ chối sản phẩm',
      message: 'Vui lòng nhập lý do từ chối sản phẩm. Lý do này sẽ được gửi đến chủ shop.',
      placeholder: 'Nhập lý do từ chối...'
    })
  }
  const handleBan = () => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      title: 'Khóa sản phẩm',
      message: 'Vui lòng nhập lý do khóa sản phẩm. Lý do này sẽ được gửi đến chủ shop.',
      placeholder: 'Nhập lý do khóa...'
    })
  }

  const handleModalConfirm = async (reason) => {
    if (modalConfig.type === 'reject') {
      await handleUpdateStatus(PRODUCT_MODERATION_STATUS.REJECTED, reason)
    } else if (modalConfig.type === 'ban') {
      await handleUpdateStatus(PRODUCT_MODERATION_STATUS.BANNED, reason)
    }
  }

  const statusConfig = {
    [PRODUCT_MODERATION_STATUS.APPROVED]: { label: 'ĐÃ DUYỆT', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
    [PRODUCT_MODERATION_STATUS.PENDING]: { label: 'CHỜ DUYỆT', color: 'bg-amber-100 text-amber-700', icon: FiClock },
    [PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL]: { label: 'CHỜ DUYỆT LẠI', color: 'bg-orange-100 text-orange-700', icon: FiAlertCircle },
    [PRODUCT_MODERATION_STATUS.REJECTED]: { label: 'BỊ TỪ CHỐI', color: 'bg-red-100 text-red-700', icon: FiXCircle },
    [PRODUCT_MODERATION_STATUS.BANNED]: { label: 'BỊ KHÓA', color: 'bg-gray-100 text-gray-700', icon: FaBan }
  }

  const currentStatus = product?.status ? statusConfig[product.status] : null
  const StatusIcon = currentStatus?.icon
  const isPending = product?.status === PRODUCT_MODERATION_STATUS.PENDING ||
                    product?.status === PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL
  const isActive = product?.status === PRODUCT_MODERATION_STATUS.APPROVED

  const getImagesFromVariants = () => {
    const images = []
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.image) {
          try {
            let imageData = variant.image
            if (typeof variant.image === 'string') {
              imageData = JSON.parse(variant.image)
            }
            if (imageData && imageData.secure_url) {
              // Kiểm tra trùng lặp
              const exists = images.some(img => img.secure_url === imageData.secure_url)
              if (!exists) {
                images.push({
                  secure_url: imageData.secure_url,
                  public_id: imageData.public_id,
                  variantId: variant.id,
                  size: variant.size,
                  color: variant.color
                })
              }
            }
          } catch (e) {
            continue
          }
        }
      }
    }
    return images
  }

  const displayImages = getImagesFromVariants()

  // Nếu không có ảnh từ variants, dùng product.images
  const fallbackImages = product?.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : []
  const finalImages = displayImages.length > 0 ? displayImages : fallbackImages

  // Lấy thông tin variant cho ảnh đang chọn
  const getSelectedVariantInfo = () => {
    if (!finalImages[selectedImage]?.variantId) return null
    return product?.variants?.find(v => v.id === finalImages[selectedImage].variantId) || null
  }

  const selectedVariantInfo = getSelectedVariantInfo()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full" />
        <span className="text-sm font-semibold text-gray-400 animate-pulse">Đang tải thông tin sản phẩm...</span>
      </div>
    )
  }

  if (!product) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/manager/products')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-gray-500">ID: #{product.id}</span>
              {currentStatus && (
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${currentStatus.color}`}>
                  <StatusIcon size={10} />
                  {currentStatus.label}
                </span>
              )}
              {product.variants && product.variants.length > 0 && (
                <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {product.variants.length} biến thể
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPending && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-green-500/20 cursor-pointer"
              >
                <FiCheckCircle size={16} /> Phê duyệt
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-500/20 cursor-pointer"
              >
                <FiXCircle size={16} /> Từ chối
              </motion.button>
            </>
          )}
          {isActive && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBan}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-500/20 cursor-pointer"
            >
              <FaBan size={16} /> Khóa sản phẩm
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-lg relative">
            {finalImages.length > 0 ? (
              <img
                src={finalImages[selectedImage]?.secure_url || 'https://placehold.co/600x600?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <FiImage size={48} className="mb-2 opacity-50" />
                <span className="text-sm font-semibold">Chưa có ảnh</span>
              </div>
            )}
            {/* Hiển thị thông tin variant của ảnh đang chọn */}
            {selectedVariantInfo && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span>Size: {selectedVariantInfo.size}</span>
                <span className="w-px h-4 bg-white/30" />
                <span>Màu: {selectedVariantInfo.color}</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {finalImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {finalImages.map((img, idx) => {
                const variantInfo = product?.variants?.find(v => v.id === img.variantId)
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`cursor-pointer relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx ? 'border-brand-primary shadow-md' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img.secure_url || 'https://placehold.co/100x100'}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {variantInfo && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 truncate px-1">
                        {variantInfo.size}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Thông tin số lượng ảnh */}
          <div className="text-center text-xs text-gray-400 font-semibold">
            {finalImages.length > 0 ? (
              <span>Hiển thị {finalImages.length} ảnh {finalImages.some(img => img.variantId) ? 'từ các biến thể' : ''}</span>
            ) : (
              <span>Chưa có ảnh nào được thêm</span>
            )}
          </div>
        </div>

        {/* Right - Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center"><FiPackage className="text-brand-primary" size={16} /></div>
              Thông tin sản phẩm
            </h3>
            <div className="space-y-3">
              <InfoRow label="Tên sản phẩm" value={product.name} />
              <InfoRow label="Danh mục" value={product.category_name || 'Chưa phân loại'} />
              <InfoRow label="Giá bán" value={<span className="text-xl font-black text-brand-primary">{formatPrice(product.price)}</span>} />
              <InfoRow label="Đã bán" value={product.sold || 0} />
              <InfoRow label="Lượt xem" value={product.view_count || 0} />
              <InfoRow label="Đánh giá" value={<div className="flex items-center gap-1"><FiStar className="text-yellow-500 fill-yellow-500" size={16} /><span className="font-bold">{Number(product.rating_avg || 0).toFixed(1)}</span><span className="text-xs text-gray-400">/5</span></div>} />
              {(product.status === PRODUCT_MODERATION_STATUS.REJECTED || product.status === PRODUCT_MODERATION_STATUS.BANNED) && (
                <InfoRow
                  label="Lý do từ chối/khóa"
                  value={
                    product.reject_reason ? (
                      <div className="text-right">
                        <span className="text-red-600 text-sm font-medium block">{product.reject_reason}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Chưa có lý do</span>
                    )
                  }
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center"><FiUsers className="text-brand-primary" size={16} /></div>
              Thông tin cửa hàng
            </h3>
            <div className="space-y-3">
              <InfoRow label="Tên cửa hàng" value={<Link to={`/manager/stores/${product.store_id}`} className="text-brand-primary hover:underline font-semibold">{product.store_name || `Cửa hàng #${product.store_id}`}</Link>} />
              <InfoRow label="Chủ sở hữu" value={product.owner_name || 'Chưa cập nhật'} />
              <InfoRow label="Ngày đăng" value={formatDateTime(product.created_at)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center"><FiEye className="text-brand-primary" size={16} /></div>
              Mô tả sản phẩm
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description || 'Chưa có mô tả'}</p>
          </div>

          {product.variants?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center"><FiGrid className="text-brand-primary" size={16} /></div>
                Biến thể sản phẩm
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-2 px-3 font-semibold text-gray-600">Hình ảnh</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600">Size</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600">Màu sắc</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-600">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant, idx) => {
                      let variantImageUrl = null
                      if (variant.image) {
                        try {
                          const imageData = typeof variant.image === 'string' ? JSON.parse(variant.image) : variant.image
                          variantImageUrl = imageData?.secure_url || null
                        } catch (e) {
                          variantImageUrl = null
                        }
                      }
                      return (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-2 px-3">
                            {variantImageUrl ? (
                              <img src={variantImageUrl} alt={variant.color} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                <FiImage size={16} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold">{variant.size}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: variant.color_code || '#cccccc' }} />
                              {variant.color}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-800">{variant.stock}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

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

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
)