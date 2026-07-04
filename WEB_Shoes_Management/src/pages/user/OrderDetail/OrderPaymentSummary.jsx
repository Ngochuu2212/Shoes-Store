import { formatPrice } from '~/utils/formatters'
import { FiDollarSign, FiTag, FiTruck } from 'react-icons/fi'
import { IoWalletOutline } from 'react-icons/io5'

export const OrderPaymentSummary = ({ order }) => {
  const totalAmount = Number(order.total_amount) || 0
  const discountAmount = Number(order.discount_amount) || 0
  const walletAmountUsed = Number(order.wallet_amount_used) || 0
  const shippingFee = Number(order.shipping_fee) || 0
  // Tiền hàng = total_amount + discount_amount - shipping_fee
  const subTotal = totalAmount + discountAmount - shippingFee
  const finalTotal = Math.max(0, totalAmount - walletAmountUsed)

  const SHIPPING_LABELS = { standard: 'Tiêu chuẩn', express: 'Nhanh', same_day: 'Hỏa tốc' }
  const shippingLabel = SHIPPING_LABELS[order.shipping_method] || 'Tiêu chuẩn'

  // Tách mã voucher: có thể là "SHOPCODE+SYSTEMCODE" hoặc đơn lẻ
  const appliedVoucher = order.applied_voucher || null
  const voucherCodes = appliedVoucher ? appliedVoucher.split('+').filter(Boolean) : []

  // Parse proof images
  let proofImages = []
  if (order.delivery_proof_images) {
    try {
      proofImages = typeof order.delivery_proof_images === 'string'
        ? JSON.parse(order.delivery_proof_images)
        : (Array.isArray(order.delivery_proof_images) ? order.delivery_proof_images : [])
    } catch { proofImages = [] }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg space-y-4">
      <h3 className="font-bold text-lg text-brand-secondary flex items-center gap-2">
        <FiDollarSign className="text-brand-primary" /> Thông tin thanh toán
      </h3>

      <div className="space-y-3 text-sm">
        {/* Giá gốc */}
        <div className="flex justify-between text-gray-500">
          <span>Tạm tính:</span>
          <span className='font-bold text-brand-secondary'>{formatPrice(subTotal)}</span>
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

        {/* Phí vận chuyển */}
        <div className="flex justify-between text-gray-500">
          <span className="flex items-center gap-1">
            <FiTruck size={13} /> Phí vận chuyển ({shippingLabel}):
          </span>
          {shippingFee > 0
            ? <span className="font-semibold text-orange-500">+ {formatPrice(shippingFee)}</span>
            : <span className="text-green-600 font-bold">Miễn phí</span>
          }
        </div>

        {/* Thanh toán bằng ví */}
        {walletAmountUsed > 0 && (
          <div className="flex justify-between text-blue-600 font-medium">
            <span className="flex items-center gap-1">
              <IoWalletOutline size={14} /> Thanh toán bằng ví:
            </span>
            <span>- {formatPrice(walletAmountUsed)}</span>
          </div>
        )}

        {/* Tổng cộng cuối cùng */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-bold text-gray-800">Tổng thanh toán:</span>
          <span className="text-xl font-extrabold text-brand-primary">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* Ảnh minh chứng giao hàng */}
      {proofImages.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            📸 Ảnh minh chứng giao hàng ({proofImages.length} ảnh)
          </p>
          <div className="flex flex-wrap gap-2">
            {proofImages.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt={`proof-${i}`} className="w-20 h-20 object-cover rounded-xl border border-gray-200 hover:scale-105 transition-transform cursor-pointer" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}