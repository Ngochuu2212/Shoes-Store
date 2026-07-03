import { formatPrice } from '~/utils/formatters'
import { FiAlertCircle, FiShield } from 'react-icons/fi'

export const CartSummary = ({
  subTotal,
  discountAmount,
  finalTotal,
  hasSelectedItems,
  onSubmitOrder,
  loadingOrder
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left space-y-4">
      <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
        <FiShield size={15} className="text-brand-primary" />
        <span>Tóm tắt đơn hàng</span>
      </h3>

      {/* Dòng cảnh báo nhỏ tinh tế bằng icon-react nếu chưa tick chọn mua món nào */}
      {!hasSelectedItems && (
        <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-fadeIn items-start">
          <FiAlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600 font-medium leading-normal">
            Vui lòng tích chọn sản phẩm trong giỏ hàng để kích hoạt hệ thống tính tiền và giao nhận.
          </p>
        </div>
      )}

      {/* Khối hiển thị dòng tiền số liệu */}
      {/* Nếu chưa có cái chọn thì mặc định hiển thị 0đ */}
      <div className="space-y-2.5 pt-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Tạm tính hàng chọn:</span>
          <span className="font-semibold text-gray-800">
            {hasSelectedItems ? formatPrice(subTotal) : '0đ'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Giảm giá áp dụng:</span>
          <span className="font-semibold text-green-500">
            {hasSelectedItems && discountAmount > 0 ? `-${formatPrice(discountAmount)}` : '0đ'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span className="text-green-500 font-semibold">
            Miễn phí
          </span>
        </div>

        <div className="flex justify-between items-end pt-2.5 border-t border-gray-100">
          <span className="font-bold text-gray-800">Tổng cộng:</span>
          <span className="font-extrabold text-xl text-brand-primary tracking-tight">
            {hasSelectedItems ? formatPrice(finalTotal) : '0đ'}
          </span>
        </div>
      </div>

      {/* Nút Đặt Hàng */}
      <button
        type="button"
        onClick={onSubmitOrder}
        disabled={loadingOrder || !hasSelectedItems}
        className="w-full bg-brand-primary hover:bg-[#c73652] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer text-center text-sm"
      >
        {loadingOrder ? 'ĐANG XỬ LÝ ĐẶT HÀNG...' : 'ĐẶT HÀNG NGAY'}
      </button>
    </div>
  )
}