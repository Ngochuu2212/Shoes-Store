import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiUsers } from 'react-icons/fi'
import { vendorFavoriteApiService } from '~/services/vendor/vendorFavoriteApiService'
import { getImageUrl } from '~/utils/formatters'

export const FavoriteUsersModal = ({ isOpen, onClose, productId, productName }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true)
      // Lấy danh sách tối đa 50 user thả tim gần nhất (hoặc làm phân trang sau)
      vendorFavoriteApiService.getProductFavoriteDetail(productId, 1, 50)
        .then(res => setUsers(res.users))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [isOpen, productId])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden z-10 relative flex flex-col max-h-[80vh]"
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                  <FiUsers size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Khách hàng quan tâm</h3>
                  <p className="text-[11px] font-semibold text-gray-500 line-clamp-1 w-64">{productName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            {/* Danh sách Users */}
            <div className="p-2 overflow-y-auto flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-semibold">Chưa có dữ liệu khách hàng.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {users.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50/80 rounded-xl transition-colors">
                      <img src={getImageUrl(user.avatar, 'https://placehold.co/100')} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.fullname}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}