import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiSave, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiPercent, FiPhone, FiMail, FiServer, FiSettings
} from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { adminSystemSettingApiService } from '~/services/admin/adminSystemSettingApiService'

export const SystemSettingsForm = ({ settings, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      isMaintenance: false,
      maintenanceMessage: '',
      globalCommissionRate: 10,
      hotline: '',
      supportEmail: ''
    }
  })

  const isMaintenance = watch('isMaintenance')

  useEffect(() => {
    if (settings) {
      reset({
        isMaintenance: settings.is_maintenance === 1,
        maintenanceMessage: settings.maintenance_message || '',
        globalCommissionRate: Number(settings.global_commission_rate) || 10,
        hotline: settings.hotline || '',
        supportEmail: settings.support_email || ''
      })
    }
  }, [settings, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await adminSystemSettingApiService.updateSystemSettings(data)
      toast.success(res.message)
      if (onUpdate) onUpdate()
    } catch (error) {
      toast.error(error.message || 'Cập nhật cấu hình thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    if (settings) {
      reset({
        isMaintenance: settings.is_maintenance === 1,
        maintenanceMessage: settings.maintenance_message || '',
        globalCommissionRate: Number(settings.global_commission_rate) || 10,
        hotline: settings.hotline || '',
        supportEmail: settings.support_email || ''
      })
      toast.info('Đã reset về cấu hình hiện tại')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FiSettings className="text-emerald-500" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Cài đặt hệ thống</h3>
                <p className="text-xs text-gray-400 font-semibold">Cập nhật cấu hình vận hành toàn hệ thống</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
              >
                <FiRefreshCw size={16} />
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Lưu cài đặt
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chế độ bảo trì */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    {...register('isMaintenance')}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20 accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FiServer size={16} className={isMaintenance ? 'text-red-500' : 'text-green-500'} />
                    <label className="font-bold text-gray-800">Chế độ bảo trì hệ thống</label>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isMaintenance
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {isMaintenance ? 'Đang bảo trì' : 'Đang hoạt động'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {isMaintenance ? (
                      <>
                        <FiAlertCircle size={12} className="text-red-500" />
                        Hệ thống đang trong chế độ bảo trì. Chỉ Admin mới có thể truy cập.
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={12} className="text-green-500" />
                        Hệ thống đang hoạt động bình thường. Tất cả người dùng đều có thể truy cập.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông báo bảo trì */}
            {isMaintenance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:col-span-2"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                    <FiAlertCircle size={14} className="text-amber-500" />
                    Thông báo bảo trì
                  </label>
                  <textarea
                    {...register('maintenanceMessage', {
                      maxLength: {
                        value: 1000,
                        message: 'Thông báo không được vượt quá 1000 ký tự'
                      }
                    })}
                    placeholder="Nhập thông báo hiển thị khi hệ thống đang bảo trì..."
                    rows={3}
                    className={`w-full rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 p-3 font-semibold text-gray-800 transition-all duration-300 resize-none outline-none focus:border-emerald-500 border ${
                      errors.maintenanceMessage ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {errors.maintenanceMessage && (
                    <p className="text-[11px] text-red-500 font-bold pl-1">
                      {errors.maintenanceMessage.message}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 font-medium pl-1 flex items-center gap-1">
                    <FiAlertCircle size={10} />
                    Thông báo này sẽ hiển thị cho tất cả người dùng khi hệ thống đang bảo trì
                  </p>
                </div>
              </motion.div>
            )}

            {/* Phí hoa hồng mặc định */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <FiPercent size={14} className="text-purple-500" />
                Phí hoa hồng mặc định <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  {...register('globalCommissionRate', {
                    required: 'Vui lòng nhập phí hoa hồng',
                    min: {
                      value: 0,
                      message: 'Phí hoa hồng không được nhỏ hơn 0%'
                    },
                    max: {
                      value: 100,
                      message: 'Phí hoa hồng không được vượt quá 100%'
                    },
                    valueAsNumber: true
                  })}
                  min="0"
                  max="100"
                  step="0.5"
                  className={`rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 pl-4 pr-12 font-semibold text-gray-800 transition-all duration-300 ${
                    errors.globalCommissionRate ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
              </div>
              {errors.globalCommissionRate && (
                <p className="text-[11px] text-red-500 font-bold pl-1">
                  {errors.globalCommissionRate.message}
                </p>
              )}
              <p className="text-[10px] text-gray-400 font-medium pl-1">
                * Áp dụng cho tất cả cửa hàng mới tạo (0-100%)
              </p>
            </div>

            {/* Hotline */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <FiPhone size={14} className="text-blue-500" />
                Hotline hỗ trợ <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                {...register('hotline', {
                  required: 'Vui lòng nhập số hotline',
                  minLength: {
                    value: 8,
                    message: 'Hotline phải có ít nhất 8 ký tự'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Hotline không được vượt quá 20 ký tự'
                  },
                  pattern: {
                    value: /^[0-9\s\-+()]+$/,
                    message: 'Hotline chỉ được chứa số, dấu cách, dấu gạch ngang và dấu cộng'
                  }
                })}
                placeholder="1900 1000"
                className={`rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300 ${
                  errors.hotline ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.hotline && (
                <p className="text-[11px] text-red-500 font-bold pl-1">
                  {errors.hotline.message}
                </p>
              )}
            </div>

            {/* Email hỗ trợ */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <FiMail size={14} className="text-emerald-500" />
                Email hỗ trợ <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                {...register('supportEmail', {
                  required: 'Vui lòng nhập email hỗ trợ',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không đúng định dạng'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Email không được vượt quá 100 ký tự'
                  }
                })}
                placeholder="support@shoesshop.com"
                className={`rounded-xl border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus-visible:ring-emerald-500/20 py-5 font-semibold text-gray-800 transition-all duration-300 ${
                  errors.supportEmail ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.supportEmail && (
                <p className="text-[11px] text-red-500 font-bold pl-1">
                  {errors.supportEmail.message}
                </p>
              )}
            </div>
          </div>

          {/* Preview thông báo bảo trì */}
          {isMaintenance && watch('maintenanceMessage') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <FiAlertCircle size={18} className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Preview thông báo bảo trì</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">
                    {watch('maintenanceMessage')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lưu ý */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FiCheckCircle size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Lưu ý</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• Thay đổi cấu hình sẽ áp dụng ngay lập tức cho toàn hệ thống</li>
                  <li>• Phí hoa hồng mặc định áp dụng cho cửa hàng mới tạo</li>
                  <li>• Khi bật chế độ bảo trì, người dùng và vendor sẽ không thể truy cập</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  )
}