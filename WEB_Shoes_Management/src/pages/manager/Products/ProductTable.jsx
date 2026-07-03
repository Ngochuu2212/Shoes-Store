import { formatRelativeTime, formatDateTime, getImageUrl, formatPrice, getFirstVariantImage } from '~/utils/formatters'
import { FiEye, FiCheckCircle, FiXCircle, FiMoreVertical, FiStar, FiInfo } from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'

export const ProductTable = ({
  products,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onApprove,
  onReject,
  onBan
}) => {
  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

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
              <th className="py-4 px-4">Sản phẩm</th>
              <th className="py-4 px-4">Cửa hàng</th>
              <th className="py-4 px-4 text-center">Giá</th>
              <th className="py-4 px-4 text-center">Đã bán</th>
              <th className="py-4 px-4 text-center">Đánh giá</th>
              <th className="py-4 px-4 text-center">Ngày đăng</th>
              <th className="py-4 px-4 text-center min-w-[120px]">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy sản phẩm nào phù hợp.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isChecked = selectedIds.includes(product.id)
                const imageUrl = getImageUrl(product.images?.[0], 'https://placehold.co/100x100?text=Product')
                const rating = Number(product.rating_avg) || 0

                return (
                  <tr key={product.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-brand-primary/5' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        checked={isChecked}
                        onChange={() => onSelectRow(product.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getFirstVariantImage(product, 'https://placehold.co/100x100?text=Product')}
                          alt={product.product_name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900 line-clamp-1 max-w-[200px]">{product.product_name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: #{product.id}</p>
                          <p className="text-[10px] text-gray-400">{product.category_name || 'Chưa có danh mục'}</p>
                          {product.variants && product.variants.length > 0 && (
                            <span className="text-[9px] text-blue-400 font-semibold">{product.variants.length} biến thể</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-1 max-w-[150px]">{product.store_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-brand-primary">{formatPrice(product.price)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold">{product.sold?.toLocaleString() || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiStar className="text-yellow-500 fill-yellow-500" size={14} />
                        <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400">/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(product.created_at)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(product.created_at)}</p>
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
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`/manager/products/detail/${product.id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

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
                                  onClick={() => onApprove(product.id)}
                                  className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                                >
                                  <FiCheckCircle size={14} />
                                  Phê duyệt sản phẩm
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onReject(product.id)}
                                  className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                                >
                                  <FiXCircle size={14} />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                            {isApproved(product.status) && (
                              <DropdownMenuItem
                                onClick={() => onBan(product.id)}
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