import { FiHome, FiMessageSquare } from 'react-icons/fi'
import { Controller } from 'react-hook-form'
import { StarRating } from './StarRating'
import { Textarea } from '~/components/ui/textarea'

export const StoreReviewSection = ({ store, control, register, errors }) => {
  if (!store) return null

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fadeIn mb-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shrink-0">
          <FiHome size={20} />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-800 text-lg">Đánh giá cửa hàng</h3>
          <p className="text-xs text-gray-500">Giúp {store.name} cải thiện dịch vụ tốt hơn.</p>
        </div>
      </div>

      <div className="space-y-6">
        <Controller
          name="storeRating"
          control={control}
          rules={{ required: 'Vui lòng chọn số sao đánh giá cửa hàng.', min: 1 }}
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
              <StarRating value={value} onChange={onChange} label="Mức độ hài lòng về Dịch vụ" />

              {value > 0 && (
                <p className="text-sm font-extrabold text-brand-primary tracking-wide animate-fadeIn mt-1">
                  {value === 1 && 'Rất tệ'}
                  {value === 2 && 'Không hài lòng'}
                  {value === 3 && 'Bình thường'}
                  {value === 4 && 'Rất tốt'}
                  {value === 5 && 'Tuyệt vời'}
                </p>
              )}

              {errors.storeRating && <p className="text-xs text-red-500 mt-1 font-medium">{errors.storeRating.message}</p>}
            </div>
          )}
        />

        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <FiMessageSquare className="text-gray-800" /> Nhận xét của bạn
          </label>

          <Textarea
            rows={3}
            placeholder="Chủ shop có nhiệt tình không? Đóng gói hàng có cẩn thận không?"
            {...register('storeComment', {
              required: 'Nội dung nhận xét cửa hàng không được để trống.',
              minLength: { value: 5, message: 'Nội dung nhận xét cửa hàng phải dài từ 5 ký tự trở lên.' },
              maxLength: { value: 1000, message: 'Nội dung nhận xét không được vượt quá 1000 ký tự.' }
            })}
            className={`w-full bg-gray-50 border-gray-200 rounded-2xl px-4 py-3 text-sm focus-visible:bg-white focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/10 outline-none transition-all resize-none min-h-[100px] ${errors.storeComment ? 'border-red-500 focus-visible:ring-red-500/10' : ''}`}
          />
          {errors.storeComment && <p className="text-xs text-red-500 font-medium">{errors.storeComment.message}</p>}
        </div>
      </div>
    </div>
  )
}