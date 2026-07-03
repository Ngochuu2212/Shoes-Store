import { motion } from 'framer-motion'
import { FiUser, FiCalendar } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { StarRating } from './StarRating'

export const CustomerInfoCard = ({ customer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
    >
      <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
        <FiUser className="text-brand-primary" /> Thông tin khách hàng
      </h3>
      <div className="flex items-center gap-4">
        <img
          src={getImageUrl(customer.avatar, 'https://placehold.co/80x80?text=User')}
          alt={customer.fullname}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="flex-1">
          <p className="text-xl font-extrabold text-gray-800">{customer.fullname}</p>
          <p className="text-sm text-gray-500">ID: #{customer.userId}</p>
          {customer.orderId && (
            <p className="text-xs text-gray-400 mt-1">Mã đơn hàng: #{customer.orderId}</p>
          )}
        </div>
        <div className="text-right">
          <StarRating rating={customer.rating} />
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <FiCalendar size={14} /> {customer.createdAt}
          </p>
        </div>
      </div>
    </motion.div>
  )
}