import { FiInfo, FiCheckCircle, FiXCircle, FiFlag } from 'react-icons/fi'

export const SystemStatusCard = ({ isActive, isReported }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
        <FiInfo className="text-brand-primary" /> Trạng thái hệ thống
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="text-sm font-semibold text-gray-600">Trạng thái hiển thị</span>
          <span className={`flex items-center gap-1.5 text-sm font-bold ${
            isActive ? 'text-green-600' : 'text-red-500'
          }`}>
            {isActive ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
            {isActive ? 'Đang hiển thị' : 'Đã bị ẩn'}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="text-sm font-semibold text-gray-600">Trạng thái báo cáo</span>
          <span className={`flex items-center gap-1.5 text-sm font-bold ${
            isReported ? 'text-amber-600' : 'text-gray-500'
          }`}>
            <FiFlag size={14} />
            {isReported ? 'Đã gửi báo cáo' : 'Chưa báo cáo'}
          </span>
        </div>
      </div>
    </div>
  )
}