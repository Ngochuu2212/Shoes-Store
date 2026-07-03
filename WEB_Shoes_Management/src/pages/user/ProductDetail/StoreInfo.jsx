import { FiMessageSquare, FiMapPin, FiStar, FiPackage, FiClock } from 'react-icons/fi'
import { BiStore } from 'react-icons/bi'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { storeService } from '~/services/user/storeService'
import { Link } from 'react-router-dom'
import { useChat } from '~/contexts/ChatContext'
import { chatApiService } from '~/services/chat/chatApiService'

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' }
  })
}

export const StoreInfo = ({ storeId }) => {
  const [store, setStore] = useState(null)
  const { openChatWithStore } = useChat()

  useEffect(() => {
    const fetchStore = async () => {
      if (storeId) {
        const storeData = await storeService.getStoreDetail(storeId)
        setStore(storeData)
      }
    }
    fetchStore()
  }, [storeId])

  const handleChatClick = async () => {
    if (store) {
      await chatApiService.initConversation(store.id)
      openChatWithStore(store.id, store.name)
    }
  }

  if (!store) return null

  const joinDate = new Date(store.created_at).toLocaleDateString('vi-VN')

  const stats = [
    { icon: <FiPackage size={18} />, label: 'Sản phẩm', value: store.total_products || 0, color: 'text-brand-primary' },
    { icon: <FiStar size={18} />, label: 'Đánh giá', value: store.rating_average || '0.0', color: 'text-gray-800' },
    { icon: <FiClock size={18} />, label: 'Tham gia', value: joinDate, color: 'text-gray-800' },
    {
      icon: <FiMapPin size={18} />,
      label: 'Khu vực',
      value: store.address ? store.address.split(',').pop().trim() : 'Đang cập nhật',
      color: 'text-gray-800',
      clamp: true
    }
  ]

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mt-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">

        {/* Khối bên trái */}
        <motion.div
          className="flex gap-4 items-center md:w-1/3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          <motion.div
            className="w-20 h-20 shrink-0 rounded-full border border-gray-100 overflow-hidden shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <img src={store.logo?.secure_url} alt={store.name} className="w-full h-full object-cover" />
          </motion.div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{store.name}</h3>
            <div className="flex gap-2">
              <motion.button
                onClick={handleChatClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e94560]/10 text-brand-primary border border-brand-primary/20 rounded-lg text-sm font-semibold hover:bg-brand-primary hover:text-white transition-all duration-300 cursor-pointer"
              >
                <FiMessageSquare size={14} /> Chat Ngay
              </motion.button>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to={`/store/${store.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-semibold hover:border-gray-400 hover:text-gray-800 transition-all duration-300 cursor-pointer"
                >
                  <BiStore size={14} /> Xem Shop
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Khối bên phải: Thống số */}
        <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 md:pl-8 md:border-l md:border-gray-100">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-3 text-sm"
              custom={i}
              variants={statVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-secondary shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500">{stat.label}</p>
                <p className={`font-bold ${stat.color} ${stat.clamp ? 'line-clamp-1' : ''}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  )
}