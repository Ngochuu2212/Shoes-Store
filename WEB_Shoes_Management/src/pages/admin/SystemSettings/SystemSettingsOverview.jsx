import { motion } from 'framer-motion'
import { FiSettings, FiServer, FiPercent, FiPhone, FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

export const SystemSettingsOverview = ({ settings }) => {
  if (!settings) return null

  const items = [
    {
      title: 'Trạng thái hệ thống',
      value: settings.is_maintenance ? 'Đang bảo trì' : 'Đang hoạt động',
      icon: settings.is_maintenance ? FiAlertCircle : FiCheckCircle,
      color: settings.is_maintenance ? 'border-l-red-500 text-red-600' : 'border-l-green-500 text-green-600',
      bg: settings.is_maintenance ? 'from-red-50/60 to-white' : 'from-green-50/60 to-white',
      blob: settings.is_maintenance ? 'bg-red-100/50' : 'bg-green-100/50',
      textColor: settings.is_maintenance ? 'text-red-600' : 'text-green-600',
      hoverBg: settings.is_maintenance ? 'hover:bg-red-50' : 'hover:bg-green-50'
    },
    {
      title: 'Phí hoa hồng mặc định',
      value: `${settings.global_commission_rate}%`,
      icon: FiPercent,
      color: 'border-l-purple-500 text-purple-600',
      bg: 'from-purple-50/60 to-white',
      blob: 'bg-purple-100/50',
      textColor: 'text-purple-600',
      hoverBg: 'hover:bg-purple-50'
    },
    {
      title: 'Hotline hỗ trợ',
      value: settings.hotline || 'Chưa cập nhật',
      icon: FiPhone,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50',
      textColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-50'
    },
    {
      title: 'Email hỗ trợ',
      value: settings.support_email || 'Chưa cập nhật',
      icon: FiMail,
      color: 'border-l-emerald-500 text-emerald-600',
      bg: 'from-emerald-50/60 to-white',
      blob: 'bg-emerald-100/50',
      textColor: 'text-emerald-600',
      hoverBg: 'hover:bg-emerald-50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-4 overflow-hidden ${item.hoverBg} cursor-pointer transition-none`}
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <div>
              <item.icon size={14} className={item.color.split(' ')[1]} />
            </div>
          </div>
          <p className={`text-lg font-black mt-1.5 ${item.textColor}`}>
            {item.value}
          </p>
        </div>
      ))}
    </motion.div>
  )
}