import { useState, useEffect } from 'react'
import { FiTag, FiChevronDown, FiCheck, FiLoader, FiX } from 'react-icons/fi'
import { promotionApiService } from '~/services/user/promotionService'
import { formatPrice } from '~/utils/formatters'
import {
  Combobox,
  ComboboxEmpty,
  ComboboxList
} from '~/components/ui/combobox'

export const CartVoucherPicker = ({ item, onSelectVoucher, currentSelectedVoucher }) => {
  const [open, setOpen] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  // Load dữ liệu động từ API khi mở Combobox
  useEffect(() => {
    if (!item.store_id) return
    const loadStoreVouchers = async () => {
      try {
        const data = await promotionApiService.getPromotionsByStore(item.store_id)
        if (Array.isArray(data)) setVouchers(data)
      } catch (error) {
        console.error('Lỗi nạp khuyến mãi:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStoreVouchers()
  }, [item.store_id])

  // Hàm xóa mã giảm giá
  const handleClearVoucher = () => {
    onSelectVoucher(item.store_id, null, 0)
    setOpen(false)
  }

  if (!loading && vouchers.length === 0) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer uppercase shadow-sm
          ${currentSelectedVoucher ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
      >
        {loading ? <FiLoader size={12} className="animate-spin text-brand-primary" /> : <FiTag size={12} />}
        <span>{loading ? 'Đang tải mã...' : (currentSelectedVoucher || 'Chọn mã giảm giá')}</span>
        <FiChevronDown size={10} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-64 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          <Combobox>
            <ComboboxList className="max-h-44 overflow-y-auto p-1 space-y-0.5">
              {loading ? (
                <div className="flex items-center justify-center py-4 text-gray-400 gap-1.5 text-[11px]">
                  <FiLoader size={12} className="animate-spin text-brand-primary" />
                  <span>Đang quét voucher...</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClearVoucher}
                    className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2
                      ${!currentSelectedVoucher ? 'bg-gray-100 text-gray-600 font-bold' : 'hover:bg-gray-50 text-gray-500'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FiX size={12} className="text-gray-400" />
                      <span>Không chọn mã giảm giá</span>
                    </span>
                    {!currentSelectedVoucher && <FiCheck size={11} className="text-brand-primary shrink-0" />}
                  </button>

                  {vouchers.length > 0 && (
                    <div className="border-t border-gray-100 my-1" />
                  )}

                  {/* Danh sách voucher */}
                  {vouchers.length === 0 ? (
                    <ComboboxEmpty className="text-[10px] text-gray-400 p-3 italic text-center">
                      Cửa hàng hiện chưa phát hành mã giảm giá nào.
                    </ComboboxEmpty>
                  ) : (
                    vouchers.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          onSelectVoucher(item.store_id, v.name, Number(v.discount_value))
                          setOpen(false)
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5
                          ${currentSelectedVoucher === v.name ? 'bg-brand-primary/5 text-brand-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <span className="font-bold tracking-wide flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-gray-800 truncate">{v.name}</span>
                            <span className="bg-red-50 text-red-500 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-red-100 shrink-0">
                              -{Math.round(v.discount_value)}%
                            </span>
                          </div>
                          {currentSelectedVoucher === v.name && <FiCheck size={11} className="text-brand-primary shrink-0" />}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal line-clamp-1">
                          {v.description || `Giảm ngay ${Math.round(v.discount_value)}% cho đơn từ ${formatPrice(v.min_order_value)}`}
                        </span>
                      </button>
                    ))
                  )}
                </>
              )}
            </ComboboxList>
          </Combobox>
        </div>
      )}
    </div>
  )
}