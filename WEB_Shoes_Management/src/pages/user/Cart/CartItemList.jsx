import { FiTrash2, FiMinus, FiPlus, FiHome, FiPackage, FiCheckSquare } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatPrice, getImageUrl } from '~/utils/formatters'
import { CartVoucherPicker } from './CartVoucherPicker'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export const CartItemList = ({
  cartItems,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  onUpdateQuantity,
  onRemoveItem,
  storeVouchers = {},
  onStoreVoucherSelect,
  handleRequestRemoveSelectedBulk
}) => {
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

  const groupedCart = cartItems.reduce((groups, item) => {
    if (!groups[item.store_id]) {
      groups[item.store_id] = {
        store_id: item.store_id,
        store_name: item.store_name,
        store_logo: item.store_logo,
        items: []
      }
    }
    groups[item.store_id].items.push(item)
    return groups
  }, {})

  const getCartItemImage = (item) => {
    if (item.variant_image) {
      // Nếu variant_image là object có secure_url
      if (item.variant_image.secure_url) {
        return item.variant_image.secure_url
      }
    }
    // Fallback sang product_images
    return getImageUrl(item.product_images, 'https://placehold.co/100x100?text=Product')
  }

  return (
    <div className="space-y-6">
      {/* Thanh công cụ Chọn tất cả */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <label className="flex items-center gap-3 cursor-pointer select-none font-semibold text-gray-700 text-sm">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary"
          />
          Chọn tất cả ({cartItems.length} sản phẩm)
        </label>
        {selectedItems.length > 0 && (
          <button
            type="button"
            onClick={handleRequestRemoveSelectedBulk}
            className="text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 animate-fadeIn active:scale-95"
          >
            <FiTrash2 size={13} />
            <span>Xóa mục đã chọn ({selectedItems.length})</span>
          </button>
        )}
      </div>

      {Object.values(groupedCart).map((storeGroup) => {
        // Kiểm tra xem trong cửa hàng này có item nào đang được tick chọn không
        const selectedItemsInStore = storeGroup.items.filter(item => selectedItems.includes(item.variant_id))
        const isStoreActive = selectedItemsInStore.length > 0
        const currentVoucher = storeVouchers[storeGroup.store_id] || null

        return (
          <div key={storeGroup.store_id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

            <div className="bg-gray-50/50 border-b border-gray-100 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-extrabold text-brand-secondary">
                {storeGroup.store_logo?.secure_url ? (
                  <img
                    src={storeGroup.store_logo.secure_url}
                    alt={storeGroup.store_name}
                    className="w-5 h-5 rounded-full object-cover border border-gray-100"
                  />
                ) : (
                  <FiHome className="text-brand-primary" size={16} />
                )}
                {storeGroup.store_name}
              </div>

              {/* Chỉ hiện ô chọn Voucher của Shop khi khách có tick chọn ít nhất 1 món của Shop này */}
              {isStoreActive && (
                <CartVoucherPicker
                  item={{ store_id: storeGroup.store_id }}
                  onSelectVoucher={onStoreVoucherSelect}
                  currentSelectedVoucher={currentVoucher?.code}
                />
              )}
            </div>

            {/* ── DANH SÁCH SẢN PHẨM CỦA CỬA HÀNG ĐÓ ── */}
            <div className="p-4 space-y-4">
              {storeGroup.items.map((item) => {
                const isSelected = selectedItems.includes(item.variant_id)

                // Tính toán tiền: Chỉ áp % của Shop Voucher vào sản phẩm
                const totalBasePrice = Number(item.base_price) * item.cart_quantity
                const backendPromoPercent = Number(item.discount_percentage || 0)
                const backendDiscountAmount = totalBasePrice * (backendPromoPercent / 100)

                // Lấy % voucher của Store cha áp xuống
                const voucherDiscountPercent = currentVoucher ? currentVoucher.discountValue : 0
                const voucherDiscountValue = totalBasePrice * (voucherDiscountPercent / 100)

                const totalFinalPrice = Math.max(0, totalBasePrice - backendDiscountAmount - voucherDiscountValue)

                const imageUrl = getCartItemImage(item)

                return (
                  <div key={item.cart_id} className="flex gap-4 items-center relative group transition-all duration-300 ease-in-out hover:bg-gray-50/50 p-2 -mx-2 rounded-xl">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.variant_id)}
                      className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary shrink-0"
                    />

                    <Link to={`/product/${item.product_slug}`} className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center cursor-pointer shadow-sm relative">
                      <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                      {item.variant_image && (
                        <div className="absolute top-0 right-0 bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                          VAR
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 text-left space-y-1">
                      <Link to={`/product/${item.product_slug}`} className="font-bold text-gray-800 text-sm line-clamp-1 hover:text-brand-primary cursor-pointer block">
                        {item.product_name}
                      </Link>
                      <p className="text-xs text-gray-400 font-medium">
                        Size: <span className="text-gray-600 font-bold mr-3">{item.size}</span>
                        Màu: <span className="text-gray-600 font-bold">{item.color}</span>
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium pt-0.5">
                        <FiPackage size={12} />
                        <span>Kho còn: <strong className="text-gray-600">{item.current_stock}</strong></span>
                      </div>

                      <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-white mt-1.5 shadow-sm overflow-hidden">
                        <button type="button" disabled={item.cart_quantity <= 1} onClick={() => onUpdateQuantity(item.variant_id, item.cart_quantity - 1)} className="px-2 py-1 text-gray-500 hover:text-brand-primary hover:bg-gray-50 disabled:opacity-30 cursor-pointer"><FiMinus size={12} /></button>
                        <span className="px-3 text-xs font-bold text-gray-700 min-w-[24px] text-center select-none">{item.cart_quantity}</span>
                        <button type="button" disabled={item.cart_quantity >= item.current_stock} onClick={() => onUpdateQuantity(item.variant_id, item.cart_quantity + 1)} className="px-2 py-1 text-gray-500 hover:text-brand-primary hover:bg-gray-50 disabled:opacity-30 cursor-pointer"><FiPlus size={12} /></button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[100px] space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRemoveItem(item.variant_id) }}
                            className="text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white p-2 rounded-xl transition-all duration-300 ease-in-out shadow-sm hover:shadow-md active:scale-95 cursor-pointer flex items-center justify-center" >
                            <FiTrash2 size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Xóa</p></TooltipContent>
                      </Tooltip>

                      <div className="text-right space-y-0.5">
                        {(backendDiscountAmount > 0 || voucherDiscountValue > 0) && (
                          <p className="text-xs text-gray-400 line-through font-medium">{formatPrice(totalBasePrice)}</p>
                        )}
                        <p className="font-extrabold text-base text-brand-secondary">{formatPrice(totalFinalPrice)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}