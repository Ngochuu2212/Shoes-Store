import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiHome, FiCheckCircle, FiXCircle, FiEdit2, FiDollarSign } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { useState } from 'react'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'

export const StoreDetailHeader = ({ store, onToggleActive, onUpdateCommission, onBack }) => {
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const logoUrl = getImageUrl(store.logo, 'https://placehold.co/200x200?text=Store')

  const handleCommissionSubmit = async (rate) => {
    setIsLoading(true)
    try {
      await onUpdateCommission(parseFloat(rate))
      setShowCommissionModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanSubmit = async (reason) => {
    setIsLoading(true)
    try {
      await onToggleActive(false, reason)
      setShowBanModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnban = async () => {
    setIsLoading(true)
    try {
      await onToggleActive(true, null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
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
                src={logoUrl}
                alt={store.name}
                className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-md"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${store.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
            </motion.div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {store.name}
                </h1>
                {store.is_active === 1 ? (
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
                <span className="text-sm text-gray-500">ID: #{store.id}</span>
                <span className="text-sm text-gray-400">{store.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {store.is_active === 1 ? (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBanModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
            >
              <FiXCircle size={16} /> Khóa cửa hàng
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnban}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white border border-green-200 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
            >
              <FiCheckCircle size={16} /> Mở khóa
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCommissionModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
          >
            <FiDollarSign size={16} /> Phí hoa hồng: {store.commission_rate}%
          </motion.button>
        </div>
      </motion.div>

      {/* Modal cập nhật phí hoa hồng */}
      <ConfirmReasonModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        onConfirm={handleCommissionSubmit}
        title="Cập nhật phí hoa hồng"
        message={`Nhập tỷ lệ phí hoa hồng mới cho cửa hàng "${store.name}" (0-100%):`}
        placeholder="Nhập tỷ lệ phần trăm (VD: 10)"
        isLoading={isLoading}
        type="approve"
      />

      {/* Modal xác nhận khóa cửa hàng */}
      <ConfirmReasonModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleBanSubmit}
        title="Khóa cửa hàng"
        message={`Vui lòng nhập lý do khóa cửa hàng "${store.name}". Lý do này sẽ được gửi đến chủ shop.`}
        placeholder="Nhập lý do khóa..."
        isLoading={isLoading}
      />
    </>
  )
}