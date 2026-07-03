import { formatDateTime, formatPrice, getImageUrl } from '~/utils/formatters'
import {
  FiEye, FiCheckCircle, FiXCircle, FiClock,
  FiCreditCard, FiSend
} from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { PAYOUT_STATUS } from '~/utils/constant'

export const PayoutTable = ({ payouts, onProcessPayout }) => {
  const getStatusConfig = (status) => {
    const config = {
      [PAYOUT_STATUS.PENDING]: {
        label: 'Đang chờ duyệt',
        icon: FiClock,
        color: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      [PAYOUT_STATUS.APPROVED]: {
        label: 'Đã duyệt',
        icon: FiCheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200'
      },
      [PAYOUT_STATUS.REJECTED]: {
        label: 'Đã từ chối',
        icon: FiXCircle,
        color: 'bg-red-50 text-red-600 border-red-200'
      }
    }
    return config[status] || config[PAYOUT_STATUS.PENDING]
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-4 min-w-[80px]">Mã</th>
              <th className="py-4 px-4 min-w-[180px]">Cửa hàng</th>
              <th className="py-4 px-4 min-w-[180px]">Chủ shop</th>
              <th className="py-4 px-4 text-center">Số tiền</th>
              <th className="py-4 px-4 min-w-[200px]">Thông tin ngân hàng</th>
              <th className="py-4 px-4 text-center min-w-[120px]">Trạng thái</th>
              <th className="py-4 px-4 text-center">Ngày tạo</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-gray-400 font-medium">
                  Không có yêu cầu rút tiền nào.
                </td>
              </tr>
            ) : (
              payouts.map((payout) => {
                const statusConfig = getStatusConfig(payout.status)
                const StatusIcon = statusConfig.icon
                const isPending = payout.status === PAYOUT_STATUS.PENDING

                // Lấy URL logo và avatar
                const storeLogo = getImageUrl(payout.logo,
                  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(payout.store_name || 'Store')}`)
                const vendorAvatar = getImageUrl(payout.avatar,
                  `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(payout.vendor_name || 'User')}`)

                return (
                  <tr key={payout.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-emerald-600">#{payout.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={storeLogo}
                          alt={payout.store_name}
                          className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{payout.store_name}</p>
                          <p className="text-[10px] text-gray-400">ID: {payout.store_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={vendorAvatar}
                          alt={payout.vendor_name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{payout.vendor_name}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{payout.vendor_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-emerald-600">
                        {formatPrice(payout.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                          <FiCreditCard size={14} className="text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{payout.bank_name}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {payout.account_number} - {payout.account_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[130px]">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(payout.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/admin/payouts/${payout.id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {/* Nút xử lý - chỉ hiển thị khi đang chờ duyệt */}
                        {isPending && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onProcessPayout(payout)}
                                className="inline-flex p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                              >
                                <FiSend size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                              Xử lý yêu cầu
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