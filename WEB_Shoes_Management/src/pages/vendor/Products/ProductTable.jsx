import { formatPrice, getImageUrl } from '~/utils/formatters'
import { FiEdit2, FiTrash2, FiEye, FiChevronDown, FiStar, FiInfo, FiGrid } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'

export const ProductTable = ({ products, selectedIds, onSelectRow, onSelectAll, onToggleActive, onDelete }) => {

  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const getFirstVariantImage = (product) => {
    // Nếu product có variants và là array
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // Duyệt qua các variants để tìm variant có ảnh
      for (const variant of product.variants) {
        if (variant.image) {
          try {
            let imageData = variant.image
            // Nếu là string JSON thì parse
            if (typeof variant.image === 'string') {
              imageData = JSON.parse(variant.image)
            }
            // Nếu có secure_url thì trả về
            if (imageData && imageData.secure_url) {
              return imageData.secure_url
            }
          } catch (e) {
            console.error('Lỗi parse ảnh variant:', e)
          }
        }
      }
    }
    return null
  }

  // Component badge riêng để có tooltip
  const ModerationBadge = ({ status, rejectReason }) => {
    const getBadgeContent = () => {
      switch (status) {
      case PRODUCT_MODERATION_STATUS.APPROVED:
        return { label: 'HỢP LỆ', className: 'bg-green-50 text-green-600 border-green-100' }
      case PRODUCT_MODERATION_STATUS.PENDING:
        return { label: 'CHỜ DUYỆT', className: 'bg-amber-50 text-amber-600 border-amber-100' }
      case PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL:
        return { label: 'CHỜ DUYỆT LẠI', className: 'bg-orange-50 text-orange-600 border-orange-100' }
      case PRODUCT_MODERATION_STATUS.REJECTED:
        return { label: 'BỊ TỪ CHỐI', className: 'bg-gray-100 text-gray-600' }
      case PRODUCT_MODERATION_STATUS.BANNED:
        return { label: 'BỊ KHÓA', className: 'bg-red-50 text-red-600 border-red-100' }
      default:
        return null
      }
    }

    const badge = getBadgeContent()
    if (!badge) return null

    // Nếu là REJECTED hoặc BANNED và có reject_reason, hiển thị tooltip
    if ((status === PRODUCT_MODERATION_STATUS.REJECTED || status === PRODUCT_MODERATION_STATUS.BANNED) && rejectReason) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border cursor-help ${badge.className}`}>
              {badge.label}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-2">
            <p className="font-semibold mb-1">Lý do:</p>
            <p className="break-words">{rejectReason}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.className}`}>
        {badge.label}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-6 w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="py-4 px-4">Thông tin sản phẩm</th>
              <th className="py-4 px-4">Danh mục</th>
              <th className="py-4 px-4">Giá bán</th>
              <th className="py-4 px-4 text-center">Đã bán</th>
              <th className="py-4 px-4 text-center">Đánh giá</th>
              <th className="py-4 px-4 text-center">Kiểm duyệt</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-16 text-gray-400 font-medium">Không tìm thấy sản phẩm nào phù hợp bộ lọc.</td>
              </tr>
            ) : (
              products.map((p) => {
                const variantImageUrl = getFirstVariantImage(p)

                // Fallback: nếu không có ảnh từ variants, thử lấy từ product.images
                let fallbackImages = []
                if (!variantImageUrl && p.images) {
                  try {
                    fallbackImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
                  } catch (e) { fallbackImages = [] }
                }

                const imageUrl = variantImageUrl || getImageUrl(fallbackImages?.[0], 'https://placehold.co/100x100?text=Giay')

                const isChecked = selectedIds.includes(p.id)

                return (
                  <tr key={p.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-brand-primary/5' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        checked={isChecked}
                        onChange={() => onSelectRow(p.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-gray-900 line-clamp-1 hover:text-brand-primary transition-colors cursor-pointer">{p.name}</span>
                          <span className="text-[11px] text-gray-400 mt-0.5">ID: #{p.id}</span>
                        </div>
                      </div>
                    </td>
                    {/* Cột Danh mục */}
                    <td className="py-4 px-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <FiGrid size={12} className="text-gray-400 shrink-0" />
                            <span className="text-sm font-medium text-gray-700 line-clamp-1">
                              {p.category_name || 'Chưa phân loại'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold max-w-xs">
                          <p className="break-words">
                            {p.category_name ? `Danh mục: ${p.category_name}` : 'Chưa phân loại sản phẩm'}
                          </p>
                          {p.category_id && (
                            <p className="text-gray-400 text-[10px] mt-1">ID: #{p.category_id}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-4 px-4 text-brand-primary font-black">{formatPrice(p.price)}</td>
                    <td className="py-4 px-4 text-center text-gray-500 font-bold">{p.sold}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                        <FiStar className="fill-yellow-400 text-yellow-400" size={16} />
                        <span>{Number(p.rating_avg || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[150px]">
                      <ModerationBadge status={p.status} rejectReason={p.reject_reason} />
                    </td>

                    <td className="py-4 px-4 text-center min-w-[170px]">
                      {p.status === PRODUCT_MODERATION_STATUS.APPROVED ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`flex items-center justify-between w-full gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 shadow-sm ${
                              p.is_active ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                            }`}>
                              <span className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                {p.is_active ? 'Đang mở bán' : 'Ngừng bán'}
                              </span>
                              <FiChevronDown size={14} className="opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="rounded-xl shadow-lg border-gray-100 min-w-[150px] z-50">
                            <DropdownMenuItem onClick={() => onToggleActive(p.id, true)} className="text-xs font-bold text-green-600 cursor-pointer py-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Đang mở bán
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleActive(p.id, false)} className="text-xs font-bold text-red-500 cursor-pointer py-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Ngừng bán
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <button disabled className="flex items-center justify-center w-full px-3 py-1.5 rounded-xl text-xs font-bold border bg-gray-50 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed">
                          Không khả dụng
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/vendor/products/detail/${p.id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            {p.status === PRODUCT_MODERATION_STATUS.REJECTED || p.status === PRODUCT_MODERATION_STATUS.BANNED ? (
                              <button
                                disabled
                                className="inline-flex p-2.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl cursor-not-allowed"
                              >
                                <FiEdit2 size={13} />
                              </button>
                            ) : (
                              <Link
                                to={`/vendor/products/edit/${p.id}`}
                                className="inline-flex p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                              >
                                <FiEdit2 size={13} />
                              </Link>
                            )}
                          </TooltipTrigger>
                          <TooltipContent className={`rounded-lg text-white text-xs border-none font-semibold ${p.status === 'rejected' || p.status === 'banned' ? 'bg-gray-800' : 'bg-blue-600'}`}>
                            {p.status === PRODUCT_MODERATION_STATUS.REJECTED || p.status === PRODUCT_MODERATION_STATUS.BANNED ? 'Không thể sửa sản phẩm bị từ chối hoặc bị cấm bán' : 'Sửa thông tin'}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onDelete(p)}
                              className="p-2.5 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white border border-red-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-red-600 text-white text-xs border-none font-semibold">
                            Xóa sản phẩm
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}