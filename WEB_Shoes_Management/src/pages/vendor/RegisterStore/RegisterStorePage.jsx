import { motion } from 'framer-motion'
import { RegisterStoreForm } from './RegisterStoreForm'
import { FiShoppingBag, FiInfo } from 'react-icons/fi'
import { usePageTitle } from '~/hooks/usePageTitle'

export const RegisterStorePage = () => {
  usePageTitle(
    'Đăng ký kênh người bán',
    'Đăng ký để bắt đầu kinh doanh cùng Shoes Store'
  )
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">

      <main className="max-w-6xl mx-auto px-4 flex-1 w-full mb-12">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
          className="bg-white rounded-[2.5rem] my-8 overflow-hidden shadow-shadow-custom border border-white"
        >
          {/* Header Section của Card */}
          <div className="bg-gradient-to-r from-brand-primary/5 via-transparent to-transparent p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-5"
            >
              <div className="w-16 h-16 bg-brand-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 shrink-0">
                <FiShoppingBag size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-brand-secondary tracking-tight">Kênh Người Bán</h1>
                <p className="text-gray-500 font-medium mt-1">
                  Đăng ký để bắt đầu kinh doanh cùng{' '}
                  <span className="text-brand-primary font-bold tracking-wide">ShoesStore</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold self-start md:self-center"
            >
              <FiInfo size={14} /> THỜI GIAN DUYỆT: 24H - 48H
            </motion.div>
          </div>

          {/* Form Content - nhảy từ phải sang */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 100 }}
            className="p-8 md:p-12 lg:p-16"
          >
            <RegisterStoreForm />
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}