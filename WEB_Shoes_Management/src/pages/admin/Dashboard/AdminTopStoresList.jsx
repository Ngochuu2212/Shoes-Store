import { motion } from 'framer-motion'
import { FiAward, FiHome, FiTrendingUp } from 'react-icons/fi'
import { formatPrice, getImageUrl } from '~/utils/formatters'
import { Link } from 'react-router-dom'

const MEDALS = [
  { color: '#F59E0B', bg: 'from-yellow-400 to-amber-500', glow: 'shadow-amber-200', label: 'Gold' },
  { color: '#94A3B8', bg: 'from-slate-400 to-slate-500', glow: 'shadow-slate-200', label: 'Silver' },
  { color: '#D97706', bg: 'from-orange-400 to-amber-600', glow: 'shadow-orange-200', label: 'Bronze' }
]

const RankBadge = ({ index }) => {
  if (index < 3) {
    const medal = MEDALS[index]
    return (
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center font-black text-sm text-white shadow-md ${medal.glow} shrink-0`}>
        {index + 1}
      </div>
    )
  }
  return (
    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-sm shrink-0">
      {index + 1}
    </div>
  )
}

export const AdminTopStoresList = ({ stores }) => {
  if (!stores || stores.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[420px] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
          <FiHome size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Chưa có cửa hàng bán chạy</p>
      </div>
    </div>
  )

  const maxRevenue = Math.max(...stores.map(s => s.totalRevenue || 0))

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  }

  const itemVariant = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
            <FiAward className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Top cửa hàng bán chạy</h3>
            <p className="text-xs text-gray-400 mt-0.5">Xếp hạng theo doanh thu</p>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          {stores.length} cửa hàng
        </span>
      </div>

      {/* List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="overflow-y-auto max-h-[420px] divide-y divide-gray-50 custom-scrollbar"
      >
        {stores.map((store, idx) => {
          const pct = store.totalRevenue && maxRevenue > 0
            ? Math.round((store.totalRevenue / maxRevenue) * 100)
            : 0
          return (
            <Link
              key={store.id}
              to={`/admin/stores/${store.id}`}
              className="block"
            >
              <motion.div
                variants={itemVariant}
                whileHover={{ backgroundColor: '#fafafa' }}
                className="flex items-center gap-4 px-6 py-4 transition-colors duration-150 cursor-pointer group"
              >
                <RankBadge index={idx} />

                {/* Store info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors duration-150">
                    {store.name || `Cửa hàng #${store.id}`}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 mb-2">
                    <FiTrendingUp size={10} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      <span className="font-bold text-gray-600">{store.totalOrders || 0}</span> đơn hàng
                    </span>
                  </div>
                  {/* Revenue bar */}
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>

                {/* Revenue */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-emerald-600">{formatPrice(store.totalRevenue || 0)}</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{pct}% top</p>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}