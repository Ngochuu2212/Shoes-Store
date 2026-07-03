import { formatRelativeTime, formatDateTime, getImageUrl } from '~/utils/formatters'
import { FiEye, FiCheckCircle, FiXCircle, FiMoreVertical, FiStar, FiMapPin } from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

export const StoreTable = ({ stores, selectedIds, onSelectRow, onSelectAll, onApprove, onReject, onBan }) => {
  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  // Xác định trạng thái cửa hàng dựa vào is_active và role của chủ shop
  const getStatusBadge = (store) => {
    // Đang hoạt động
    if (store.is_active === 1) {
      return <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-black">ĐANG HOẠT ĐỘNG</span>
    }
    // Đã khóa (is_active = 0 và chủ shop là VENDOR - đã từng được duyệt)
    if (store.is_active === 0 && store.owner_role === 'VENDOR') {
      return <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-black">ĐÃ KHÓA</span>
    }
    // Chờ duyệt (is_active = 0 và chủ shop là USER - chưa được duyệt)
    return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full text-[10px] font-black">CHỜ DUYỆT</span>
  }

  // Kiểm tra xem cửa hàng có đang ở trạng thái chờ duyệt không
  const isPending = (store) => {
    return store.is_active === 0 && (!store.owner_role || store.owner_role !== 'VENDOR')
  }

  // Kiểm tra xem cửa hàng có đang bị khóa không
  const isBanned = (store) => {
    return store.is_active === 0 && store.owner_role === 'VENDOR'
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
                  checked={stores.length > 0 && selectedIds.length === stores.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="py-4 px-4">Cửa hàng</th>
              <th className="py-4 px-4">Chủ sở hữu</th>
              <th className="py-4 px-4 text-center">Đánh giá</th>
              <th className="py-4 px-4">Địa chỉ</th>
              <th className="py-4 px-4 text-center">Ngày đăng ký</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {stores.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy cửa hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              stores.map((store) => {
                const isChecked = selectedIds.includes(store.id)
                const logoUrl = getImageUrl(store.logo, 'https://placehold.co/100x100?text=Store')
                const pending = isPending(store)
                const banned = isBanned(store)
                const rating = Number(store.rating_average) || 0

                return (
                  <tr key={store.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-brand-primary/5' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        checked={isChecked}
                        onChange={() => onSelectRow(store.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={logoUrl}
                          alt={store.store_name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900">{store.store_name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: #{store.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">{store.owner_name}</p>
                        <p className="text-[11px] text-gray-400">{store.owner_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiStar className="text-yellow-500 fill-yellow-500" size={14} />
                        <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400">/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <FiMapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 line-clamp-1">{store.address || 'Chưa cập nhật'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(store.created_at)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(store.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[150px]">
                      {getStatusBadge(store)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/manager/stores/${store.id}`}
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
                            {pending && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onApprove(store.id)}
                                  className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                                >
                                  <FiCheckCircle size={14} />
                                  Phê duyệt cửa hàng
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onReject(store.id)}
                                  className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                                >
                                  <FiXCircle size={14} />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                            {banned && (
                              <DropdownMenuItem
                                disabled
                                className="text-xs font-bold text-gray-400 cursor-not-allowed py-2 gap-2"
                              >
                                <FaBan size={14} />
                                Đã khóa
                              </DropdownMenuItem>
                            )}
                            {store.is_active === 1 && (
                              <DropdownMenuItem
                                onClick={() => onBan(store.id)}
                                className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                              >
                                <FaBan size={14} />
                                Khóa cửa hàng
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