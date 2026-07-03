import { motion } from 'framer-motion'
import { FiHome, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getImageUrl, formatPrice } from '~/utils/formatters'

export const UserStoreCard = ({ user }) => {
  const store = user.store

  // Kiểm tra user có phải là Vendor không
  const isVendor = user.role_id === 3

  if (!isVendor) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
      >
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gray-500/10 flex items-center justify-center">
            <FiHome className="text-gray-500" size={16} />
          </div>
          Thông tin cửa hàng
        </h3>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FiHome size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Người dùng này chưa có cửa hàng</p>
          <p className="text-xs text-gray-400">Tài khoản đang ở vai trò người dùng thường</p>
        </div>
      </motion.div>
    )
  }

  if (!store) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
      >
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FiHome className="text-emerald-500" size={16} />
          </div>
          Thông tin cửa hàng
        </h3>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FiHome size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Chưa đăng ký cửa hàng</p>
          <p className="text-xs text-gray-400">Người dùng đã có vai trò Vendor nhưng chưa tạo cửa hàng</p>
        </div>
      </motion.div>
    )
  }

  const logoUrl = getImageUrl(store.logo, 'https://placehold.co/100x100?text=Store')
  const productStats = store.productStats || { totalProducts: 0, activeProducts: 0, inactiveProducts: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiHome className="text-emerald-500" size={16} />
        </div>
        Thông tin cửa hàng
      </h3>

      <div className="space-y-4">
        {/* Thông tin cơ bản */}
        <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
          <img
            src={logoUrl}
            alt={store.name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-200"
          />
          <div className="flex-1">
            <p className="font-extrabold text-gray-900">{store.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">ID: #{store.id}</span>
              {store.is_active === 1 ? (
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

        {/* Thống kê cửa hàng */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50/50 rounded-lg p-2 text-center">
            <FiPackage className="mx-auto text-gray-400" size={14} />
            <p className="text-lg font-black text-gray-800">{productStats.totalProducts}</p>
            <p className="text-[8px] text-gray-400">Tổng SP</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <FiCheckCircle className="mx-auto text-green-500" size={14} />
            <p className="text-lg font-black text-green-600">{productStats.activeProducts}</p>
            <p className="text-[8px] text-green-500">Đang bán</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <FiXCircle className="mx-auto text-red-500" size={14} />
            <p className="text-lg font-black text-red-600">{productStats.inactiveProducts}</p>
            <p className="text-[8px] text-red-500">Ngừng bán</p>
          </div>
        </div>

        {/* Thông tin tài chính */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50/50 rounded-lg p-2">
            <p className="text-[8px] text-gray-400">Số dư ví</p>
            <p className="text-sm font-black text-emerald-600">{formatPrice(store.balance || 0)}</p>
          </div>
          <div className="bg-gray-50/50 rounded-lg p-2">
            <p className="text-[8px] text-gray-400">Phí hoa hồng</p>
            <p className="text-sm font-black text-gray-800">{store.commission_rate || 10}%</p>
          </div>
        </div>

        {/* Địa chỉ cửa hàng */}
        {store.address && (
          <div className="bg-gray-50/50 rounded-lg p-2">
            <p className="text-[8px] text-gray-400">Địa chỉ cửa hàng</p>
            <p className="text-xs font-semibold text-gray-700">{store.address}</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link
          to={`/admin/stores/${store.id}`}
          className="text-sm font-semibold text-emerald-600 hover:underline transition-all duration-200 inline-flex items-center gap-1"
        >
          Xem chi tiết cửa hàng
          <FiHome size={14} />
        </Link>
      </div>
    </motion.div>
  )
}