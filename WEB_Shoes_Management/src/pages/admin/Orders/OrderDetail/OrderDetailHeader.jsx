import { motion } from 'framer-motion'
import { FiArrowLeft, FiCalendar, FiXCircle, FiPrinter } from 'react-icons/fi'
import { formatDateTime } from '~/utils/formatters'
import { ORDER_STATUS } from '~/utils/constant'
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge'

export const OrderDetailHeader = ({ order, onBack, onForceCancel, isCancellable }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
        >
          <FiArrowLeft size={20} className="text-gray-600" />
        </motion.button>

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Đơn hàng #{order.id}
            </h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge paymentStatus={order.payment_status} />
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <FiCalendar size={14} className="text-gray-400" />
            {formatDateTime(order.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isCancellable && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onForceCancel}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
          >
            <FiXCircle size={16} />
            Ép hủy đơn hàng
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}