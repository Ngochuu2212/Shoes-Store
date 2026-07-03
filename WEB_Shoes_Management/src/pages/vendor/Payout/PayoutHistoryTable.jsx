import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { formatPrice } from '~/utils/formatters'
import { PAYOUT_STATUS } from '~/utils/constant'

export const PayoutHistoryTable = ({ history }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    switch (status) {
    case PAYOUT_STATUS.PENDING:
      return {
        icon: FiClock,
        label: 'Đang xử lý',
        className: 'bg-amber-50 text-amber-600 border-amber-100'
      }
    case PAYOUT_STATUS.APPROVED:
      return {
        icon: FiCheckCircle,
        label: 'Đã duyệt',
        className: 'bg-green-50 text-green-600 border-green-100'
      }
    case PAYOUT_STATUS.REJECTED:
      return {
        icon: FiXCircle,
        label: 'Bị từ chối',
        className: 'bg-red-50 text-red-500 border-red-100'
      }
    default:
      return {
        icon: FiAlertCircle,
        label: 'Không xác định',
        className: 'bg-gray-50 text-gray-500 border-gray-100'
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
            <FiClock className="text-brand-primary" />
            Lịch sử rút tiền
          </h3>
          <span className="text-xs text-gray-400">Tổng: {history.length} lệnh</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Danh sách các lệnh rút tiền gần đây</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-4">Mã lệnh</th>
              <th className="py-4 px-4">Số tiền</th>
              <th className="py-4 px-4">Ngân hàng</th>
              <th className="py-4 px-4">Số tài khoản</th>
              <th className="py-4 px-4">Chủ tài khoản</th>
              <th className="py-4 px-4 text-center w-[120px]">Trạng thái</th>
              <th className="py-4 px-4">Ngày yêu cầu</th>
              <th className="py-4 px-4 w-[200px]">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-gray-400 font-medium">
                  Chưa có lịch sử rút tiền nào.
                </td>
              </tr>
            ) : (
              history.map((item) => {
                const StatusBadge = getStatusBadge(item.status)
                return (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-gray-400">#{item.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-brand-primary">{formatPrice(item.amount)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-700">{item.bank_name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-gray-600">{item.account_number}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-700 uppercase line-clamp-1">{item.account_name}</span>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[150px]">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${StatusBadge.className}`}>
                        <StatusBadge.icon size={12} />
                        {StatusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(item.created_at)}</span>
                    </td>
                    <td className="py-4 px-4">
                      {item.admin_note ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <FiInfo size={12} className="text-amber-500 shrink-0" />
                              <span className="text-xs text-gray-500 line-clamp-1">{item.admin_note}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] rounded-lg bg-gray-800 text-white text-xs border-none font-semibold p-2">
                            {item.admin_note}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
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