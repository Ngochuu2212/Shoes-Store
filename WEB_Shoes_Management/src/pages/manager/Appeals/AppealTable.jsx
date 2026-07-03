// ~/pages/manager/Appeals/AppealTable.jsx
import { formatRelativeTime, formatDateTime, getImageUrl } from '~/utils/formatters'
import { FiEye, FiCheckCircle, FiXCircle, FiMoreVertical } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { APPEAL_STATUS } from '~/utils/constant'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const AppealTable = ({
  appeals,
  onApprove,
  onReject,
  onViewDetail
}) => {
  const getStatusBadge = (status) => {
    const config = {
      [APPEAL_STATUS.PENDING]: { label: 'CHỜ XỬ LÝ', className: 'bg-amber-50 text-amber-600 border-amber-100' },
      [APPEAL_STATUS.APPROVED]: { label: 'ĐÃ DUYỆT', className: 'bg-green-50 text-green-600 border-green-100' },
      [APPEAL_STATUS.REJECTED]: { label: 'ĐÃ TỪ CHỐI', className: 'bg-red-50 text-red-600 border-red-100' }
    }
    const c = config[status] || { label: status.toUpperCase(), className: 'bg-gray-50 text-gray-600 border-gray-100' }
    return <span className={`${c.className} border px-2.5 py-1 rounded-full text-[10px] font-black`}>{c.label}</span>
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-4 min-w-[200px]">Cửa hàng</th>
              <th className="py-4 px-4 min-w-[150px]">Chủ sở hữu</th>
              <th className="py-4 px-4 min-w-[250px]">Lý do giải trình</th>
              <th className="py-4 px-4 text-center min-w-[120px]">Trạng thái</th>
              <th className="py-4 px-4 text-center min-w-[150px]">Ngày tạo</th>
              <th className="py-4 px-6 text-center min-w-[120px]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {appeals.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy đơn cứu xét nào.
                </td>
              </tr>
            ) : (
              appeals.map((appeal) => {
                const logoUrl = getImageUrl(appeal.store_logo, 'https://placehold.co/80x80?text=Store')

                return (
                  <tr key={appeal.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={logoUrl}
                          alt={appeal.store_name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900 line-clamp-1 max-w-[150px]">{appeal.store_name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: #{appeal.store_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">{appeal.owner_name}</p>
                        <p className="text-[10px] text-gray-400">{appeal.owner_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-gray-600 line-clamp-2 max-w-[250px] cursor-help hover:text-gray-900">
                            {appeal.appeal_reason || 'Không có lý do'}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-3">
                          <p className="whitespace-pre-wrap break-words">{appeal.appeal_reason || 'Không có lý do'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(appeal.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(appeal.created_at)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(appeal.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Link xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/manager/appeals/${appeal.id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {/* Dropdown hành động */}
                        {appeal.status === APPEAL_STATUS.PENDING && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200">
                                <FiMoreVertical size={13} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100 min-w-[200px]">
                              <DropdownMenuItem
                                onClick={() => onApprove(appeal.id)}
                                className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                              >
                                <FiCheckCircle size={14} />
                                Phê duyệt
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onReject(appeal.id)}
                                className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                              >
                                <FiXCircle size={14} />
                                Từ chối
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {appeal.status !== APPEAL_STATUS.PENDING && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex p-2.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl cursor-not-allowed">
                                <FiMoreVertical size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                              Đã xử lý
                            </TooltipContent>
                          </Tooltip>
                        )}
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