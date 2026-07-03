import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDollarSign, FiUser, FiCreditCard, FiSend, FiAlertCircle, FiX, FiChevronDown } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { formatPrice } from '~/utils/formatters'

// Hàm loại bỏ dấu tiếng Việt
const removeAccent = (str) => {
  if (!str) return str
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z\s]/g, '')
    .toUpperCase()
}

export const PayoutModal = ({ isOpen, onClose, currentBalance, onSubmit, isLoading }) => {
  const [selectedBank, setSelectedBank] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors
  } = useForm({
    defaultValues: {
      amount: '',
      bankName: '',
      accountNumber: '',
      accountName: ''
    }
  })

  const watchAccountNumber = watch('accountNumber')
  const watchAccountName = watch('accountName')

  // Auto uppercase and remove accent for account name
  useEffect(() => {
    if (watchAccountName) {
      const cleaned = removeAccent(watchAccountName)
      if (cleaned !== watchAccountName) {
        setValue('accountName', cleaned, { shouldValidate: true })
      }
    }
  }, [watchAccountName, setValue])

  // Auto remove non-digits from account number
  useEffect(() => {
    if (watchAccountNumber && watchAccountNumber.match(/\D/)) {
      setValue('accountNumber', watchAccountNumber.replace(/\D/g, ''), { shouldValidate: true })
    }
  }, [watchAccountNumber, setValue])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectedBank('')
    }
  }, [isOpen, reset])

  const bankSuggestions = [
    'Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'MB Bank',
    'ACB', 'VPBank', 'Sacombank', 'SHB', 'TPBank', 'HDBank',
    'Agribank', 'SeABank', 'NamABank', 'OCB', 'MSB', 'KienLongBank'
  ]

  const handleBankSelect = (bank) => {
    setSelectedBank(bank)
    setValue('bankName', bank, { shouldValidate: true })
    clearErrors('bankName')
  }

  const onSubmitForm = (data) => {
    onSubmit({
      amount: Number(data.amount),
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName
    })
    reset()
    setSelectedBank('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-brand-primary/5 to-transparent sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <FiDollarSign className="text-brand-primary" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-brand-secondary tracking-tight">
                    Yêu cầu rút tiền
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    Số dư khả dụng: {formatPrice(currentBalance)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmitForm)} className="p-5 space-y-5">
              {/* Số tiền */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiDollarSign size={14} className="text-brand-primary" />
                  Số tiền cần rút <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Nhập số tiền (VNĐ)"
                    className={`rounded-xl border-gray-200 py-3 text-sm font-semibold focus-visible:ring-brand-primary/20 ${errors.amount ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('amount', {
                      required: 'Vui lòng nhập số tiền cần rút',
                      min: { value: 50000, message: 'Số tiền tối thiểu là 50.000 VNĐ' },
                      validate: (value) => {
                        if (value && Number(value) > currentBalance) {
                          return `Số tiền vượt quá số dư khả dụng (${formatPrice(currentBalance)})`
                        }
                        return true
                      }
                    })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">VNĐ</span>
                </div>
                {errors.amount && <p className="text-[11px] text-red-500 font-bold">{errors.amount.message}</p>}
                <p className="text-[10px] text-gray-400">* Tối thiểu 50.000 VNĐ</p>
              </div>

              {/* Tên ngân hàng - DropdownMenu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCreditCard size={14} className="text-brand-primary" />
                  Ngân hàng thụ hưởng <span className="text-red-500">*</span>
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-brand-primary/20 ${
                        errors.bankName ? 'border-red-500' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <span className={selectedBank ? 'text-gray-800' : 'text-gray-400'}>
                        {selectedBank || 'Chọn ngân hàng'}
                      </span>
                      <FiChevronDown size={16} className="text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto rounded-xl shadow-xl border-gray-100 z-50">
                    {bankSuggestions.map((bank) => (
                      <DropdownMenuItem
                        key={bank}
                        onClick={() => handleBankSelect(bank)}
                        className="text-sm font-semibold cursor-pointer py-2.5 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors duration-200"
                      >
                        {bank}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <input type="hidden" {...register('bankName', {
                  required: 'Vui lòng chọn ngân hàng',
                  minLength: { value: 2, message: 'Tên ngân hàng phải có ít nhất 2 ký tự' }
                })} />
                {errors.bankName && <p className="text-[11px] text-red-500 font-bold">{errors.bankName.message}</p>}
              </div>

              {/* Số tài khoản */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCreditCard size={14} className="text-brand-primary" />
                  Số tài khoản <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nhập số tài khoản"
                  className={`rounded-xl border-gray-200 py-3 text-sm font-semibold focus-visible:ring-brand-primary/20 ${errors.accountNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('accountNumber', {
                    required: 'Vui lòng nhập số tài khoản',
                    minLength: { value: 5, message: 'Số tài khoản phải có ít nhất 5 chữ số' },
                    maxLength: { value: 30, message: 'Số tài khoản không quá 30 chữ số' },
                    pattern: { value: /^[0-9]+$/, message: 'Số tài khoản chỉ được chứa chữ số' }
                  })}
                />
                {errors.accountNumber && <p className="text-[11px] text-red-500 font-bold">{errors.accountNumber.message}</p>}
              </div>

              {/* Tên chủ tài khoản */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <FiUser size={14} className="text-brand-primary" />
                  Tên chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nhập tên chủ tài khoản (viết hoa không dấu)"
                  className={`rounded-xl border-gray-200 py-3 text-sm font-semibold focus-visible:ring-brand-primary/20 uppercase ${errors.accountName ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('accountName', {
                    required: 'Vui lòng nhập tên chủ tài khoản',
                    minLength: { value: 3, message: 'Tên chủ tài khoản phải có ít nhất 3 ký tự' },
                    maxLength: { value: 150, message: 'Tên chủ tài khoản không quá 150 ký tự' },
                    pattern: {
                      value: /^[A-Z\s]+$/,
                      message: 'Tên chủ tài khoản chỉ được chứa chữ cái (không dấu) và khoảng trắng'
                    }
                  })}
                />
                {errors.accountName && <p className="text-[11px] text-red-500 font-bold">{errors.accountName.message}</p>}
                <p className="text-[10px] text-gray-400">* Chỉ chấp nhận chữ cái không dấu, tự động viết hoa</p>
              </div>

              {/* Lưu ý */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-amber-700">
                  <p className="font-bold">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Số tiền rút sẽ bị tạm khóa ngay lập tức và chờ Admin duyệt</li>
                    <li>Thời gian xử lý từ 1-3 ngày làm việc</li>
                    <li>Đảm bảo thông tin ngân hàng chính xác để tránh sai sót</li>
                  </ul>
                </div>
              </div>

              {/* Nút submit */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || currentBalance < 50000}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white py-2 rounded-xl font-black text-sm transition-all duration-100 shadow-md shadow-brand-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                  ) : (
                    <FiSend size={14} />
                  )}
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}