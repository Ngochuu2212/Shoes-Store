import { motion } from 'framer-motion'
import { FiHome, FiUser, FiPhone, FiMapPin } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'

export const OrderStoreInfo = ({ order, delay = 0.2 }) => {
  const storeLogo = getImageUrl(order.store_logo,
    `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(order.store_name || 'Store')}`)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <FiHome className="text-purple-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin cửa hàng</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={storeLogo}
            alt={order.store_name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
          />
          <div>
            <p className="font-bold text-gray-800">{order.store_name}</p>
            <p className="text-xs text-gray-400">ID: {order.store_id}</p>
          </div>
        </div>

        {order.owner_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUser size={14} className="text-gray-400" />
            <span>Chủ shop: {order.owner_name}</span>
          </div>
        )}

        {order.owner_phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiPhone size={14} className="text-gray-400" />
            <span>{order.owner_phone}</span>
          </div>
        )}

        {order.store_address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FiMapPin size={14} className="text-gray-400 mt-0.5" />
            <span>{order.store_address}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}