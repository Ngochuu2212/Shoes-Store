import { motion } from 'framer-motion'
import { FiCheckSquare, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi'

export const ReviewBulkActionPanel = ({
  selectedCount,
  onBulkAction,
  onClearSelection
}) => {
  if (selectedCount === 0) return null

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
          Đã chọn <strong className="text-brand-primary font-black px-1">{selectedCount}</strong> đánh giá
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
        <button
          onClick={() => onBulkAction('approved')}
          className="flex items-center gap-1.5 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
        >
          <FiCheckCircle size={14} /> Bác đơn - Mở lại đánh giá
        </button>
        <button
          onClick={() => onBulkAction('banned')}
          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
        >
          <FiXCircle size={14} /> Đồng ý - Ẩn đánh giá
        </button>
      </div>
    </motion.div>
  )
}