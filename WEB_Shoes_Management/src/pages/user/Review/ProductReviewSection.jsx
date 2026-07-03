import { FiBox, FiCamera, FiX, FiCheckCircle, FiMessageSquare, FiImage } from 'react-icons/fi'
import { Controller } from 'react-hook-form'
import { StarRating } from './StarRating'
import { getImageUrl, getVariantImageUrl } from '~/utils/formatters'
import { Textarea } from '~/components/ui/textarea'
import { toast } from 'react-toastify'

export const ProductReviewSection = ({ items, control, register, errors, watch, setValue }) => {
  const images = watch('productImages') || []

  const getItemImage = (item) => {
    // Ưu tiên ảnh từ variant_image
    if (item.variant_image) {
      // Nếu variant_image là object có secure_url
      if (item.variant_image.secure_url) {
        return item.variant_image.secure_url
      }
      // Nếu variant_image là string JSON
      if (typeof item.variant_image === 'string') {
        try {
          const parsed = JSON.parse(item.variant_image)
          if (parsed && parsed.secure_url) {
            return parsed.secure_url
          }
        } catch (e) {
          // Bỏ qua
        }
      }
    }
    // Fallback sang product_images (nếu có)
    if (item.product_images) {
      return getImageUrl(item.product_images, 'https://placehold.co/100x100?text=Product')
    }
    // Fallback sang images (cũ)
    if (item.images) {
      return getImageUrl(item.images, 'https://placehold.co/100x100?text=Product')
    }
    return 'https://placehold.co/100x100?text=Product'
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    // Validate định dạng dựa trên Backend config
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const validFiles = files.filter(f => validFormats.includes(f.type))

    if (validFiles.length !== files.length) {
      toast.warning('Chỉ chấp nhận định dạng ảnh JPG, JPEG, PNG, WEBP.')
    }

    if (images.length + validFiles.length > 10) {
      toast.error('Bạn chỉ được tải lên tối đa 10 ảnh.')
      return
    }

    setValue('productImages', [...images, ...validFiles], { shouldValidate: true })
    e.target.value = '' // Reset input file
  }

  const removeImage = (indexToRemove) => {
    setValue('productImages', images.filter((_, idx) => idx !== indexToRemove), { shouldValidate: true })
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fadeIn mb-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0">
          <FiBox size={20} />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-800 text-lg">Đánh giá Sản phẩm</h3>
          <p className="text-xs text-gray-500">Đánh giá của bạn sẽ áp dụng chung cho các sản phẩm bên dưới.</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
        {items?.map((item, idx) => {
          const imageUrl = getItemImage(item)
          return (
            <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-50 shadow-sm">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={item.product_name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
                />
                {item.variant_image && (
                  <div className="absolute top-0 right-0 bg-brand-primary text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-lg">
                    VAR
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-800 line-clamp-1">{item.product_name}</p>
                <p className="text-[10px] text-gray-500">Phân loại: {item.color} | Size: {item.size}</p>
              </div>
              <FiCheckCircle className="ml-auto text-green-500 mr-2 shrink-0" size={16} />
            </div>
          )
        })}
      </div>

      <div className="space-y-6">
        <Controller
          name="productRating"
          control={control}
          rules={{ required: 'Vui lòng chọn số sao đánh giá sản phẩm.', min: 1 }}
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
              <StarRating value={value} onChange={onChange} label="Chất lượng sản phẩm" />

              {value > 0 && (
                <p className="text-sm font-extrabold text-brand-primary tracking-wide animate-fadeIn mt-1">
                  {value === 1 && 'Rất tệ'}
                  {value === 2 && 'Không hài lòng'}
                  {value === 3 && 'Bình thường'}
                  {value === 4 && 'Rất tốt'}
                  {value === 5 && 'Tuyệt vời'}
                </p>
              )}

              {errors.productRating && <p className="text-xs text-red-500 mt-1 font-medium">{errors.productRating.message}</p>}
            </div>
          )}
        />

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <FiMessageSquare className="text-gray-800" />
            Nhận xét của bạn
          </label>

          <Textarea
            rows={4}
            placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng, chất liệu, màu sắc của giày nhé..."
            {...register('productComment', {
              required: 'Nội dung nhận xét sản phẩm không được để trống.',
              minLength: { value: 5, message: 'Nội dung nhận xét phải có ít nhất 5 ký tự.' },
              maxLength: { value: 1000, message: 'Nội dung nhận xét không được vượt quá 1000 ký tự.' }
            })}
            className={`w-full bg-gray-50 border-gray-200 rounded-2xl px-4 py-3 text-sm focus-visible:bg-white focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/10 outline-none transition-all resize-none mb-2 min-h-[120px] ${errors.productComment ? 'border-red-500 focus-visible:ring-red-500/10' : ''}`}
          />
          {errors.productComment && <p className="text-xs text-red-500 font-medium mb-4">{errors.productComment.message}</p>}

          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mt-5 mb-3">
            <FiImage className="text-gray-800" />
            Hình ảnh sản phẩm
          </label>

          <div className="flex gap-3 flex-wrap">
            {images.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/80"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}

            {images.length < 10 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer">
                <FiCamera size={20} className="mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">Thêm ảnh<br/>({images.length}/10)</span>
                <input type="file" multiple accept="image/jpeg, image/jpg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2.5">Có thể tải lên tối đa 10 hình ảnh (JPG, JPEG, PNG, WEBP).</p>
        </div>
      </div>
    </div>
  )
}