import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPackage, FiSearch, FiStar, FiX } from 'react-icons/fi'
import { adminStoreApiService } from '~/services/admin/adminStoreApiService'
import { formatPrice, getImageUrl, formatDateTime } from '~/utils/formatters'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'
import { Input } from '~/components/ui/input'
import { Pagination } from '~/components/common/Pagination'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { FiInfo } from 'react-icons/fi'

export const StoreProductsList = ({ storeId }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Sửa: Nhận tham số searchText để truyền trực tiếp
  const fetchProducts = async (page = 1, searchText = search) => {
    try {
      setLoading(true)
      const res = await adminStoreApiService.getStoreProducts(storeId, {
        page,
        limit: pagination.limit,
        search: searchText || undefined
      })
      setProducts(res.products || [])
      setPagination({
        currentPage: res.pagination?.currentPage || page,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        limit: res.pagination?.limit || 10
      })
      // Cập nhật state search để đồng bộ
      setSearch(searchText)
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (storeId) {
      fetchProducts(1, '')
    }
  }, [storeId])

  // Xử lý khi nhấn Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Truyền trực tiếp searchInput vào fetchProducts
      fetchProducts(1, searchInput)
    }
  }

  // Xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    fetchProducts(1, '')
  }

  const getStatusBadge = (status) => {
    const config = {
      [PRODUCT_MODERATION_STATUS.APPROVED]: { label: 'ĐÃ DUYỆT', className: 'bg-green-50 text-green-600 border-green-100' },
      [PRODUCT_MODERATION_STATUS.PENDING]: { label: 'CHỜ DUYỆT', className: 'bg-amber-50 text-amber-600 border-amber-100' },
      [PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL]: { label: 'CHỜ DUYỆT LẠI', className: 'bg-orange-50 text-orange-600 border-orange-100' },
      [PRODUCT_MODERATION_STATUS.REJECTED]: { label: 'TỪ CHỐI', className: 'bg-red-50 text-red-600 border-red-100' },
      [PRODUCT_MODERATION_STATUS.BANNED]: { label: 'ĐÃ KHÓA', className: 'bg-rose-50 text-rose-600 border-rose-100' }
    }
    const c = config[status] || { label: status?.toUpperCase(), className: 'bg-gray-50 text-gray-600 border-gray-100' }
    return <span className={`${c.className} border px-2.5 py-1 rounded-full text-[10px] font-black`}>{c.label}</span>
  }

  const shouldShowRejectReason = (product) => {
    return (product.status === PRODUCT_MODERATION_STATUS.REJECTED ||
            product.status === PRODUCT_MODERATION_STATUS.BANNED) &&
            product.reject_reason
  }

  const getProductImage = (product) => {
    // Lấy ảnh từ variants
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.image) {
          try {
            let imageData = variant.image
            if (typeof variant.image === 'string') {
              imageData = JSON.parse(variant.image)
            }
            if (imageData && imageData.secure_url) {
              return imageData.secure_url
            }
          } catch (e) {
            continue
          }
        }
      }
    }

    // product.images
    if (product.images) {
      return getImageUrl(product.images, 'https://placehold.co/60x60?text=Product')
    }

    return 'https://placehold.co/60x60?text=Product'
  }

  const getVariantCountWithImage = (product) => {
    if (!product.variants || !Array.isArray(product.variants)) return 0
    let count = 0
    for (const variant of product.variants) {
      if (variant.image) {
        try {
          let imageData = variant.image
          if (typeof variant.image === 'string') {
            imageData = JSON.parse(variant.image)
          }
          if (imageData && imageData.secure_url) {
            count++
          }
        } catch (e) {
          continue
        }
      }
    }
    return count
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FiPackage className="text-emerald-500" size={16} />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Tất cả sản phẩm</h3>
            <p className="text-xs text-gray-400">Tổng: {pagination.totalItems} sản phẩm</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm kiếm sản phẩm... (Enter)"
            className="pl-9 pr-9 rounded-xl border-gray-200 py-2 text-sm focus-visible:ring-emerald-500/20"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <FiPackage size={40} className="text-gray-300" />
          <p className="text-gray-400 font-medium">
            {search ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
          </p>
          {search && (
            <button
              onClick={handleClearSearch}
              className="text-sm text-emerald-500 hover:text-emerald-600 font-semibold"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Sản phẩm</th>
                  <th className="py-3 px-3">Danh mục</th>
                  <th className="py-3 px-3 text-right">Giá</th>
                  <th className="py-3 px-3 text-center">Đã bán</th>
                  <th className="py-3 px-3 text-center">Đánh giá</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const imageUrl = getProductImage(product)
                  const showRejectReason = shouldShowRejectReason(product)
                  const rating = Number(product.rating_avg || 0)
                  const variantCount = getVariantCountWithImage(product)

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                      <td className="py-3 px-3 text-xs font-mono text-gray-500">#{product.id}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={imageUrl}
                              alt={product.product_name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                            {variantCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-sm">
                                {variantCount}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]">
                              {product.product_name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{product.slug}</span>
                              {variantCount > 0 && (
                                <span className="text-[9px] text-emerald-500 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                  {variantCount} ảnh
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-gray-600">{product.category_name || 'Chưa phân loại'}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        {product.sold || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FiStar className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
                          <span className="text-[10px] text-gray-400">/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {showRejectReason ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 cursor-help">
                                  {getStatusBadge(product.status)}
                                  <FiInfo size={12} className="text-gray-400 hover:text-red-500 transition-colors" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-2">
                                <p className="font-semibold mb-1">Lý do:</p>
                                <p className="break-words">{product.reject_reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            getStatusBadge(product.status)
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-gray-500">
                        {formatDateTime(product.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(p) => fetchProducts(p, search)}
              />
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}