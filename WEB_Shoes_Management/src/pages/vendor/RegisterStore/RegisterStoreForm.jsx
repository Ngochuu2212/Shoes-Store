import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { vendorStoreApiService } from '~/services/vendor/vendorStoreApiService'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { ImageUploadBox } from './ImageUploadBox'
import { FiCheckCircle, FiHome, FiMapPin, FiAlignLeft, FiLayout } from 'react-icons/fi'

export const RegisterStoreForm = () => {
  const navigate = useNavigate()
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', bio: '', address: '' }
  })

  const onSubmit = async (data) => {
    if (!logoFile) return toast.warning('Vui lòng tải lên Logo cửa hàng')

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('bio', data.bio)
      formData.append('address', data.address)
      formData.append('logo', logoFile)
      if (bannerFile) formData.append('banner', bannerFile)

      const res = await vendorStoreApiService.registerStore(formData)
      toast.success(res.message)
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants cho container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 12 } }
  }

  const rightItemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 12 } }
  }

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Cột trái: Thông tin văn bản */}
        <motion.div variants={itemVariants} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-sm font-bold text-brand-secondary flex items-center gap-2 italic">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <FiHome className="text-brand-primary" />
              </motion.div>
              Tên gian hàng <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name', { required: 'Tên gian hàng không được để trống' })}
              placeholder="Vd: Sneaker World Luxury"
              className="rounded-2xl py-6 px-5 border-gray-200 focus:border-brand-primary transition-all duration-300 shadow-sm"
            />
            {errors.name && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-medium ml-2">{errors.name.message}</motion.p>}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-sm font-bold text-brand-secondary flex items-center gap-2 italic">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <FiMapPin className="text-brand-primary" />
              </motion.div>
              Địa chỉ kho hàng <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('address', { required: 'Vui lòng nhập địa chỉ lấy hàng' })}
              placeholder="Số nhà, tên đường, quận/huyện..."
              className="rounded-2xl py-6 px-5 border-gray-200 focus:border-brand-primary transition-all duration-300 shadow-sm"
            />
            {errors.address && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-medium ml-2">{errors.address.message}</motion.p>}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-sm font-bold text-brand-secondary flex items-center gap-2 italic">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <FiAlignLeft className="text-brand-primary" />
              </motion.div>
              Giới thiệu cửa hàng
            </label>
            <Textarea
              {...register('bio')}
              placeholder="Viết một vài dòng mô tả về shop của bạn..."
              className="rounded-[1.5rem] p-5 min-h-[180px] border-gray-200 focus:border-brand-primary transition-all duration-300 shadow-sm resize-none"
            />
          </motion.div>
        </motion.div>

        {/* Cột phải: Hình ảnh */}
        <motion.div variants={rightItemVariants} className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ImageUploadBox label="Logo thương hiệu" file={logoFile} setFile={setLogoFile} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="hidden xl:block opacity-40 p-4 border-2 border-dashed border-gray-100 rounded-[2rem] flex items-center justify-center text-center text-xs font-medium"
            >
              Ảnh Logo giúp khách hàng nhận diện thương hiệu của bạn tốt hơn trên danh sách sản phẩm.
            </motion.div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ImageUploadBox label="Ảnh bìa gian hàng (Banner)" file={bannerFile} setFile={setBannerFile} aspectClass="aspect-[21/9]" icon={FiLayout} />
          </motion.div>
        </motion.div>
      </div>

      {/* Button Submit */}
      <motion.div
        variants={itemVariants}
        className="pt-8 border-t border-gray-100 flex justify-center sm:justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-primary text-white px-12 py-4 rounded-2xl font-extrabold shadow-lg shadow-brand-primary/20 hover:bg-[#c73652] transition-all duration-300 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <FiCheckCircle size={22} />
          )}
          {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐĂNG KÝ'}
        </motion.button>
      </motion.div>
    </motion.form>
  )
}