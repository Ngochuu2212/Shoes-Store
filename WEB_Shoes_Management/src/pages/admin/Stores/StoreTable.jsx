import { formatDateTime, formatPrice, getImageUrl } from '~/utils/formatters'
import {
  FiEye, FiCheckCircle, FiXCircle, FiMoreVertical,
  FiDollarSign, FiEdit2, FiInfo
} from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'

export const StoreTable = ({
  stores,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onToggleActive,
  onUpdateCommission,
  onDelete
}) => {
  const [commissionModal, setCommissionModal] = useState({
    isOpen: false,
    storeId: null,
    currentRate: 10
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const getStatusBadge = (store) => {
    if (store.is_active === 1) {
      return (
        <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-black">
          ĐANG HOẠT ĐỘNG
        </span>
      )
    }

    // Nếu bị khóa và có reject_reason, hiển thị tooltip
    if (store.reject_reason) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-black cursor-help">
              ĐÃ KHÓA
              <FiInfo size={10} className="opacity-70" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-2">
            <p className="font-semibold mb-1">Lý do khóa:</p>
            <p className="break-words">{store.reject_reason}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-black">
        ĐÃ KHÓA
      </span>
    )
  }

  const handleOpenCommissionModal = (storeId, currentRate) => {
    setCommissionModal({
      isOpen: true,
      storeId: storeId,
      currentRate: currentRate || 10
    })
  }

  const handleCommissionSubmit = async (rate) => {
    setIsLoading(true)
    try {
      const parsedRate = parseFloat(rate)
      if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
        toast.error('Vui lòng nhập tỷ lệ phần trăm từ 0-100')
        return
      }
      await onUpdateCommission([commissionModal.storeId], parsedRate)
      setCommissionModal({ isOpen: false, storeId: null, currentRate: 10 })
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20 accent-emerald-500 cursor-pointer"
                    checked={stores.length > 0 && selectedIds.length === stores.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="py-4 px-4 min-w-[200px]">Cửa hàng</th>
                <th className="py-4 px-4">Chủ sở hữu</th>
                <th className="py-4 px-4 text-center">Số dư ví</th>
                <th className="py-4 px-4 text-center">Phí hoa hồng</th>
                <th className="py-4 px-4 text-center">Đánh giá</th>
                <th className="py-4 px-4 text-center min-w-[120px]">Trạng thái</th>
                <th className="py-4 px-4 text-center">Ngày tạo</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-gray-400 font-medium">
                    Không tìm thấy cửa hàng nào.
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const isChecked = selectedIds.includes(store.id)
                  const logoUrl = getImageUrl(store.logo, 'https://placehold.co/80x80?text=Store')

                  return (
                    <tr key={store.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-emerald-500/5' : ''}`}>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20 accent-emerald-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => onSelectRow(store.id)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={logoUrl}
                            alt={store.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-extrabold text-gray-900">{store.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">ID: #{store.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-800">{store.owner_name || `Chủ shop #${store.owner_id}`}</p>
                          <p className="text-[10px] text-gray-400">{store.owner_email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-emerald-600">{formatPrice(store.balance || 0)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-gray-800">{store.commission_rate || 10}%</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-amber-500">{Number(store.rating_average || 0).toFixed(1)}</span>
                      </td>
                      <td className="py-4 px-4 text-center min-w-[150px]">
                        {getStatusBadge(store)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-xs">
                          <p className="font-semibold text-gray-700">{formatDateTime(store.created_at)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Xem chi tiết */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={`/admin/stores/${store.id}`}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200">
                                <FiMoreVertical size={13} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100 min-w-[200px]">
                              {store.is_active === 1 ? (
                                <DropdownMenuItem
                                  onClick={() => onToggleActive(store.id, false)}
                                  className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                                >
                                  <FaBan size={14} /> Khóa cửa hàng
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => onToggleActive(store.id, true)}
                                  className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                                >
                                  <FiCheckCircle size={14} /> Mở khóa cửa hàng
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenCommissionModal(store.id, store.commission_rate)}
                                className="text-xs font-bold text-blue-500 cursor-pointer py-2 gap-2"
                              >
                                <FiDollarSign size={14} /> Cập nhật phí hoa hồng
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => onDelete(store.id)}
                                className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                              >
                                <FiXCircle size={14} /> Xóa cửa hàng
                              </DropdownMenuItem>
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

      {/* Modal cập nhật phí hoa hồng */}
      <ConfirmReasonModal
        isOpen={commissionModal.isOpen}
        onClose={() => setCommissionModal({ isOpen: false, storeId: null, currentRate: 10 })}
        onConfirm={handleCommissionSubmit}
        title="Cập nhật phí hoa hồng"
        message={'Nhập tỷ lệ phí hoa hồng mới cho cửa hàng (0-100%):'}
        placeholder="Nhập tỷ lệ phần trăm (VD: 10)"
        isLoading={isLoading}
        type="approve"
      />
    </>
  )
}