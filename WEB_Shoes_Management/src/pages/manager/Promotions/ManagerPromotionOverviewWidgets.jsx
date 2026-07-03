import { FiTag, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi'

export const ManagerPromotionOverviewWidgets = ({ overview }) => {
  const widgets = [
    {
      label: 'Tổng mã hệ thống',
      value: overview.totalPromotions,
      icon: <FiTag size={20} />,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Đang hoạt động',
      value: overview.activePromotions,
      icon: <FiCheckCircle size={20} />,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Không hoạt động',
      value: overview.inactivePromotions,
      icon: <FiXCircle size={20} />,
      color: 'text-gray-500',
      bg: 'bg-gray-100'
    },
    {
      label: 'Sắp hết hạn',
      value: overview.expiringSoonPromotions,
      icon: <FiAlertTriangle size={20} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((w, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl ${w.bg} ${w.color} flex items-center justify-center shrink-0`}>
            {w.icon}
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{w.value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{w.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
