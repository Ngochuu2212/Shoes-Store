import { formatPrice } from '~/utils/formatters'
import { FiDollarSign } from 'react-icons/fi'

export const OrderPaymentSummary = ({ order }) => {
  const totalAmount = Number(order.total_amount) || 0
  const discountAmount = Number(order.discount_amount) || 0
  const subTotal = totalAmount + discountAmount

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
            <span>Giảm giá:</span>
            <span>- {formatPrice(discountAmount)}</span>
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
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  )
}