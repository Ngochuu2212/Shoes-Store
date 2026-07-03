import { motion } from 'framer-motion'
import { FiMessageSquare, FiMapPin, FiStar, FiPackage, FiCalendar } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { useNavigate } from 'react-router-dom'
import { useChat } from '~/contexts/ChatContext'
import { chatApiService } from '~/services/chat/chatApiService'

export const StoreProfileHeader = ({ store }) => {
  const navigate = useNavigate()
  const { openChatWithStore } = useChat()

  // Xử lý khi bấm nút Chat
  const handleChatWithStore = async () => {
    if (store) {
      await chatApiService.initConversation(store.id)
      openChatWithStore(store.id, store.name)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  }

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: '0px 5px 15px rgba(199, 54, 82, 0.4)',
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    tap: { scale: 0.95 }
  }

  const statsCardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8"
    >
      {/* Banner */}
      <motion.div
        className="h-48 md:h-64 w-full relative bg-gray-200 overflow-hidden"
        variants={itemVariants}
      >
        <motion.img
          src={getImageUrl(store?.banner)}
          alt="Banner"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        {/* Lớp phủ đen nhẹ để chữ/logo nổi hơn nếu cần */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
      </motion.div>

      {/* Thông tin Cửa hàng */}
      <div className="relative px-6 pb-8 sm:px-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 relative z-10 mb-6">
          {/* Logo */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md shrink-0"
            variants={imageVariants}
            whileHover="hover"
          >
            <img
              src={getImageUrl(store.logo, 'https://via.placeholder.com/150')}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Tên & Nút Chat */}
          <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-6">
            <motion.div variants={itemVariants}>
              <motion.h1
                className="text-2xl font-extrabold text-brand-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {store.name}
              </motion.h1>
              <motion.p
                className="text-sm text-gray-500 mt-1 flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <FiMapPin className="animate-pulse" /> {store.address || 'Chưa cập nhật địa chỉ'}
              </motion.p>
            </motion.div>

            <motion.button
              onClick={handleChatWithStore}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-sm cursor-pointer relative overflow-hidden group"
            >
              {/* Ripple effect */}
              <motion.span
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 2, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <FiMessageSquare size={18} className="relative z-10" />
              <span className="relative z-10">Chat với Shop</span>
            </motion.button>
          </div>
        </div>

        {/* Thống kê & Giới thiệu */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-2xl p-5 border border-gray-100"
          variants={itemVariants}
        >
          <motion.div
            className="md:col-span-2 space-y-2"
            variants={statsCardVariants}
            whileHover="hover"
          >
            <motion.h3
              className="font-bold text-gray-800 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Giới thiệu cửa hàng
            </motion.h3>
            <motion.p
              className="text-sm text-gray-600 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {store.bio || 'Cửa hàng này chưa cập nhật thông tin giới thiệu.'}
            </motion.p>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={statsCardVariants}
            whileHover="hover"
          >
            {[
              { icon: FiPackage, label: 'Sản phẩm:', value: store.total_products || 0, color: 'text-brand-primary' },
              { icon: FiStar, label: 'Đánh giá:', value: `${Number(store.rating_average || 0).toFixed(1)} / 5.0`, color: 'text-yellow-500' },
              { icon: FiCalendar, label: 'Tham gia:', value: new Date(store.created_at).toLocaleDateString('vi-VN'), color: 'text-gray-800' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between text-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              >
                <span className="text-gray-500 flex items-center gap-2">
                  <stat.icon className={stat.color} /> {stat.label}
                </span>
                <motion.span
                  className={`font-bold ${stat.color}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {stat.value}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}