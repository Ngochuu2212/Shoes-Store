import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiActivity } from 'react-icons/fi'
import { formatDateTime } from '~/utils/formatters'

export const UserInfoCard = ({ user }) => {
  const infoItems = [
    { icon: FiUser, label: 'Họ và tên', value: user.fullname },
    { icon: FiMail, label: 'Email', value: user.email },
    { icon: FiPhone, label: 'Số điện thoại', value: user.phone || 'Chưa cập nhật' },
    { icon: FiMapPin, label: 'Địa chỉ', value: user.address || 'Chưa cập nhật' },
    { icon: FiActivity, label: 'Trạng thái online', value: user.is_online ? 'Đang hoạt động' : 'Không hoạt động' },
    { icon: FiCalendar, label: 'Ngày tham gia', value: formatDateTime(user.created_at) },
    {
      icon: user.is_active === 1 ? FiCheckCircle : FiXCircle,
      label: 'Trạng thái tài khoản',
      value: user.is_active === 1 ? 'Đang hoạt động' : 'Đã khóa',
      valueColor: user.is_active === 1 ? 'text-green-600' : 'text-red-600'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiUser className="text-emerald-500" size={16} />
        </div>
        Thông tin cá nhân
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100"
          >
            <item.icon size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
              <p className={`font-semibold text-gray-800 ${item.valueColor || ''}`}>
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}