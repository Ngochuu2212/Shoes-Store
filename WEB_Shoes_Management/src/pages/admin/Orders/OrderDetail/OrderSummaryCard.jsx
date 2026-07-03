import { motion } from 'framer-motion'
import { FiDollarSign, FiPercent } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'

export const OrderSummaryCard = ({ order, delay = 0.25 }) => {
  const totalAmount = Number(order.total_amount) || 0
  const discountAmount = Number(order.discount_amount) || 0
  const commissionRate = Number(order.commission_rate_snapshot) || 0

  const subtotal = totalAmount + discountAmount
  const finalTotal = totalAmount

  const commissionAmount = (finalTotal * commissionRate) / 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <FiDollarSign className="text-amber-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin đơn hàng</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400">Tổng tiền hàng</p>
          <p className="font-bold text-gray-800">{formatPrice(subtotal)}</p>
        </div>

        {discountAmount > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400">Giảm giá</p>
            <p className="font-bold text-red-500">-{formatPrice(discountAmount)}</p>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold text-gray-400">Phí vận chuyển</p>
          <p className="font-bold text-gray-800">Miễn phí</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400">Thành tiền</p>
          <p className="text-xl font-black text-emerald-600">
            {formatPrice(finalTotal)}
          </p>
        </div>
      </div>

      {/* Phí hoa hồng */}
      <div className="mt-3 grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
          <FiPercent className="text-purple-500" size={14} />
          <div>
            <p className="text-[10px] font-bold text-gray-400">Phí hoa hồng</p>
            <p className="font-bold text-purple-600">{commissionRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <FiDollarSign className="text-blue-500" size={14} />
          <div>
            <p className="text-[10px] font-bold text-gray-400">Tiền hoa hồng</p>
            <p className="font-bold text-blue-600">{formatPrice(commissionAmount)}</p>
          </div>
        </div>
      </div>

      {order.applied_voucher && (
        <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs text-purple-600 font-semibold">
            Áp dụng voucher: {order.applied_voucher}
          </p>
        </div>
      )}
    </motion.div>
  )
}