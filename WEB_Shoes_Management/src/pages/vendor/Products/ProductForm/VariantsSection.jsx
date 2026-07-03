import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { FiPlus, FiTrash2, FiChevronDown, FiLayers, FiEdit2, FiCheck, FiX, FiImage } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { getVariantImageUrl, getImageUrl } from '~/utils/formatters'

export const VariantsSection = ({
  attributes,
  fields,
  remove,
  editingIndex,
  isAddingVariant,
  onAddVariant,
  onEditVariant,
  onUpdateVariant,
  onDeleteVariant,
  onCancelEdit
}) => {
  const { control, formState: { errors }, setValue, watch } = useFormContext()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingVariantIndex, setDeletingVariantIndex] = useState(null)
  const [deletingVariantInfo, setDeletingVariantInfo] = useState(null)

  const handleVariantImageSelect = (index, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setValue(`variants.${index}.imagePreview`, event.target.result)
        setValue(`variants.${index}.imageFile`, file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveVariantImage = (index) => {
    setValue(`variants.${index}.imagePreview`, null)
    setValue(`variants.${index}.imageFile`, null)
    setValue(`variants.${index}.image`, null)
  }

  const handleOpenDeleteModal = (index) => {
    const variant = fields[index]
    setDeletingVariantIndex(index)
    setDeletingVariantInfo({
      name: `Biến thể ${variant.size || ''} ${variant.color || ''}`,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      images: variant.image
    })
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deletingVariantIndex !== null) {
      onDeleteVariant(deletingVariantIndex)
      setDeleteModalOpen(false)
      setDeletingVariantIndex(null)
      setDeletingVariantInfo(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setDeletingVariantIndex(null)
    setDeletingVariantInfo(null)
  }

  const getVariantDisplayImage = (variant) => {
    if (!variant) return null

    // Ưu tiên imagePreview (khi đang upload file mới)
    if (variant.imagePreview) {
      return variant.imagePreview
    }

    // Nếu có image từ API (đã lưu)
    if (variant.image) {
      const url = getVariantImageUrl(variant)
      if (url) return url
    }

    return null
  }

  // Component hiển thị thông tin biến thể (chế độ xem)
  const VariantDisplay = ({ variant, index }) => {
    const hasId = Boolean(variant.id)
    const imageUrl = getVariantDisplayImage(variant)

    return (
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        {/* Ảnh variant */}
        <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
          {imageUrl ? (
            <img src={imageUrl} alt={variant.color || 'Variant'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <FiImage size={20} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Size */}
        <div className="w-full md:w-1/4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Size:</span>
            <span className="text-sm font-bold text-gray-800">{variant.size || '—'}</span>
          </div>
        </div>

        {/* Color */}
        <div className="w-full md:w-1/4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Màu:</span>
            <span className="text-sm font-bold text-gray-800">{variant.color || '—'}</span>
          </div>
        </div>

        {/* Stock */}
        <div className="w-full md:w-1/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tồn kho:</span>
            <span className={`text-sm font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {variant.stock || 0}
            </span>
          </div>
        </div>

        {/* Hành động */}
        <div className="w-full md:w-auto flex items-end gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => onEditVariant(index)}
                className="p-2.5 bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
              >
                <FiEdit2 size={14} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Sửa biến thể</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => handleOpenDeleteModal(index)}
                className="p-2.5 bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
              >
                <FiTrash2 size={14} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Xóa biến thể</TooltipContent>
          </Tooltip>
        </div>
      </div>
    )
  }

  // Component hiển thị form sửa biến thể (chế độ edit) - KHÔNG có nút Lưu
  const VariantEdit = ({ index }) => {
    const variant = watch(`variants.${index}`)
    const imageUrl = getVariantDisplayImage(variant)

    return (
      <div className="flex flex-wrap md:flex-nowrap items-start gap-4 p-5 bg-brand-primary/5 rounded-xl border border-brand-primary/30">
        {/* Ảnh variant - Upload */}
        <div className="w-full md:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ảnh cho màu này</label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleVariantImageSelect(index, e)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-primary flex flex-col items-center justify-center bg-white overflow-hidden transition-all duration-300">
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={imageUrl}
                    alt="Variant"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveVariantImage(index)
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <FiImage size={24} className="text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-400 text-center px-1">Chọn ảnh<br/>cho màu này</span>
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-400">* Ảnh sẽ hiển thị khi khách chọn màu này</p>
        </div>

        {/* Size */}
        <div className="w-full md:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kích cỡ (Size) <span className="text-red-500">*</span></label>
          <Controller
            name={`variants.${index}.size`}
            control={control}
            rules={{ required: 'Vui lòng chọn Size' }}
            render={({ field }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex w-full items-center justify-between px-4 py-2.5 bg-white border border-gray-300 hover:border-brand-primary rounded-xl text-sm font-semibold text-gray-800 outline-none cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-brand-primary/20">
                    <span>{field.value || 'Chọn Size'}</span>
                    <FiChevronDown size={16} className="text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-48 overflow-y-auto min-w-[120px] rounded-xl z-50">
                  {attributes?.sizes?.map(size => (
                    <DropdownMenuItem key={size} onClick={() => field.onChange(size)} className="font-semibold cursor-pointer py-2">{size}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          {errors.variants?.[index]?.size && (
            <p className="text-[11px] text-red-500 font-bold">{errors.variants[index].size.message}</p>
          )}
        </div>

        {/* Color */}
        <div className="w-full md:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Màu sắc (Tùy chọn)</label>
          <Controller
            name={`variants.${index}.color`}
            control={control}
            render={({ field }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex w-full items-center justify-between px-4 py-2.5 bg-white border border-gray-300 hover:border-brand-primary rounded-xl text-sm font-semibold text-gray-800 outline-none cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-brand-primary/20">
                    <span>{field.value || 'Chọn màu'}</span>
                    <FiChevronDown size={16} className="text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-48 overflow-y-auto min-w-[150px] rounded-xl z-50">
                  <DropdownMenuItem onClick={() => field.onChange('')} className="font-semibold cursor-pointer text-gray-400 py-2">Bỏ chọn màu</DropdownMenuItem>
                  {attributes?.colors?.map(color => (
                    <DropdownMenuItem key={color.name} onClick={() => field.onChange(color.name)} className="font-semibold cursor-pointer flex items-center gap-2 py-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }}></span> {color.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </div>

        {/* Stock */}
        <div className="w-full md:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tồn kho <span className="text-red-500">*</span></label>
          <Controller
            name={`variants.${index}.stock`}
            control={control}
            rules={{
              required: 'Vui lòng nhập tồn kho',
              min: { value: 0, message: 'Tồn kho không được nhỏ hơn 0' }
            }}
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                className="bg-white border-gray-300 hover:border-brand-primary focus:border-brand-primary py-2.5 rounded-xl font-bold transition-all duration-300 focus-visible:ring-brand-primary/20"
                placeholder="0"
              />
            )}
          />
          {errors.variants?.[index]?.stock && (
            <p className="text-[10px] text-red-500 font-bold">{errors.variants[index].stock.message}</p>
          )}
        </div>

        <div className="w-full md:w-auto flex items-end gap-1.5 pb-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onCancelEdit}
                className="p-2.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <FiX size={16} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Hủy chỉnh sửa</TooltipContent>
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, type: 'spring', bounce: 0.2 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-5">
          <div>
            <h3 className="text-xl font-extrabold text-brand-secondary tracking-tight flex items-center gap-2">
              <FiLayers className="text-brand-primary" /> Phân loại biến thể
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              {fields.length > 0
                ? `Đang có ${fields.length} biến thể`
                : 'Chưa có biến thể nào'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onAddVariant}
            disabled={editingIndex !== null}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary hover:text-white rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} /> Thêm phân loại
          </motion.button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {fields.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400"
              >
                <FiLayers size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-bold">Chưa có phân loại nào được thêm.</p>
                <p className="text-xs text-gray-400 mt-1">Nhấn Thêm phân loại để bắt đầu</p>
              </motion.div>
            ) : (
              fields.map((item, index) => {
                const isEditing = editingIndex === index

                return (
                  <motion.div
                    id={`variant-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    key={item.id}
                  >
                    {isEditing ? (
                      <VariantEdit index={index} />
                    ) : (
                      <VariantDisplay variant={item} index={index} />
                    )}
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa biến thể"
        message="Bạn có chắc chắn muốn xóa biến thể này khỏi danh sách? Hành động này không thể hoàn tác."
        productInfo={deletingVariantInfo}
      />
    </>
  )
}