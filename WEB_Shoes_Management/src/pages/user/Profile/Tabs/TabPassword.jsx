import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { InputField } from '~/components/common/InputField'

export const TabPassword = ({ loading, onUpdateProfile }) => {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, watch, reset, setError, formState: { errors } } = useForm({
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' }
  })

  const onPasswordSubmit = async (data) => {
    try {
      await onUpdateProfile(
        {
          oldPassword: data.oldPassword,
          password: data.password
        },
        () => reset()
      )
    } catch (error) {
      // Xử lý lỗi từ backend
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra'

      if (errorMessage.includes('Mật khẩu hiện tại không chính xác')) {
        setError('oldPassword', {
          type: 'manual',
          message: 'Mật khẩu hiện tại không chính xác'
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onPasswordSubmit)} className="pt-8 space-y-6 w-full animate-fadeIn">
      <h3 className="text-base font-extrabold text-brand-secondary border-l-4 border-brand-secondary pl-3 flex items-center gap-2">
        <FiLock className="shrink-0" size={18} />
        <span>Đổi mật khẩu tài khoản</span>
      </h3>

      {/* Mật khẩu cũ */}
      <div className="relative">
        <InputField
          label="Mật khẩu hiện tại"
          type={showOldPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={FiLock}
          {...register('oldPassword', {
            required: 'Vui lòng nhập mật khẩu hiện tại để xác minh.',
            minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' }
          })}
          error={errors.oldPassword}
        />
        <button
          type="button"
          onClick={() => setShowOldPassword(!showOldPassword)}
          className="absolute right-4 top-[50px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      {/* Mật khẩu mới */}
      <div className="relative">
        <InputField
          label="Mật khẩu mới"
          type={showNewPassword ? 'text' : 'password'}
          placeholder="Thiết lập mật khẩu mới"
          icon={FiLock}
          {...register('password', {
            required: 'Vui lòng thiết lập mật khẩu mới.',
            minLength: { value: 6, message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự.' },
            validate: (value) => {
              if (value && watch('oldPassword') && value === watch('oldPassword')) {
                return 'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
              }
              return true
            }
          })}
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-4 top-[50px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      {/* Xác nhận mật khẩu mới */}
      <div className="relative">
        <InputField
          label="Xác nhận mật khẩu mới"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu mới"
          icon={FiLock}
          {...register('confirmPassword', {
            required: 'Vui lòng nhập lại mật khẩu mới để xác thực.',
            validate: (value) => value === watch('password') || 'Mật khẩu xác nhận không trùng khớp.'
          })}
          error={errors.confirmPassword}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-[50px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-secondary hover:bg-[#0f3460]/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </form>
  )
}