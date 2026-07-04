import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useGoogleLogin } from '@react-oauth/google'
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
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState('')
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
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || ''
      if (error.response?.status === 403 && errMsg.includes('khóa')) {
        setBlockedMessage(errMsg)
        setShowBlockedModal(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const response = await authService.googleLogin(tokenResponse.access_token)

        if (response) {
          toast.success(response.message || 'Đăng nhập bằng Google thành công!')

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
      } catch (error) {
        const errMsg = error.response?.data?.message || ''
        if (error.response?.status === 403 && errMsg.includes('khóa')) {
          setBlockedMessage(errMsg)
          setShowBlockedModal(true)
        } else {
          toast.error(error.response?.data?.message || 'Đăng nhập bằng Google thất bại!')
        }
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      toast.error('Đăng nhập bằng Google thất bại!')
    }
  })

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
          {/* Nút đăng nhập bằng Google */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle size={18} />
            <span>Đăng nhập với Google</span>
          </motion.button>

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

      {/* Blocked Account Modal */}
      <AnimatePresence>
        {showBlockedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-rose-600" />
              
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm shadow-red-50 animate-bounce">
                  <FiAlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl font-black text-gray-800">Tài khoản bị khóa</h3>
                
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {blockedMessage || 'Tài khoản của bạn đã bị khóa bởi quản trị viên do vi phạm điều khoản chính sách của hệ thống.'}
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-4 w-full mt-5 border border-gray-100 text-left text-xs text-gray-400">
                  <p className="font-bold text-gray-600 mb-1">Cần hỗ trợ?</p>
                  <p>Nếu bạn cho rằng đây là một sự nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ của Shoes Store qua email support@shoesstore.com để được giải quyết nhanh nhất.</p>
                </div>
                
                <button
                  onClick={() => setShowBlockedModal(false)}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-red-100 transition-all duration-200 cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}