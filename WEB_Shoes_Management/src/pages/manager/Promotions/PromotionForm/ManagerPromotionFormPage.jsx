import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiSave, FiArrowLeft, FiTag, FiPercent, FiDollarSign, FiCalendar, FiInfo, FiCheck } from 'react-icons/fi'

import { managerPromotionApiService } from '~/services/manager/managerPromotionApiService'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerPromotionFormPage = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  usePageTitle(
    isEditMode ? 'Chỉnh sửa mã hệ thống' : 'Thêm mã giảm giá hệ thống',
    isEditMode ? 'Cập nhật mã giảm giá hệ thống' : 'Tạo mã giảm giá toàn sàn mới'
  )

  const getTodayDate = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: { name: '', description: '', discount_value: '', min_order_value: '', max_discount_amount: '', start_date: getTodayDate(), end_date: '', is_active: 1 }
  })

  const watchStartDate = watch('start_date')
  const watchEndDate = watch('end_date')

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      managerPromotionApiService.getPromotionDetail(id)
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
          toast.error('Không tải được thông tin mã giảm giá')
          navigate('/manager/promotions')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEditMode, reset, navigate])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const startDate = new Date(data.start_date); startDate.setHours(0, 0, 0, 0)
      if (startDate < today) { toast.error('Ngày bắt đầu không được nhỏ hơn ngày hiện tại'); setLoading(false); return }

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
        await managerPromotionApiService.updatePromotion(id, payload)
        toast.success('Cập nhật mã giảm giá hệ thống thành công!')
      } else {
        await managerPromotionApiService.createPromotion(payload)
        toast.success('Tạo mã giảm giá hệ thống thành công!')
      }
      navigate('/manager/promotions')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/manager/promotions')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-colors duration-300 shadow-sm cursor-pointer">
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
              <FiTag /> {isEditMode ? 'Chỉnh sửa mã hệ thống' : 'Thêm mã giảm giá hệ thống'}
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Mã này sẽ áp dụng toàn sàn cho tất cả người mua</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100">
          <FiCheck size={16} /><span className="text-xs font-bold">{isEditMode ? 'Đang cập nhật' : 'Tạo mã mới'}</span>
        </div>
      </motion.div>

      {loading && isEditMode ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                <FiInfo className="text-blue-600" /> Thông tin mã giảm giá hệ thống
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Cấu hình mã giảm giá toàn sàn do Manager quản lý</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mã giảm giá */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiTag size={14} className="text-blue-600" /> Mã giảm giá <span className="text-red-500">*</span>
                </label>
                <input {...register('name', {
                  required: 'Vui lòng nhập mã giảm giá',
                  minLength: { value: 2, message: 'Mã phải có ít nhất 2 ký tự' },
                  maxLength: { value: 50, message: 'Mã không quá 50 ký tự' },
                  pattern: { value: /^[A-Za-z0-9]+$/, message: 'Chỉ chấp nhận chữ và số, không dấu cách' }
                })}
                  placeholder="VD: PLATFORM2026"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all uppercase" />
                {errors.name && <p className="text-[11px] text-red-500 font-bold">{errors.name.message}</p>}
                <p className="text-[10px] text-gray-400">* Mã sẽ tự động viết hoa và loại bỏ khoảng trắng</p>
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mô tả (không bắt buộc)</label>
                <input {...register('description')} placeholder="VD: Mã giảm giá chào mừng ngày thành lập sàn"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" />
              </div>

              {/* Giảm giá (%) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiPercent size={14} className="text-blue-600" /> Phần trăm giảm (%) <span className="text-red-500">*</span>
                </label>
                <input type="number" {...register('discount_value', {
                  required: 'Vui lòng nhập % giảm giá',
                  min: { value: 1, message: 'Giảm giá tối thiểu 1%' },
                  max: { value: 100, message: 'Giảm giá tối đa 100%' }
                })} placeholder="VD: 15"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                {errors.discount_value && <p className="text-[11px] text-red-500 font-bold">{errors.discount_value.message}</p>}
              </div>

              {/* Đơn hàng tối thiểu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiDollarSign size={14} className="text-blue-600" /> Đơn hàng tối thiểu (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input type="number" {...register('min_order_value', {
                  required: 'Vui lòng nhập giá trị đơn tối thiểu',
                  min: { value: 0, message: 'Giá trị không được âm' }
                })} placeholder="VD: 200000"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                {errors.min_order_value && <p className="text-[11px] text-red-500 font-bold">{errors.min_order_value.message}</p>}
              </div>

              {/* Giảm tối đa */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiDollarSign size={14} className="text-blue-600" /> Giảm tối đa (VNĐ)
                </label>
                <input type="number" {...register('max_discount_amount', { min: { value: 0, message: 'Giá trị không được âm' } })}
                  placeholder="Để trống nếu không giới hạn"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                <p className="text-[10px] text-gray-400">* Để trống nếu không muốn giới hạn số tiền giảm tối đa</p>
              </div>

              {/* Trạng thái (chỉ hiện khi edit) */}
              {isEditMode && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Trạng thái</label>
                  <select {...register('is_active')}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all">
                    <option value={1}>Đang kích hoạt</option>
                    <option value={0}>Tạm dừng</option>
                  </select>
                </div>
              )}

              {/* Ngày bắt đầu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar size={14} className="text-blue-600" /> Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input type="date" {...register('start_date', {
                  required: 'Vui lòng chọn ngày bắt đầu',
                  validate: (value) => {
                    const today = new Date(); today.setHours(0, 0, 0, 0)
                    const startDate = new Date(value); startDate.setHours(0, 0, 0, 0)
                    if (startDate < today) return 'Ngày bắt đầu phải là hôm nay hoặc trong tương lai'
                    return true
                  }
                })} min={getTodayDate()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                {errors.start_date && <p className="text-[11px] text-red-500 font-bold">{errors.start_date.message}</p>}
              </div>

              {/* Ngày kết thúc */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar size={14} className="text-blue-600" /> Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input type="date" {...register('end_date', {
                  required: 'Vui lòng chọn ngày kết thúc',
                  validate: (value) => {
                    if (watchStartDate && value <= watchStartDate) return 'Ngày kết thúc phải sau ngày bắt đầu'
                    return true
                  }
                })} min={watchStartDate || getTodayDate()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                {errors.end_date && <p className="text-[11px] text-red-500 font-bold">{errors.end_date.message}</p>}
              </div>
            </div>

            {watchStartDate && watchEndDate && new Date(watchStartDate) >= new Date(watchEndDate) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-semibold">
                ⚠️ Ngày kết thúc phải lớn hơn ngày bắt đầu
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-end pt-4">
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.95 }}
              type="submit" disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span> : <FiSave size={18} />}
              {isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO MÃ HỆ THỐNG'}
            </motion.button>
          </motion.div>
        </form>
      )}
    </div>
  )
}
