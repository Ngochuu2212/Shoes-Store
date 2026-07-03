import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { InputField } from '~/components/common/InputField'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldLabel } from '~/components/ui/field'
import { authService } from '~/services/auth/authService'
import { productService } from '~/services/user/productService'
import { cartApiService } from '~/services/user/cartService'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { loginSuccess, setFavorites } from '~/redux/user/userSlice'
import { setCartCount } from '~/redux/user/cartSlice'

export const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const { email, password } = data

    try {
      const response = await authService.login({ email, password })

      if (response) {
        toast.success(response.message || 'Đăng nhập thành công!')

        dispatch(loginSuccess({
          user: response.user,
          accessToken: response.accessToken
        }))

        const [favoritesData, cartItems] = await Promise.all([
          productService.getFavorites(),
          cartApiService.getCart()
        ])

        if (Array.isArray(favoritesData)) {
          const favoriteIds = favoritesData.map(item => item.product_id)
          dispatch(setFavorites(favoriteIds))
        }

        if (Array.isArray(cartItems)) {
          const totalItemsCount = cartItems.reduce((sum, item) => sum + item.cart_quantity, 0)
          dispatch(setCartCount(totalItemsCount))
        }

        navigate(response.redirectUrl || '/')
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
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
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
        className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center"
      >
        {/* Logo Brand */}
        <motion.div variants={slideLeft}>
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">ShoesStore</span>
          </Link>
        </motion.div>

        <motion.div variants={slideRight} className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-sm text-gray-500">Vui lòng đăng nhập để tiếp tục mua sắm</p>
        </motion.div>

        <motion.div variants={slideUp} className="w-full max-w-md space-y-6">
          {/* Nút đăng nhập mạng xã hội */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FcGoogle size={18} />
              <span>Google</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FaFacebookF size={16} className="text-[#1877F2]" />
              <span>Facebook</span>
            </motion.button>
          </div>

          {/* Đường gạch ngang phân cách */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Hoặc với Email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div variants={slideLeft}>
              <InputField
                label="Email của bạn"
                type="email"
                placeholder="example@gmail.com"
                icon={FiMail}
                {...register('email', {
                  required: 'Vui lòng nhập địa chỉ Email.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Định dạng Email không hợp lệ.' }
                })}
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={slideRight} className="relative">
              <InputField
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={FiLock}
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu.'
                })}
                error={errors.password}
              />

              <Link
                to="/forgot-password"
                className="absolute right-1 top-0 text-xs font-bold text-brand-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[50px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </motion.div>

            <motion.div variants={slideLeft}>
              <Field orientation="horizontal" className="items-center gap-2.5 pt-1">
                <Checkbox
                  id="rememberMe"
                  className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                  onCheckedChange={(checked) => setValue('rememberMe', checked)}
                />
                <FieldLabel
                  htmlFor="rememberMe"
                  className="text-sm text-gray-500 font-normal cursor-pointer select-none leading-none"
                >
                  Ghi nhớ đăng nhập
                </FieldLabel>
              </Field>
            </motion.div>

            <motion.button
              variants={slideUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 ease-out
                         hover:bg-[#c73652] hover:shadow-lg hover:shadow-[#e94560]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </motion.button>

            <motion.p variants={slideUp} className="text-sm text-gray-600 text-center pt-2">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="text-brand-primary font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </motion.p>
          </form>
        </motion.div>

        {/* Chân trang Sub Footer */}
        <motion.div
          variants={slideUp}
          className="flex items-center gap-6 text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4 w-full justify-center select-none"
        >
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Chính sách bảo mật</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Điều khoản dịch vụ</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Trợ giúp</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}