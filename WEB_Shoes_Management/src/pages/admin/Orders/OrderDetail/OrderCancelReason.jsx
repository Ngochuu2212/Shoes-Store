import { motion } from 'framer-motion'
import { FiInfo } from 'react-icons/fi'

export const OrderCancelReason = ({ order, delay = 0.3 }) => {
  if (!order.cancel_reason) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
          <FiInfo className="text-red-500" size={16} />
        </div>
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Lý do hủy đơn hàng</p>
          <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">
            {order.cancel_reason}
          </p>
        </div>
      </div>
    </motion.div>
  )
}