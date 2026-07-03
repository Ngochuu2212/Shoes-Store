import { motion } from 'framer-motion'
import { FiShoppingBag, FiFilter, FiTrendingUp } from 'react-icons/fi'

export const OrderSearchResultsInfo = ({ totalItems, currentPage, limit, activeFiltersCount }) => {
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50/30 rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left section - Results count */}
          <div className="flex items-center gap-4">
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <FiShoppingBag className="text-brand-primary" size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng số đơn hàng</p>
                <p className="text-xl font-extrabold text-gray-900 leading-tight">
                  {totalItems.toLocaleString('vi-VN')}
                </p>
              </div>
            </motion.div>

            <div className="w-px h-8 bg-gray-200 hidden sm:block" />

            {/* Active filters badge */}
            {activeFiltersCount > 0 && (
              <motion.div variants={itemVariants} className="flex items-center gap-2">
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
              </motion.div>
            )}
          </div>

          {/* Right section - Pagination info */}
          {totalItems > 0 && (
            <motion.div variants={itemVariants} className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <FiTrendingUp size={12} className="text-green-500" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phân trang</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-brand-primary">{startItem}</span>
                <span className="text-sm text-gray-400">–</span>
                <span className="text-lg font-extrabold text-brand-primary">{endItem}</span>
                <span className="text-sm text-gray-400 mx-1">/</span>
                <span className="text-lg font-extrabold text-gray-800">{totalItems.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(endItem / totalItems) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-rose-400"
                  />
                </div>
                <span className="text-[9px] font-semibold text-gray-400">
                  {Math.round((endItem / totalItems) * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom bar với status */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <p className="text-[11px] text-gray-500">
              Đang lọc theo <span className="font-bold text-gray-700">{activeFiltersCount}</span> điều kiện
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}