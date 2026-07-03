import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { InputField } from '~/components/common/InputField'
import { authService } from '~/services/auth/authService'
import { toast } from 'react-toastify'

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '' }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const { email } = data

    try {
      const response = await authService.forgotPassword(email)

      if (response) {
        toast.success(response.message || 'Mã OTP khôi phục đã được gửi tới Email của bạn!')
        navigate('/reset-password', { state: { email } })
      }
    } finally {
      setLoading(false)
    }
  }

  const slideLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const slideRight = {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const slideUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-brand-secondary flex items-center justify-center p-4 md:p-8"
    >
      <motion.div
        variants={slideLeft}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center"
      >
        {/* Logo Brand */}
        <motion.div variants={slideLeft}>
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">ShoesStore</span>
          </Link>
        </motion.div>

        <motion.div variants={slideRight} className="w-full max-w-md flex flex-col items-center">
          {/* Icon Chìa khóa */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-red-50 text-brand-primary rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm"
          >
            <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </motion.div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 text-center">Quên mật khẩu?</h1>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-xs leading-relaxed">
            Đừng lo lắng! Hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
            <motion.div variants={slideLeft}>
              <InputField
                label="Địa chỉ Email"
                type="email"
                placeholder="example@gmail.com"
                icon={FiMail}
                {...register('email', {
                  required: 'Vui lòng cung cấp địa chỉ Email để nhận mã OTP.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Định dạng Email không hợp lệ.' }
                })}
                error={errors.email}
              />
            </motion.div>

            <motion.button
              variants={slideUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 ease-out
                         hover:bg-[#c73652] hover:shadow-lg hover:shadow-[#e94560]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2 group"
            >
              <span>{loading ? 'Đang gửi mã...' : 'Xác Nhận'}</span>
              {!loading && <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" size={16} />}
            </motion.button>

            <motion.div variants={slideUp} className="flex justify-center pt-2">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-1.5 font-semibold group"
              >
                <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-0.5" size={16} />
                <span>Quay lại Đăng nhập</span>
              </Link>
            </motion.div>
          </form>
        </motion.div>

        {/* Sub Footer */}
        <motion.div
          variants={slideUp}
          className="flex items-center gap-6 text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4 w-full justify-center select-none"
        >
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Chính sách bảo mật</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Điều khoản dịch vụ</span>
          <span>•</span>
          <span className="text-gray-500">Bạn gặp khó khăn khi nhận email? </span>
          <span className="text-brand-primary font-semibold hover:underline cursor-pointer">Trung tâm trợ giúp</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}