import { motion } from 'framer-motion'
import { FiUserCheck, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi'

export const OrderRecipientInfo = ({ order, delay = 0.15 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiUserCheck className="text-emerald-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Người nhận hàng</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-gray-100">
            <FiUserCheck size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{order.recipient_name || order.buyer_name}</p>
          </div>
        </div>

        {order.recipient_phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiPhone size={14} className="text-gray-400" />
            <span>{order.recipient_phone}</span>
          </div>
        )}

        {order.shipping_address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FiMapPin size={14} className="text-gray-400 mt-0.5" />
            <span>{order.shipping_address}</span>
          </div>
        )}

        {order.payment_method && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCreditCard size={14} className="text-gray-400" />
            <span>Phương thức: {order.payment_method}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}