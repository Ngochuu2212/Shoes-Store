import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '~/components/ui/input'
import {
  FiChevronDown, FiBox, FiGrid, FiDollarSign, FiAlignLeft, FiInfo
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const BasicInfoSection = ({ categories }) => {
  const { register, control, formState: { errors } } = useFormContext()

  const findCategoryName = (categories, id) => {
    for (const cat of categories) {
      if (cat.id === id) return cat.displayName || cat.name
      if (cat.children) {
        const found = findCategoryName(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <h3 className="text-xl font-extrabold text-brand-secondary tracking-tight flex items-center gap-2">
          <FiInfo className="text-brand-primary" size={22} /> Thông tin sản phẩm
        </h3>
        <p className="text-xs text-gray-400 font-semibold mt-1">Cung cấp các chi tiết cơ bản cho sản phẩm</p>
      </div>

      <div className="space-y-6">
        {/* Tên sản phẩm */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiBox size={14} className="text-brand-primary" /> Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })}
            placeholder="VD: Giày Thể Thao Sneaker Nam Nữ..."
            className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-brand-primary/20 py-5 font-semibold text-gray-800 transition-all duration-300"
          />
          {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-500 font-bold pl-1">{errors.name.message}</motion.p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Danh mục */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
              <FiGrid size={14} className="text-brand-primary" /> Danh mục <span className="text-red-500">*</span>
            </label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Vui lòng chọn danh mục' }}
              render={({ field }) => {
                const selectedCatName = findCategoryName(categories, field.value)

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex w-full items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-brand-primary/10">
                        <span>{selectedCatName || 'Chọn danh mục'}</span>
                        <FiChevronDown size={16} className="text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px] max-h-60 overflow-y-auto rounded-xl shadow-xl border-gray-100 z-50">
                      {categories.map(c => (
                        <DropdownMenuItem
                          key={c.id}
                          onClick={() => field.onChange(c.id)}
                          className="text-sm font-semibold cursor-pointer py-2.5 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors duration-200"
                          style={{
                            paddingLeft: c.level ? `${c.level * 20 + 12}px` : '12px',
                            borderLeft: c.level && c.level > 0 ? '2px solid #e5e7eb' : 'none',
                            marginLeft: c.level && c.level > 0 ? '8px' : '0'
                          }}
                        >
                          {c.level && c.level > 0 && <span className="text-gray-400 mr-2">└</span>}
                          {c.name}
                          {c.children && c.children.length > 0 && (
                            <span className="ml-2 text-xs text-gray-400">({c.children.length})</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }}
            />
            {errors.categoryId && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-500 font-bold pl-1">{errors.categoryId.message}</motion.p>}
          </div>

          {/* Giá bán */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
              <FiDollarSign size={14} className="text-brand-primary" /> Giá bán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register('price', { required: 'Vui lòng nhập giá', min: { value: 1000, message: 'Giá tối thiểu 1000đ' } })}
              placeholder="VD: 550000"
              className="rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-brand-primary/20 py-5 font-bold text-brand-secondary transition-all duration-300"
            />
            {errors.price && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-brand-secondary font-bold pl-1">{errors.price.message}</motion.p>}
          </div>
        </div>

        {/* Mô tả */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiAlignLeft size={14} className="text-brand-primary" /> Mô tả sản phẩm
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Viết mô tả chi tiết, chất liệu, hướng dẫn sử dụng..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 p-4 text-sm font-medium text-gray-700 transition-all duration-300 resize-none"
          />
        </div>
      </div>
    </motion.div>
  )
}