import { useFormContext, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock, FiChevronDown, FiShield, FiMapPin } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { ROLE_ID } from '~/utils/constant'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const UserFormFields = ({ isEditMode }) => {
  const { register, control, formState: { errors }, watch } = useFormContext()

  const roleOptions = [
    { value: ROLE_ID.ADMIN, label: 'Quản trị viên', icon: FiShield, color: 'text-red-600' },
    { value: ROLE_ID.MANAGER, label: 'Điều hành viên', icon: FiShield, color: 'text-purple-600' },
    { value: ROLE_ID.VENDOR, label: 'Người bán', icon: FiShield, color: 'text-emerald-600' },
    { value: ROLE_ID.USER, label: 'Người dùng', icon: FiShield, color: 'text-blue-600' },
    { value: ROLE_ID.SHIPPER, label: 'Shipper', icon: FiShield, color: 'text-orange-600' }
  ]

  const selectedRole = watch('roleId')

  const getCurrentRoleLabel = () => {
    const role = roleOptions.find(r => r.value === Number(selectedRole))
    return role ? role.label : 'Chọn vai trò'
  }

  const getCurrentRoleColor = () => {
    const role = roleOptions.find(r => r.value === Number(selectedRole))
    return role ? role.color : 'text-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiUser className="text-emerald-500" size={16} />
        </div>
        Thông tin tài khoản
      </h3>

      <div className="space-y-5">
        {/* Họ và tên */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiUser size={14} className="text-emerald-500" />
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('fullname', {
              required: 'Vui lòng nhập họ và tên',
              minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
              maxLength: { value: 50, message: 'Tối đa 50 ký tự' }
            })}
            placeholder="Nhập họ và tên"
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          {errors.fullname && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.fullname.message}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiMail size={14} className="text-emerald-500" />
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('email', {
              required: 'Vui lòng nhập email',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không hợp lệ'
              }
            })}
            type="email"
            placeholder="example@gmail.com"
            disabled={isEditMode}
            className={`rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300 ${
              isEditMode ? 'cursor-not-allowed opacity-60' : ''
            }`}
          />
          {isEditMode && (
            <p className="text-[11px] text-gray-400 font-medium pl-1">* Email không thể thay đổi</p>
          )}
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Số điện thoại */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiPhone size={14} className="text-emerald-500" />
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('phone', {
              required: 'Vui lòng nhập số điện thoại',
              pattern: {
                value: /^0[0-9]{9}$/,
                message: 'Số điện thoại bắt đầu bằng 0 và có 10 chữ số'
              }
            })}
            placeholder="0901 234 567"
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.phone.message}
            </motion.p>
          )}
        </div>

        {/* Địa chỉ - THÊM MỚI */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiMapPin size={14} className="text-emerald-500" />
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('address', {
              required: 'Vui lòng nhập địa chỉ',
              minLength: { value: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự' },
              maxLength: { value: 200, message: 'Địa chỉ tối đa 200 ký tự' }
            })}
            placeholder="Nhập địa chỉ (ví dụ: 123 Đường ABC, Quận 1, TP.HCM)"
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          {errors.address && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.address.message}
            </motion.p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiLock size={14} className="text-emerald-500" />
            Mật khẩu {!isEditMode && <span className="text-red-500">*</span>}
            {isEditMode && <span className="text-gray-400 font-normal text-[10px]">(Để trống nếu không đổi)</span>}
          </label>
          <Input
            {...register('password', {
              ...(!isEditMode && {
                required: 'Vui lòng nhập mật khẩu',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              }),
              ...(isEditMode && {
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })
            })}
            type="password"
            placeholder={isEditMode ? 'Nhập mật khẩu mới (nếu muốn đổi)' : 'Nhập mật khẩu'}
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          {errors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Vai trò */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiShield size={14} className="text-emerald-500" />
            Vai trò <span className="text-red-500">*</span>
          </label>
          <Controller
            name="roleId"
            control={control}
            rules={{ required: 'Vui lòng chọn vai trò' }}
            render={({ field }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex w-full items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${getCurrentRoleColor()}`}>
                    <span className="flex items-center gap-2">
                      <FiShield size={16} className={getCurrentRoleColor()} />
                      {getCurrentRoleLabel()}
                    </span>
                    <FiChevronDown size={16} className="text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px] rounded-xl shadow-xl border-gray-100 z-50">
                  {roleOptions.map((role) => {
                    const Icon = role.icon
                    return (
                      <DropdownMenuItem
                        key={role.value}
                        onClick={() => field.onChange(role.value)}
                        className={`text-sm font-semibold cursor-pointer py-2.5 hover:bg-emerald-500/5 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 ${role.color}`}
                      >
                        <Icon size={16} />
                        {role.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          {errors.roleId && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.roleId.message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}