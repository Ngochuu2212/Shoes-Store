import { formatPrice } from '~/utils/formatters'
import { FiDollarSign, FiTag } from 'react-icons/fi'
import { IoWalletOutline } from 'react-icons/io5'

export const OrderPaymentSummary = ({ order }) => {
  const totalAmount = Number(order.total_amount) || 0
  const discountAmount = Number(order.discount_amount) || 0
  const walletAmountUsed = Number(order.wallet_amount_used) || 0
  const subTotal = totalAmount + discountAmount
  const finalTotal = Math.max(0, totalAmount - walletAmountUsed)

  // Tách mã voucher: có thể là "SHOPCODE+SYSTEMCODE" hoặc đơn lẻ
  const appliedVoucher = order.applied_voucher || null
  const voucherCodes = appliedVoucher ? appliedVoucher.split('+').filter(Boolean) : []

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg space-y-4">
      <h3 className="font-bold text-lg text-brand-secondary flex items-center gap-2">
        <FiDollarSign className="text-brand-primary" /> Thông tin thanh toán
      </h3>

      <div className="space-y-3 text-sm">
        {/* Giá gốc */}
        <div className="flex justify-between text-gray-500">
          <span>Tạm tính:</span>
          <span className='font-bold text-brand-secondary' >{formatPrice(subTotal)}</span>
        </div>

        {/* Giảm giá */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Giảm giá áp dụng:</span>
            <span>- {formatPrice(discountAmount)}</span>
          </div>
        )}

        {/* Mã giảm giá đã áp dụng */}
        {voucherCodes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {voucherCodes.map((code) => (
              <span key={code} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-200 bg-green-50 text-green-700">
                <FiTag size={9} />{code}
              </span>
            ))}
          </div>
        )}

        {/* Thanh toán bằng ví */}
        {walletAmountUsed > 0 && (
          <div className="flex justify-between text-blue-600 font-medium">
            <span className="flex items-center gap-1">
              <IoWalletOutline size={14} /> Thanh toán bằng ví:
            </span>
            <span>- {formatPrice(walletAmountUsed)}</span>
          </div>
        )}

        {/* Phí vận chuyển */}
        <div className="flex justify-between text-gray-500">
          <span>Phí vận chuyển:</span>
          <span className="text-green-600 font-bold">Miễn phí</span>
        </div>

        {/* Tổng cộng cuối cùng */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-bold text-gray-800">Tổng thanh toán:</span>
          <span className="text-xl font-extrabold text-brand-primary">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}