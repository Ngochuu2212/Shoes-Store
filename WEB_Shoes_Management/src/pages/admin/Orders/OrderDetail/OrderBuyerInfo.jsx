import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'

export const OrderBuyerInfo = ({ order, delay = 0.1 }) => {
  const buyerAvatar = getImageUrl(order.buyer_avatar,
    `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(order.buyer_name || 'User')}`)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <FiUser className="text-blue-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Người đặt hàng</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={buyerAvatar}
            alt={order.buyer_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          />
          <div>
            <p className="font-bold text-gray-800">{order.buyer_name}</p>
            <p className="text-xs text-gray-400">ID: {order.user_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiMail size={14} className="text-gray-400" />
          <span>{order.buyer_email}</span>
        </div>

        {order.buyer_phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiPhone size={14} className="text-gray-400" />
            <span>{order.buyer_phone}</span>
          </div>
        )}

        {order.buyer_address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FiMapPin size={14} className="text-gray-400 mt-0.5" />
            <span>{order.buyer_address}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}