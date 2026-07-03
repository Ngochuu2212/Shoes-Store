import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiHome, FiInfo, FiMapPin, FiCamera, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'
import { InputField } from '~/components/common/InputField'
import { getImageUrl } from '~/utils/formatters'

export const StoreInfoForm = ({ store, loading, onSubmit, logoPreview, bannerPreview, onLogoChange, onBannerChange }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (store) {
      setValue('name', store.name || '')
      setValue('bio', store.bio || '')
      setValue('address', store.address || '')
    }
  }, [store, setValue])

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={formVariants}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Logo preview */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-6 pb-4 border-b border-gray-100"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <img src={logoPreview || 'https://placehold.co/100x100?text=Logo'} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <label htmlFor="logo-upload" className="absolute bottom-0 right-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#c73652] transition-all">
            <FiCamera size={10} />
          </label>
          <input type="file" id="logo-upload" accept="image/*" onChange={onLogoChange} className="hidden" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">Logo cửa hàng</p>
          <p className="text-[10px] text-gray-400">* Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
        </div>
      </motion.div>

      {/* Banner preview */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="w-full h-40 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
          <img src={bannerPreview || 'https://placehold.co/800x200?text=Banner'} alt="Banner" className="w-full h-full object-cover" />
        </div>
        <label htmlFor="banner-upload" className="absolute bottom-2 right-2 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#c73652] transition-all">
          <FiCamera size={10} />
        </label>
        <input type="file" id="banner-upload" accept="image/*" onChange={onBannerChange} className="hidden" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
      >
        <InputField
          label="Tên cửa hàng"
          type="text"
          placeholder="Nhập tên cửa hàng"
          icon={FiHome}
          {...register('name', { required: 'Tên cửa hàng là bắt buộc' })}
          error={errors.name}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          <FiInfo size={14} className="text-brand-primary" />
          Giới thiệu cửa hàng
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
      >
        <InputField
          label="Địa chỉ cửa hàng"
          type="text"
          placeholder="Nhập địa chỉ cửa hàng"
          icon={FiMapPin}
          {...register('address', { required: 'Địa chỉ cửa hàng là bắt buộc' })}
          error={errors.address}
        />
      </motion.div>

      {/* Trạng thái hoạt động */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-xl p-4"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <FiCheckCircle size={16} className="text-gray-500" />
            Trạng thái hoạt động
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            store?.is_active
              ? 'bg-green-50 text-green-600 border border-green-100'
              : 'bg-red-50 text-red-500 border border-red-100'
          }`}>
            {store?.is_active ? (
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
        {!store?.is_active && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <FiAlertCircle size={12} />
            Cửa hàng của bạn đang chờ Ban quản trị phê duyệt. Một số chức năng có thể bị giới hạn.
          </p>
        )}
      </motion.div>

      {/* Nút submit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex justify-end pt-4"
      >
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-secondary hover:bg-[#0f3460]/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </motion.div>
    </motion.form>
  )
}