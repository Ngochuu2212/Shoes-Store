import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'

export const StoreStatusCard = ({ isActive }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <FiCheckCircle size={16} className="text-gray-500" />
          Trạng thái hoạt động
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
          isActive
            ? 'bg-green-50 text-green-600 border border-green-100'
            : 'bg-red-50 text-red-500 border border-red-100'
        }`}>
          {isActive ? (
            <>
              <FiCheckCircle size={12} />
              Đang hoạt động
            </>
          ) : (
            <>
              <FiXCircle size={12} />
              Chờ duyệt
            </>
          )}
        </span>
      </div>
      {!isActive && (
        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <FiAlertCircle size={12} />
          Cửa hàng của bạn đang chờ Ban quản trị phê duyệt. Một số chức năng có thể bị giới hạn.
        </p>
      )}
    </div>
  )
}