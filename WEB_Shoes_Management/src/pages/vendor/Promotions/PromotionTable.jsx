import { formatPrice } from '~/utils/formatters'
import { FiEdit2, FiTrash2, FiChevronDown, FiPercent, FiCalendar, FiEye } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

export const PromotionTable = ({ promotions, selectedIds, onSelectRow, onSelectAll, onToggleActive, onDelete }) => {
  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date()
  }

  const isSoonExpiring = (endDate) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 2
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
                  checked={promotions.length > 0 && selectedIds.length === promotions.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="py-4 px-4">Mã khuyến mãi</th>
              <th className="py-4 px-4">Giảm giá</th>
              <th className="py-4 px-4">Đơn tối thiểu</th>
              <th className="py-4 px-4">Giảm tối đa</th>
              <th className="py-4 px-4 text-center">Thời gian áp dụng</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy chương trình khuyến mãi nào phù hợp.
                </td>
              </tr>
            ) : (
              promotions.map((p) => {
                const isChecked = selectedIds.includes(p.id)
                const expired = isExpired(p.end_date)
                const soonExpiring = isSoonExpiring(p.end_date) && !expired && p.is_active === 1

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
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-900 font-mono tracking-wider">{p.name}</span>
                        {p.description && (
                          <span className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{p.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black">
                        {p.discount_value}<FiPercent size={12} />
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{formatPrice(p.min_order_value)}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {p.max_discount_amount ? formatPrice(p.max_discount_amount) : 'Không giới hạn'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <FiCalendar size={10} /> {formatDate(p.start_date)}
                        </span>
                        <span className="text-[11px] text-gray-400">→</span>
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${expired ? 'text-red-500' : soonExpiring ? 'text-amber-500' : 'text-gray-500'}`}>
                          <FiCalendar size={10} /> {formatDate(p.end_date)}
                          {expired && <span className="ml-1 text-[9px] bg-red-100 px-1.5 py-0.5 rounded-full">Hết hạn</span>}
                          {soonExpiring && <span className="ml-1 text-[9px] bg-amber-100 px-1.5 py-0.5 rounded-full">Sắp hết</span>}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[160px]">
                      {!expired ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`flex items-center justify-between w-full gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 shadow-sm ${
                              p.is_active ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                            }`}>
                              <span className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                {p.is_active ? 'Đang chạy' : 'Tạm dừng'}
                              </span>
                              <FiChevronDown size={14} className="opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="rounded-xl shadow-lg border-gray-100 min-w-[150px] z-50">
                            <DropdownMenuItem onClick={() => onToggleActive(p.id, true)} className="text-xs font-bold text-green-600 cursor-pointer py-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Kích hoạt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleActive(p.id, false)} className="text-xs font-bold text-red-500 cursor-pointer py-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Tạm dừng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <button disabled className="flex items-center justify-center w-full px-3 py-1.5 rounded-xl text-xs font-bold border bg-gray-50 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed">
                          Đã hết hạn
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/vendor/promotions/detail/${p.id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {/* Nút Chỉnh sửa */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/vendor/promotions/edit/${p.id}`}
                              className={`inline-flex p-2.5 rounded-xl cursor-pointer active:scale-90 transition-all duration-200 ${
                                expired
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed pointer-events-none'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100'
                              }`}
                            >
                              <FiEdit2 size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-blue-600 text-white text-xs border-none font-semibold">
                            {expired ? 'Không thể sửa mã đã hết hạn' : 'Chỉnh sửa thông tin'}
                          </TooltipContent>
                        </Tooltip>

                        {/* Nút Xóa */}
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
                            Xóa khuyến mãi
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