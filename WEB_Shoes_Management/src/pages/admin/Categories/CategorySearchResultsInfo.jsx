import { motion } from 'framer-motion'
import { FiGrid, FiFilter, FiTrendingUp } from 'react-icons/fi'

export const CategorySearchResultsInfo = ({ totalItems, currentPage, limit, activeFiltersCount }) => {
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50/30 rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="relative px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FiGrid className="text-emerald-500" size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng danh mục</p>
                <p className="text-xl font-extrabold text-gray-900 leading-tight">
                  {totalItems.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 hidden sm:block" />

            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <FiFilter className="text-amber-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bộ lọc đang dùng</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-amber-600">{activeFiltersCount}</span>
                    <span className="text-xs font-semibold text-gray-500">bộ lọc</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {totalItems > 0 && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <FiTrendingUp size={12} className="text-green-500" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phân trang</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-emerald-600">{startItem}</span>
                <span className="text-sm text-gray-400">–</span>
                <span className="text-lg font-extrabold text-emerald-600">{endItem}</span>
                <span className="text-sm text-gray-400 mx-1">/</span>
                <span className="text-lg font-extrabold text-gray-800">{totalItems.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(endItem / totalItems) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  />
                </div>
                <span className="text-[9px] font-semibold text-gray-400">
                  {Math.round((endItem / totalItems) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}