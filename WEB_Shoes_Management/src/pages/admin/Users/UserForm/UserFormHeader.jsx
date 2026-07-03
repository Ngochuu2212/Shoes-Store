import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave, FiX, FiUserPlus, FiUser } from 'react-icons/fi'

export const UserFormHeader = ({ isEditMode, onCancel, onSubmit, isSubmitting, hasErrors }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-colors duration-300 shadow-sm cursor-pointer"
        >
          <FiArrowLeft size={20} />
        </motion.button>

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              {isEditMode ? (
                <FiUser className="text-emerald-500" size={20} />
              ) : (
                <FiUserPlus className="text-emerald-500" size={20} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                {isEditMode ? 'Cập nhật thông tin tài khoản' : 'Tạo tài khoản mới trên hệ thống'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
        >
          <FiX size={16} />
          Hủy bỏ
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || hasErrors}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <FiSave size={16} />
              {isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}