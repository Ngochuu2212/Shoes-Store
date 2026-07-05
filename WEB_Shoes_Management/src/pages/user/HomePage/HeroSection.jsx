import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

export const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-16 my-4 sm:my-6 md:my-8 overflow-hidden shadow-shadow-custom"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
        {/* Bên trái: Text */}
        <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Bước chân tự tin,<br/>
            <span className="text-brand-primary">phong cách dẫn đầu</span>
          </motion.h1>

          <motion.p
            className="text-gray-500 text-sm sm:text-base md:text-lg leading-relaxed max-w-md text-justify"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Khám phá những mẫu giày thể thao mới nhất với công nghệ đệm êm ái, thiết kế thời thượng cho mọi hoạt động của bạn.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none"
            >
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 bg-brand-primary text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-[#c73652] transition-all hover:shadow-lg hover:shadow-[#e94560]/30 w-full sm:w-auto"
              >
                Mua ngay <FiArrowRight size={18} className="sm:w-5 sm:h-5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none"
            >
              <Link
                to="/products"
                className="flex items-center justify-center h-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all text-sm sm:text-base w-full sm:w-auto"
              >
                Xem thêm
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bên phải: Hình ảnh */}
        <motion.div
          className="relative group order-first md:order-last"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-brand-primary/20 rounded-2xl sm:rounded-3xl rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
            alt="Hero Shoe"
            className="relative rounded-2xl sm:rounded-3xl w-full h-[180px] sm:h-[250px] md:h-[350px] lg:h-[400px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </motion.div>
      </div>
    </motion.section>
  )
}