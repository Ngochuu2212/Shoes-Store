import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiSave, FiArrowLeft, FiTag, FiPercent, FiDollarSign, FiCalendar, FiInfo, FiCheck } from 'react-icons/fi'

import { vendorPromotionApiService } from '~/services/vendor/vendorPromotionApiService'
import { usePageTitle } from '~/hooks/usePageTitle'

export const PromotionFormPage = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  usePageTitle(
    isEditMode ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới',
    isEditMode ? 'Cập nhật chương trình khuyến mãi' : 'Tạo chương trình khuyến mãi mới'
  )

  // Lấy ngày hôm nay theo định dạng YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      discount_value: '',
      min_order_value: '',
      max_discount_amount: '',
      start_date: getTodayDate(), // Set mặc định là ngày hôm nay
      end_date: '',
      is_active: 1
    }
  })

  const watchStartDate = watch('start_date')
  const watchEndDate = watch('end_date')

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      vendorPromotionApiService.getPromotionDetail(id)
        .then(data => {
          reset({
            name: data.name,
            description: data.description || '',
            discount_value: data.discount_value,
            min_order_value: data.min_order_value,
            max_discount_amount: data.max_discount_amount || '',
            start_date: data.start_date?.split('T')[0] || getTodayDate(),
            end_date: data.end_date?.split('T')[0] || '',
            is_active: data.is_active
          })
        })
        .catch(() => {
          toast.error('Không tải được thông tin khuyến mãi')
          navigate('/vendor/promotions')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEditMode, reset, navigate])

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      // Kiểm tra ngày bắt đầu không được trong quá khứ
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = new Date(data.start_date)
      startDate.setHours(0, 0, 0, 0)

      if (startDate < today) {
        toast.error('Ngày bắt đầu không được nhỏ hơn ngày hiện tại')
        setLoading(false)
        return
      }

      const payload = {
        name: data.name.toUpperCase().replace(/\s+/g, ''),
        description: data.description || null,
        discount_value: Number(data.discount_value),
        min_order_value: Number(data.min_order_value),
        max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active
      }

      if (isEditMode) {
        await vendorPromotionApiService.updatePromotion(id, payload)
        toast.success('Cập nhật chương trình khuyến mãi thành công!')
      } else {
        await vendorPromotionApiService.createPromotion(payload)
        toast.success('Tạo chương trình khuyến mãi thành công!')
      }
      navigate('/vendor/promotions')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/promotions')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-black text-brand-primary tracking-tight flex items-center gap-2">
              <FiTag /> {isEditMode ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Tạo mã giảm giá cho khách hàng của bạn</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100">
          <FiCheck size={16} />
          <span className="text-xs font-bold">{isEditMode ? 'Đang cập nhật' : 'Tạo mã mới'}</span>
        </div>
      </motion.div>

      {loading && isEditMode ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Thông tin cơ bản */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
          >
            <div>
              <h3 className="text-xl font-extrabold text-brand-secondary tracking-tight flex items-center gap-2">
                <FiInfo className="text-brand-primary" /> Thông tin khuyến mãi
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Cấu hình chi tiết chương trình giảm giá</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mã giảm giá */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiTag size={14} className="text-brand-primary" /> Mã giảm giá <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', {
                    required: 'Vui lòng nhập mã giảm giá',
                    minLength: { value: 2, message: 'Mã phải có ít nhất 2 ký tự' },
                    maxLength: { value: 50, message: 'Mã không quá 50 ký tự' },
                    pattern: { value: /^[A-Za-z0-9]+$/, message: 'Chỉ chấp nhận chữ và số, không dấu cách' }
                  })}
                  placeholder="VD: SUMMER2024"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 uppercase"
                />
                {errors.name && <p className="text-[11px] text-red-500 font-bold">{errors.name.message}</p>}
                <p className="text-[10px] text-gray-400">* Mã sẽ tự động được viết hoa và loại bỏ khoảng trắng</p>
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mô tả (không bắt buộc)</label>
                <input
                  {...register('description')}
                  placeholder="VD: Giảm giá mùa hè cho giày thể thao"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
              </div>

              {/* Giảm giá (%) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiPercent size={14} className="text-brand-primary" /> Phần trăm giảm (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('discount_value', {
                    required: 'Vui lòng nhập % giảm giá',
                    min: { value: 1, message: 'Giảm giá tối thiểu 1%' },
                    max: { value: 100, message: 'Giảm giá tối đa 100%' }
                  })}
                  placeholder="VD: 20"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
                {errors.discount_value && <p className="text-[11px] text-red-500 font-bold">{errors.discount_value.message}</p>}
              </div>

              {/* Đơn hàng tối thiểu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiDollarSign size={14} className="text-brand-primary" /> Đơn hàng tối thiểu (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('min_order_value', {
                    required: 'Vui lòng nhập giá trị đơn tối thiểu',
                    min: { value: 0, message: 'Giá trị không được âm' }
                  })}
                  placeholder="VD: 500000"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
                {errors.min_order_value && <p className="text-[11px] text-red-500 font-bold">{errors.min_order_value.message}</p>}
              </div>

              {/* Giảm tối đa */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiDollarSign size={14} className="text-brand-primary" /> Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  {...register('max_discount_amount', {
                    min: { value: 0, message: 'Giá trị không được âm' }
                  })}
                  placeholder="Để trống nếu không giới hạn"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
                <p className="text-[10px] text-gray-400">* Để trống nếu không muốn giới hạn số tiền giảm tối đa</p>
              </div>

              {/* Trạng thái (chỉ hiện khi edit) */}
              {isEditMode && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Trạng thái</label>
                  <select
                    {...register('is_active')}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                  >
                    <option value={1}>Đang kích hoạt</option>
                    <option value={0}>Tạm dừng</option>
                  </select>
                </div>
              )}

              {/* Ngày bắt đầu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar size={14} className="text-brand-primary" /> Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('start_date', {
                    required: 'Vui lòng chọn ngày bắt đầu',
                    validate: (value) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const startDate = new Date(value)
                      startDate.setHours(0, 0, 0, 0)
                      if (startDate < today) {
                        return 'Ngày bắt đầu phải là hôm nay hoặc trong tương lai'
                      }
                      return true
                    }
                  })}
                  min={getTodayDate()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
                {errors.start_date && <p className="text-[11px] text-red-500 font-bold">{errors.start_date.message}</p>}
                <p className="text-[10px] text-gray-400">* Phải là hôm nay hoặc trong tương lai</p>
              </div>

              {/* Ngày kết thúc */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar size={14} className="text-brand-primary" /> Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('end_date', {
                    required: 'Vui lòng chọn ngày kết thúc',
                    validate: (value) => {
                      if (watchStartDate && value <= watchStartDate) {
                        return 'Ngày kết thúc phải sau ngày bắt đầu'
                      }
                      return true
                    }
                  })}
                  min={watchStartDate || getTodayDate()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
                {errors.end_date && <p className="text-[11px] text-red-500 font-bold">{errors.end_date.message}</p>}
              </div>
            </div>

            {/* Thông báo lỗi */}
            {watchStartDate && watchEndDate && new Date(watchStartDate) >= new Date(watchEndDate) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-semibold">
                ⚠️ Ngày kết thúc phải lớn hơn ngày bắt đầu
              </div>
            )}

            {watchStartDate && new Date(watchStartDate) < new Date(new Date().setHours(0, 0, 0, 0)) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-semibold">
                ⚠️ Ngày bắt đầu không được nhỏ hơn ngày hiện tại
              </div>
            )}
          </motion.div>

          {/* Nút Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white px-10 py-4 rounded-2xl font-black text-sm transition-all duration-100 shadow-lg shadow-brand-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span> : <FiSave size={18} />}
              {isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO KHUYẾN MÃI'}
            </motion.button>
          </motion.div>
        </form>
      )}
    </div>
  )
}