import { motion } from 'framer-motion'
import { FiUser } from 'react-icons/fi'
import { AdminProfileAccount } from './AdminProfileAccount'

export const AdminProfilePage = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <FiUser className="text-emerald-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Hồ sơ của tôi</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý thông tin cá nhân và tài khoản</p>
        </div>
      </motion.div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 gap-6">
        <AdminProfileAccount />
      </div>
    </div>
  )
}