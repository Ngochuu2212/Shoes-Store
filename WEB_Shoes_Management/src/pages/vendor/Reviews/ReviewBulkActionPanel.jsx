import { motion } from 'framer-motion'
import { FiCheckSquare, FiFlag, FiRefreshCw, FiX } from 'react-icons/fi'

export const ReviewBulkActionPanel = ({ selectedCount, onBulkAction, onClearSelection, hasUnreportedItems = true, hasInactiveItems = true }) => {
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
          onClick={() => onBulkAction('report')}
          disabled={!hasUnreportedItems}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
            hasUnreportedItems
              ? 'bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 hover:shadow-amber-500/20'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          <FiFlag size={14} /> Báo cáo vi phạm
        </button>

        <button
          onClick={() => onBulkAction('reopen')}
          disabled={!hasInactiveItems}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
            hasInactiveItems
              ? 'bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-200 hover:shadow-blue-500/20'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          <FiRefreshCw size={14} /> Yêu cầu mở lại
        </button>
      </div>
    </motion.div>
  )
}