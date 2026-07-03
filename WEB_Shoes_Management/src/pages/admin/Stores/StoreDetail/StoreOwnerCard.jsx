import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { getImageUrl, formatDateTime } from '~/utils/formatters'
import { Link } from 'react-router-dom'

export const StoreOwnerCard = ({ owner }) => {
  if (!owner) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
      >
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <FiUser className="text-purple-500" size={16} />
          </div>
          Chủ sở hữu
        </h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-400 font-medium">Không có thông tin chủ sở hữu</p>
        </div>
      </motion.div>
    )
  }

  const avatarUrl = getImageUrl(owner.avatar, `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(owner.fullname || 'User')}`)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <FiUser className="text-purple-500" size={16} />
        </div>
        Chủ sở hữu
      </h3>

      <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
        <img
          src={avatarUrl}
          alt={owner.fullname}
          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div className="flex-1">
          <Link to={`/admin/users/${owner.id}`} className="font-extrabold text-gray-900 hover:text-emerald-600 transition-colors">
            {owner.fullname}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {owner.is_active === 1 ? (
              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                <FiCheckCircle size={12} /> Đang hoạt động
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <FiXCircle size={12} /> Đã khóa
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <FiMail size={14} className="text-gray-400" />
          <span className="text-gray-600">{owner.email}</span>
        </div>
        {owner.phone && (
          <div className="flex items-center gap-2 text-sm">
            <FiPhone size={14} className="text-gray-400" />
            <span className="text-gray-600">{owner.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <FiCalendar size={14} className="text-gray-400" />
          <span className="text-gray-600">Tham gia: {formatDateTime(owner.created_at)}</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          to={`/admin/users/${owner.id}`}
          className="text-sm font-semibold text-emerald-600 hover:underline transition-all duration-200 inline-flex items-center gap-1"
        >
          Xem chi tiết người dùng
          <FiUser size={14} />
        </Link>
      </div>
    </motion.div>
  )
}