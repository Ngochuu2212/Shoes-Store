import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiCheckCircle, FiXCircle, FiEdit2 } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { ROLE_ID } from '~/utils/constant'

export const UserDetailHeader = ({ user, onToggleActive, onChangeRole, onBack }) => {
  const avatarUrl = getImageUrl(user.avatar, `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(user.fullname || 'User')}`)

  const getRoleName = (roleId) => {
    const roles = {
      [ROLE_ID.ADMIN]: 'Quản trị viên',
      [ROLE_ID.MANAGER]: 'Điều hành viên',
      [ROLE_ID.VENDOR]: 'Người bán',
      [ROLE_ID.USER]: 'Người dùng'
    }
    return roles[roleId] || 'Không xác định'
  }

  const getRoleColor = (roleId) => {
    const colors = {
      [ROLE_ID.ADMIN]: 'text-red-600 bg-red-50 border-red-200',
      [ROLE_ID.MANAGER]: 'text-purple-600 bg-purple-50 border-purple-200',
      [ROLE_ID.VENDOR]: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      [ROLE_ID.USER]: 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return colors[roleId] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
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

        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <img
              src={avatarUrl}
              alt={user.fullname}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          </motion.div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {user.fullname}
              </h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getRoleColor(user.role_id)}`}>
                {getRoleName(user.role_id)}
              </span>
              {user.is_active === 1 ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">
                  <FiCheckCircle className="inline mr-1" size={10} />
                  Đang hoạt động
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                  <FiXCircle className="inline mr-1" size={10} />
                  Đã khóa
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">ID: #{user.id}</span>
              <span className="text-sm text-gray-400">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center gap-3">
        {/* Nút Chỉnh sửa */}
        <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={`/admin/users/edit/${user.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
          >
            <FiEdit2 size={16} />
            Chỉnh sửa
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}