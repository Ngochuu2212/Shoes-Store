import { useFormContext, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiUser, FiHome, FiMapPin, FiFileText, FiDollarSign, FiChevronDown } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const StoreFormFields = ({ users, selectedOwnerId, setValue }) => {
  const { register, control, formState: { errors } } = useFormContext()

  const getSelectedUser = () => {
    const user = users.find(u => u.id === Number(selectedOwnerId))
    return user ? `${user.fullname} (${user.email})` : 'Chọn chủ sở hữu'
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
          <FiHome className="text-emerald-500" size={16} />
        </div>
        Thông tin cửa hàng
      </h3>

      <div className="space-y-5">
        {/* Chọn chủ sở hữu */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiUser size={14} className="text-emerald-500" />
            Chủ sở hữu <span className="text-red-500">*</span>
          </label>
          <Controller
            name="ownerId"
            control={control}
            rules={{ required: 'Vui lòng chọn chủ sở hữu' }}
            render={({ field }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10">
                    <span className="flex items-center gap-2">
                      <FiUser size={16} className="text-gray-400" />
                      {getSelectedUser()}
                    </span>
                    <FiChevronDown size={16} className="text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[300px] max-h-64 overflow-y-auto rounded-xl shadow-xl border-gray-100 z-50">
                  {users.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-400">
                      Không có người dùng nào
                    </div>
                  ) : (
                    users.map((user) => (
                      <DropdownMenuItem
                        key={user.id}
                        onClick={() => {
                          field.onChange(user.id)
                          setValue('ownerId', user.id)
                        }}
                        className="text-sm font-semibold cursor-pointer py-2.5 hover:bg-emerald-500/5 transition-colors duration-200 flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                          {user.fullname?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.fullname}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                          <p className="text-[10px] text-gray-400">ID: #{user.id}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          {errors.ownerId && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.ownerId.message}
            </motion.p>
          )}
        </div>

        {/* Tên cửa hàng */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiHome size={14} className="text-emerald-500" />
            Tên cửa hàng <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name', {
              required: 'Vui lòng nhập tên cửa hàng',
              minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
              maxLength: { value: 100, message: 'Tối đa 100 ký tự' }
            })}
            placeholder="Nhập tên cửa hàng"
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiMapPin size={14} className="text-emerald-500" />
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('address', {
              required: 'Vui lòng nhập địa chỉ',
              minLength: { value: 5, message: 'Tối thiểu 5 ký tự' },
              maxLength: { value: 500, message: 'Tối đa 500 ký tự' }
            })}
            placeholder="Nhập địa chỉ cửa hàng"
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

        {/* Giới thiệu */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiFileText size={14} className="text-emerald-500" />
            Giới thiệu
          </label>
          <textarea
            {...register('bio', {
              maxLength: { value: 500, message: 'Tối đa 500 ký tự' }
            })}
            rows={3}
            placeholder="Nhập giới thiệu về cửa hàng..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 p-4 text-sm font-medium text-gray-700 transition-all duration-300 resize-none"
          />
          {errors.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.bio.message}
            </motion.p>
          )}
        </div>

        {/* Phí hoa hồng */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiDollarSign size={14} className="text-emerald-500" />
            Phí hoa hồng (%)
          </label>
          <Input
            {...register('commissionRate', {
              min: { value: 0, message: 'Tối thiểu 0%' },
              max: { value: 100, message: 'Tối đa 100%' }
            })}
            type="number"
            placeholder="10"
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          <p className="text-[11px] text-gray-400">Mặc định: 10% (để trống nếu muốn dùng mặc định)</p>
          {errors.commissionRate && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.commissionRate.message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}