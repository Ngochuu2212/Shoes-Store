import { useFormContext, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiFolder, FiFolderPlus, FiFileText, FiInfo } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const CategoryFormFields = ({ parentCategories, isEditMode }) => {
  const { register, control, formState: { errors }, watch } = useFormContext()

  const selectedParentId = watch('parentId')

  const getParentLabel = () => {
    if (!selectedParentId) return 'Danh mục gốc'
    const parent = parentCategories?.find(c => c.id === Number(selectedParentId))
    return parent ? parent.name : 'Danh mục gốc'
  }

  const getParentIcon = () => {
    return selectedParentId ? FiFolderPlus : FiFolder
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
          <FiInfo className="text-emerald-500" size={16} />
        </div>
        Thông tin danh mục
      </h3>

      <div className="space-y-5">
        {/* Tên danh mục */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiFolder size={14} className="text-emerald-500" />
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name', {
              required: 'Vui lòng nhập tên danh mục',
              minLength: { value: 2, message: 'Tối thiểu 2 ký tự' },
              maxLength: { value: 100, message: 'Tối đa 100 ký tự' }
            })}
            placeholder="Nhập tên danh mục"
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

        {/* Danh mục cha */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiFolderPlus size={14} className="text-emerald-500" />
            Danh mục cha
          </label>
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => {
              const ParentIcon = getParentIcon()
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10">
                      <span className="flex items-center gap-2">
                        <ParentIcon size={16} className="text-emerald-500" />
                        {getParentLabel()}
                      </span>
                      <FiFolderPlus size={16} className="text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[200px] rounded-xl shadow-xl border-gray-100 z-50 max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem
                      onClick={() => field.onChange(null)}
                      className="text-sm font-semibold cursor-pointer py-2.5 hover:bg-emerald-500/5 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 text-gray-600"
                    >
                      <FiFolder size={16} className="text-emerald-500" />
                      Danh mục gốc
                    </DropdownMenuItem>
                    {parentCategories?.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => field.onChange(category.id)}
                        className="text-sm font-semibold cursor-pointer py-2.5 hover:bg-emerald-500/5 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 text-gray-600"
                        disabled={category.id === field.value}
                      >
                        <FiFolderPlus size={16} className="text-purple-400" />
                        {category.name}
                        {category.id === field.value && (
                          <span className="text-[10px] text-emerald-500 ml-auto">(Đang chọn)</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }}
          />
          <p className="text-[10px] text-gray-400 font-medium pl-1">
            * Để trống nếu đây là danh mục gốc
          </p>
        </div>

        {/* Mô tả */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiFileText size={14} className="text-emerald-500" />
            Mô tả
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 500, message: 'Tối đa 500 ký tự' }
            })}
            placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
            rows={4}
            className="w-full rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-3 px-4 font-semibold text-gray-800 transition-all duration-300 resize-none outline-none focus:border-emerald-500 border"
          />
          {errors.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-red-500 font-bold pl-1"
            >
              {errors.description.message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}