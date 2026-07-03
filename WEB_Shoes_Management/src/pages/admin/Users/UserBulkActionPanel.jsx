import { motion } from 'framer-motion'
import { FiCheckSquare, FiCheckCircle, FiXCircle, FiX, FiShield, FiStar, FiUser } from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { ROLE_ID } from '~/utils/constant'

export const UserBulkActionPanel = ({
  selectedCount,
  selectedUsers,
  onBulkAction,
  onClearSelection
}) => {
  if (selectedCount === 0) return null

  const hasActive = selectedUsers.some(u => u.is_active === 1)
  const hasInactive = selectedUsers.some(u => u.is_active === 0)
  const hasAdmin = selectedUsers.some(u => u.role_id === ROLE_ID.ADMIN)

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.35 }}
      className="bg-white border-2 border-emerald-500/20 p-4 rounded-2xl shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-40"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
          <FiCheckSquare size={16} />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          Đã chọn <strong className="text-emerald-500 font-black px-1">{selectedCount}</strong> người dùng
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
        {hasActive && (
          <button
            onClick={() => onBulkAction('deactivate')}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
          >
            <FaBan size={14} /> Khóa tài khoản
          </button>
        )}
        {hasInactive && (
          <button
            onClick={() => onBulkAction('activate')}
            className="flex items-center gap-1.5 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
          >
            <FiCheckCircle size={14} /> Mở khóa
          </button>
        )}
        {!hasAdmin && (
          <>
            <button
              onClick={() => onBulkAction('role_manager')}
              className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-500 text-purple-600 hover:text-white border border-purple-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
            >
              <FiStar size={14} /> Phân quyền Manager
            </button>
            <button
              onClick={() => onBulkAction('role_vendor')}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
            >
              <FiCheckCircle size={14} /> Phân quyền Vendor
            </button>
            <button
              onClick={() => onBulkAction('role_user')}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
            >
              <FiUser size={14} /> Phân quyền User
            </button>
          </>
        )}
        <button
          onClick={() => onBulkAction('delete')}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all duration-300"
        >
          <FiXCircle size={14} /> Xóa loạt
        </button>
      </div>
    </motion.div>
  )
}