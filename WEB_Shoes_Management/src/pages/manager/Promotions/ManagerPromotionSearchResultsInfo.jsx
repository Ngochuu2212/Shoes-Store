import { motion } from 'framer-motion'
import { FiTag, FiFilter } from 'react-icons/fi'

export const ManagerPromotionSearchResultsInfo = ({ totalItems, currentPage, limit, activeFiltersCount }) => {
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between flex-wrap gap-3 text-sm text-gray-500 font-semibold px-1"
    >
      <div className="flex items-center gap-2">
        <FiTag size={15} className="text-blue-600" />
        {totalItems === 0 ? (
          <span>Không tìm thấy mã khuyến mãi nào phù hợp</span>
        ) : (
          <span>
            Hiển thị <span className="text-blue-600 font-black">{startItem}–{endItem}</span> trong tổng số{' '}
            <span className="text-blue-600 font-black">{totalItems}</span> mã giảm giá hệ thống
          </span>
        )}
      </div>
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          <FiFilter size={12} /> <span>{activeFiltersCount} bộ lọc đang kích hoạt</span>
        </div>
      )}
    </motion.div>
  )
}
