import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiPackage, FiEye, FiStar, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiRefreshCw, FiInfo, FiMoreVertical } from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { formatPrice, formatDateTime, getImageUrl, getFirstVariantImage } from '~/utils/formatters'
import { managerProductApiService } from '~/services/manager/managerProductApiService'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { Pagination } from '~/components/common/Pagination'

export const StoreProductsList = ({ storeId, storeName }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 })
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    productId: null,
    productName: '',
    title: '',
    message: '',
    placeholder: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const res = await managerProductApiService.getProducts({ storeId, page, limit: pagination.limit })
      setProducts(res.products || [])
      setPagination({
        currentPage: res.pagination?.currentPage || page,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        limit: res.pagination?.limit || 10
      })
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (storeId) fetchProducts(1) }, [storeId])

  const handleUpdateStatus = async (productId, targetStatus, reason = null) => {
    setIsLoading(true)
    try {
      const res = await managerProductApiService.updateProductStatus(productId, targetStatus, reason)
      toast.success(res.message)
      fetchProducts(pagination.currentPage)
      setModalConfig({ isOpen: false, type: null, productId: null, productName: '' })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const openRejectModal = (productId, productName) => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      productId,
      productName,
      title: 'Từ chối sản phẩm',
      message: 'Vui lòng nhập lý do từ chối sản phẩm.',
      placeholder: 'Nhập lý do từ chối...'
    })
  }

  const openBanModal = (productId, productName) => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      productId,
      productName,
      title: 'Khóa sản phẩm',
      message: 'Vui lòng nhập lý do khóa sản phẩm.',
      placeholder: 'Nhập lý do khóa...'
    })
  }

  const handleModalConfirm = async (reason) => {
    if (modalConfig.type === 'reject') {
      await handleUpdateStatus(modalConfig.productId, PRODUCT_MODERATION_STATUS.REJECTED, reason)
    } else if (modalConfig.type === 'ban') {
      await handleUpdateStatus(modalConfig.productId, PRODUCT_MODERATION_STATUS.BANNED, reason)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      [PRODUCT_MODERATION_STATUS.PENDING]: { label: 'CHỜ DUYỆT', className: 'bg-amber-50 text-amber-600 border-amber-100' },
      [PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL]: { label: 'CHỜ DUYỆT LẠI', className: 'bg-orange-50 text-orange-600 border-orange-100' },
      [PRODUCT_MODERATION_STATUS.APPROVED]: { label: 'ĐÃ DUYỆT', className: 'bg-green-50 text-green-600 border-green-100' },
      [PRODUCT_MODERATION_STATUS.REJECTED]: { label: 'TỪ CHỐI', className: 'bg-red-50 text-red-600 border-red-100' },
      [PRODUCT_MODERATION_STATUS.BANNED]: { label: 'ĐÃ KHÓA', className: 'bg-rose-50 text-rose-600 border-rose-100' }
    }
    const config = statusMap[status] || { label: status.toUpperCase(), className: 'bg-gray-50 text-gray-600 border-gray-100' }
    return <span className={`${config.className} border px-2.5 py-1 rounded-full text-[10px] font-black`}>{config.label}</span>
  }

  const isPending = (status) => status === PRODUCT_MODERATION_STATUS.PENDING || status === PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL
  const isApproved = (status) => status === PRODUCT_MODERATION_STATUS.APPROVED
  const isBannedOrRejected = (status) => status === PRODUCT_MODERATION_STATUS.BANNED || status === PRODUCT_MODERATION_STATUS.REJECTED

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
      >
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full"
          />
        </div>
      </motion.div>
    )
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
      >
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <FiPackage size={48} className="text-gray-300" />
          </motion.div>
          <p className="text-gray-500 font-medium">Chưa có sản phẩm nào</p>
          <p className="text-xs text-gray-400">Cửa hàng này chưa đăng bán sản phẩm nào</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center"
              >
                <FiPackage className="text-brand-primary" size={18} />
              </motion.div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Sản phẩm của cửa hàng</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tổng số: {pagination.totalItems} sản phẩm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
                <th className="py-4 px-4">Sản phẩm</th>
                <th className="py-4 px-4 text-center">Giá</th>
                <th className="py-4 px-4 text-center">Tồn kho</th>
                <th className="py-4 px-4 text-center">Đã bán</th>
                <th className="py-4 px-4 text-center">Đánh giá</th>
                <th className="py-4 px-4 text-center min-w-[110px]">Trạng thái</th>
                <th className="py-4 px-4 text-center">Ngày đăng</th>
                <th className="py-4 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-gray-50 text-sm font-semibold text-gray-700"
            >
              {products.map((product) => {
                const rating = Number(product.rating_avg) || 0
                const hasVariants = product.variants && product.variants.length > 0
                const totalStock = hasVariants
                  ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                  : product.stock || 0
                const totalSold = hasVariants
                  ? product.variants.reduce((sum, v) => sum + (v.sold || 0), 0)
                  : product.sold || 0
                const minPrice = hasVariants
                  ? Math.min(...product.variants.map(v => v.price || 0))
                  : product.price || 0
                const maxPrice = hasVariants
                  ? Math.max(...product.variants.map(v => v.price || 0))
                  : product.price || 0

                return (
                  <motion.tr
                    key={product.id}
                    variants={rowVariants}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    transition={{ duration: 0.2 }}
                    className="transition-all duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          src={getFirstVariantImage(product, 'https://placehold.co/100x100?text=Product')}
                          alt={product.product_name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900 line-clamp-1 max-w-[200px]">{product.product_name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: #{product.id}</p>
                          <p className="text-[10px] text-gray-400">{product.category_name || 'Chưa có danh mục'}</p>
                          {hasVariants && (
                            <span className="text-[9px] text-blue-400 font-semibold">{product.variants.length} biến thể</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {hasVariants && minPrice !== maxPrice ? (
                        <div>
                          <span className="font-bold text-brand-primary">{formatPrice(minPrice)}</span>
                          <span className="text-xs text-gray-400 mx-1">-</span>
                          <span className="font-bold text-brand-primary">{formatPrice(maxPrice)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-brand-primary">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-semibold ${totalStock <= 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold">{totalSold.toLocaleString() || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiStar className="text-yellow-500 fill-yellow-500" size={14} />
                        <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400">/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[120px]">
                      <div className="flex items-center justify-center gap-1">
                        {(product.status === PRODUCT_MODERATION_STATUS.REJECTED || product.status === PRODUCT_MODERATION_STATUS.BANNED) && product.reject_reason ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {getStatusBadge(product.status)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-2">
                              <p className="font-semibold mb-1">Lý do:</p>
                              <p>{product.reject_reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          getStatusBadge(product.status)
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(product.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                            >
                              <Link
                                to={`/manager/products/detail/${product.id}`}
                                className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                              >
                                <FiEye size={13} />
                              </Link>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {/* Dropdown actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200">
                              <FiMoreVertical size={13} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100 min-w-[180px]">
                            {isPending(product.status) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(product.id, PRODUCT_MODERATION_STATUS.APPROVED)}
                                  className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                                >
                                  <FiCheckCircle size={14} />
                                  Phê duyệt sản phẩm
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openRejectModal(product.id, product.product_name)}
                                  className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                                >
                                  <FiXCircle size={14} />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                            {isApproved(product.status) && (
                              <DropdownMenuItem
                                onClick={() => openBanModal(product.id, product.product_name)}
                                className="text-xs font-bold text-rose-500 cursor-pointer py-2 gap-2"
                              >
                                <FaBan size={14} />
                                Khóa sản phẩm
                              </DropdownMenuItem>
                            )}
                            {isBannedOrRejected(product.status) && (
                              <DropdownMenuItem
                                disabled
                                className="text-xs font-bold text-gray-400 cursor-not-allowed py-2 gap-2"
                              >
                                <FaBan size={14} />
                                Đã bị khóa/từ chối
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        {(pagination.totalPages > 1) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 border-t border-gray-100"
          >
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={fetchProducts}
            />
          </motion.div>
        )}
      </motion.div>

      <ConfirmReasonModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null, productId: null, productName: '' })}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
      />
    </>
  )
}