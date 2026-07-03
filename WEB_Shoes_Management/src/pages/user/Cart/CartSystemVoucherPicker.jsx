import { useState, useEffect } from 'react'
import { FiGift, FiChevronDown, FiCheck, FiLoader, FiX } from 'react-icons/fi'
import { promotionApiService } from '~/services/user/promotionService'
import { formatPrice } from '~/utils/formatters'

export const CartSystemVoucherPicker = ({ orderTotal, onSelectVoucher, currentSelectedVoucher }) => {
  const [open, setOpen] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSystemVouchers = async () => {
      try {
        const data = await promotionApiService.getSystemPromotions()
        if (Array.isArray(data)) setVouchers(data)
      } catch {
        // Không cần xử lý lỗi tải mã hệ thống
      } finally {
        setLoading(false)
      }
    }
    loadSystemVouchers()
  }, [])

  const handleClearVoucher = () => {
    onSelectVoucher(null, 0)
    setOpen(false)
  }

  // Lọc các mã đủ điều kiện theo giá trị đơn hàng
  const eligibleVouchers = vouchers.filter(v => Number(orderTotal) >= Number(v.min_order_value))
  const ineligibleVouchers = vouchers.filter(v => Number(orderTotal) < Number(v.min_order_value))

  if (!loading && vouchers.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0">
            <FiGift size={15} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-800">Mã giảm giá hệ thống</p>
            <p className="text-[10px] text-gray-400 font-semibold">Do sàn đề cử – áp dụng toàn đơn hàng</p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer uppercase shadow-sm min-w-[140px] justify-between
              ${currentSelectedVoucher ? 'border-blue-500 bg-blue-500/10 text-blue-700' : 'border-blue-200 bg-white text-gray-500 hover:bg-blue-50'}`}
          >
            {loading
              ? <><FiLoader size={12} className="animate-spin text-blue-600" /><span>Đang tải...</span></>
              : <><FiGift size={12} className={currentSelectedVoucher ? 'text-blue-600' : 'text-gray-400'} />
                <span className="font-mono">{currentSelectedVoucher || 'Chọn mã sàn'}</span></>
            }
            <FiChevronDown size={10} className="text-gray-400 shrink-0" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-30 w-72 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                {loading ? (
                  <div className="flex items-center justify-center py-5 text-gray-400 gap-1.5 text-[11px]">
                    <FiLoader size={12} className="animate-spin text-blue-600" />
                    <span>Đang tải mã hệ thống...</span>
                  </div>
                ) : (
                  <>
                    {/* Nút bỏ chọn */}
                    <button type="button" onClick={handleClearVoucher}
                      className={`w-full text-left px-2.5 py-2 text-[11px] rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2
                        ${!currentSelectedVoucher ? 'bg-gray-100 text-gray-600 font-bold' : 'hover:bg-gray-50 text-gray-500'}`}>
                      <span className="flex items-center gap-1.5"><FiX size={12} className="text-gray-400" /><span>Không dùng mã sàn</span></span>
                      {!currentSelectedVoucher && <FiCheck size={11} className="text-blue-600 shrink-0" />}
                    </button>

                    {/* Mã đủ điều kiện */}
                    {eligibleVouchers.length > 0 && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <p className="text-[9px] font-black text-green-600 uppercase px-2.5 py-0.5">Đủ điều kiện áp dụng</p>
                        {eligibleVouchers.map((v) => (
                          <button key={v.id} type="button"
                            onClick={() => { onSelectVoucher(v.code, Number(v.discount_value)); setOpen(false) }}
                            className={`w-full text-left px-2.5 py-2 text-[11px] rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5
                              ${currentSelectedVoucher === v.code ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}>
                            <span className="font-bold tracking-wide flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-gray-800 truncate font-mono">{v.name}</span>
                                <span className="bg-blue-50 text-blue-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                                  -{Math.round(v.discount_value)}%
                                </span>
                              </div>
                              {currentSelectedVoucher === v.code && <FiCheck size={11} className="text-blue-600 shrink-0" />}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal line-clamp-1">
                              {v.description || `Giảm ${Math.round(v.discount_value)}% cho đơn từ ${formatPrice(v.min_order_value)}`}
                            </span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Mã không đủ điều kiện */}
                    {ineligibleVouchers.length > 0 && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <p className="text-[9px] font-black text-gray-400 uppercase px-2.5 py-0.5">Chưa đủ điều kiện</p>
                        {ineligibleVouchers.map((v) => (
                          <div key={v.id} className="px-2.5 py-2 text-[11px] rounded-lg text-gray-400 opacity-60 flex flex-col gap-0.5 cursor-not-allowed">
                            <span className="font-bold tracking-wide flex items-center gap-1.5">
                              <span className="font-mono">{v.name}</span>
                              <span className="bg-gray-100 text-gray-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-gray-200">
                                -{Math.round(v.discount_value)}%
                              </span>
                            </span>
                            <span className="text-[10px] text-gray-400">Cần tối thiểu {formatPrice(v.min_order_value)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị mã đang chọn */}
      {currentSelectedVoucher && (
        <div className="mt-3 flex items-center justify-between bg-blue-100/50 rounded-xl px-3 py-2 border border-blue-200/50">
          <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1.5">
            <FiCheck size={12} className="text-blue-600" />
            Đang áp dụng: <span className="font-mono tracking-wider">{currentSelectedVoucher}</span>
          </span>
          <button type="button" onClick={handleClearVoucher}
            className="text-[10px] text-blue-500 hover:text-red-500 font-bold cursor-pointer transition-colors">
            Bỏ chọn
          </button>
        </div>
      )}
    </div>
  )
}
