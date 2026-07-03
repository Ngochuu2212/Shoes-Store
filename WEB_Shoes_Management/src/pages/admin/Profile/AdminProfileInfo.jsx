import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { InputField } from '~/components/common/InputField'

export const AdminProfileInfo = ({ user, loading, onUpdateProfile }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (user) {
      setValue('fullname', user.fullname)
      setValue('phone', user.phone || '')
      setValue('address', user.address || '')
    }
  }, [user, setValue])

  return (
    <form onSubmit={handleSubmit(onUpdateProfile)} className="pt-2 space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Họ và tên"
          type="text"
          placeholder="Nhập họ và tên"
          icon={FiUser}
          {...register('fullname', {
            required: 'Họ và tên là thông tin bắt buộc.',
            minLength: { value: 2, message: 'Họ và tên phải chứa ít nhất 2 ký tự.' }
          })}
          error={errors.fullname}
        />
        <InputField
          label="Địa chỉ Email (Không thể thay đổi)"
          type="email"
          value={user?.email || ''}
          disabled
          icon={FiMail}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-6 px-4 pl-11 text-sm text-gray-900 cursor-not-allowed outline-none select-none"
        />
      </div>

      <InputField
        label="Số điện thoại"
        type="text"
        placeholder="Nhập số điện thoại"
        icon={FiPhone}
        {...register('phone', {
          required: 'Số điện thoại là thông tin bắt buộc.',
          pattern: {
            value: /^0\d{9}$/,
            message: 'Số điện thoại cá nhân phải có đúng 10 chữ số và bắt đầu bằng số 0.'
          }
        })}
        error={errors.phone}
      />

      <InputField
        label="Địa chỉ"
        type="text"
        placeholder="Nhập địa chỉ"
        icon={FiMapPin}
        {...register('address', {
          required: 'Địa chỉ là thông tin bắt buộc.',
          minLength: { value: 5, message: 'Vui lòng nhập địa chỉ cụ thể và rõ ràng hơn.' }
        })}
        error={errors.address}
      />

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
}