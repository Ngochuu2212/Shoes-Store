import { motion } from 'framer-motion'
import { FiCheckSquare, FiPackage, FiTruck, FiCheckCircle, FiX } from 'react-icons/fi'
import { ORDER_STATUS } from '~/utils/constant'

export const OrderBulkActionPanel = ({ selectedCount, onBulkAction, onClearSelection }) => {
  if (selectedCount === 0) return null

  const bulkActions = [
    { value: ORDER_STATUS.PROCESSING, label: 'Xác nhận đơn hàng', icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-500' },
    { value: ORDER_STATUS.SHIPPED, label: 'Giao cho vận chuyển', icon: FiTruck, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-500' },
    { value: ORDER_STATUS.DELIVERED, label: 'Xác nhận đã giao', icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-500' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.35 }}
      className="bg-white border-2 border-brand-primary/20 p-4 rounded-2xl shadow-lg shadow-brand-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-40"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center shrink-0">
          <FiCheckSquare size={16} />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          Đã chọn <strong className="text-brand-primary font-black px-1">{selectedCount}</strong> đơn hàng
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-all duration-300 ease-out cursor-pointer flex items-center gap-1 ml-2 border-l border-gray-200 pl-4"
        >
          <FiX size={14} /> Bỏ chọn
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
        {bulkActions.map((action) => (
          <button
            key={action.value}
            onClick={() => onBulkAction(action.value)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${action.bg} ${action.color} border border-gray-200 hover:text-white`}
          >
            <action.icon size={14} /> {action.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}