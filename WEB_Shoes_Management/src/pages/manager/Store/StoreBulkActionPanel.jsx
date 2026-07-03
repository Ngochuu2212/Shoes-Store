import { motion } from 'framer-motion'
import { FiCheckSquare, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'

export const StoreBulkActionPanel = ({ selectedCount, selectedStores, onBulkAction, onClearSelection }) => {
  if (selectedCount === 0) return null

  const hasPending = selectedStores.some(s => s.is_active === 0 && (!s.owner_role || s.owner_role !== 'VENDOR'))
  const hasActive = selectedStores.some(s => s.is_active === 1)
  const hasBanned = selectedStores.some(s => s.is_active === 0 && s.owner_role === 'VENDOR')

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
          Đã chọn <strong className="text-brand-primary font-black px-1">{selectedCount}</strong> cửa hàng
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
        {hasPending && (
          <>
            <button
              onClick={() => onBulkAction('approve')}
              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
            >
              <FiCheckCircle size={14} /> Phê duyệt
            </button>
            <button
              onClick={() => onBulkAction('reject')}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
            >
              <FiXCircle size={14} /> Từ chối
            </button>
          </>
        )}
        {(hasActive || hasBanned) && (
          <button
            onClick={() => onBulkAction('ban')}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
          >
            <FaBan size={14} /> Khóa cửa hàng
          </button>
        )}
      </div>
    </motion.div>
  )
}