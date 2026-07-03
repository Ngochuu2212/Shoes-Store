import { useEffect, useState } from 'react'
import { vendorAnalyticsService } from '~/services/vendor/vendorAnalyticsService'
import { ANALYTICS_TYPES } from '~/utils/constant'
import { toast } from 'react-toastify'
import { FiCalendar, FiFilter, FiChevronDown, FiCheck, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

import { DashboardWidgets } from './DashboardWidgets'
import { RevenueChart } from './RevenueChart'
import { CategoryPieChart } from './CategoryPieChart'
import { TopProductsList } from './TopProductsList'
import { QuickActions } from './QuickActions'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { usePageTitle } from '~/hooks/usePageTitle'

const filterOptions = [
  { value: ANALYTICS_TYPES.TODAY, label: 'Hôm nay' },
  { value: ANALYTICS_TYPES.SEVEN_DAYS, label: '7 ngày qua' },
  { value: ANALYTICS_TYPES.ONE_MONTH, label: '30 ngày qua' },
  { value: ANALYTICS_TYPES.CUSTOM, label: 'Tùy chọn ngày' }
]

export const VendorDashboardPage = () => {
  usePageTitle(
    'Tổng quan kinh doanh',
    'Xem thống kê doanh thu, đơn hàng và sản phẩm bán chạy của cửa hàng'
  )
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState(ANALYTICS_TYPES.ONE_MONTH)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  // Helper: Lấy ngày hôm nay dạng YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const validateDates = () => {
    const newErrors = { startDate: '', endDate: '' }
    let isValid = true

    if (!startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu'
      isValid = false
    }

    if (!endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc'
      isValid = false
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start > end) {
        newErrors.startDate = 'Ngày bắt đầu không thể lớn hơn ngày kết thúc'
        newErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
        isValid = false
      }

      if (end > today) {
        newErrors.endDate = 'Ngày kết thúc không thể lớn hơn hôm nay'
        isValid = false
      }

      if (start > today) {
        newErrors.startDate = 'Ngày bắt đầu không thể lớn hơn hôm nay'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const res = await vendorAnalyticsService.getRevenueAnalytics(filterType, startDate, endDate)
      setData(res)
      setErrors({ startDate: '', endDate: '' }) // Clear errors on success
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải dữ liệu thống kê.')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý khi người dùng thay đổi date
  const handleDateChange = (type, value) => {
    // Reset error cho field đó
    setErrors(prev => ({ ...prev, [type]: '' }))

    if (type === 'startDate') {
      setStartDate(value)
      // Nếu endDate đã có và startDate > endDate, set error cho endDate
      if (endDate && value && new Date(value) > new Date(endDate)) {
        setErrors(prev => ({
          ...prev,
          startDate: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc',
          endDate: 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
        }))
      }
    } else {
      setEndDate(value)
      // Kiểm tra ngày kết thúc không được lớn hơn hôm nay
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (value && new Date(value) > today) {
        setErrors(prev => ({
          ...prev,
          endDate: 'Ngày kết thúc không thể lớn hơn hôm nay'
        }))
      }
      // Kiểm tra startDate > endDate
      if (startDate && value && new Date(startDate) > new Date(value)) {
        setErrors(prev => ({
          ...prev,
          startDate: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc',
          endDate: 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
        }))
      }
    }
  }

  useEffect(() => {
    if (filterType !== ANALYTICS_TYPES.CUSTOM) {
      setErrors({ startDate: '', endDate: '' })
      fetchAnalyticsData()
    } else if (startDate && endDate) {
      const isValid = validateDates()
      if (isValid) {
        fetchAnalyticsData()
      }
    }
  }, [filterType, startDate, endDate])

  const formatFilterDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const activeLabel = filterOptions.find((o) => o.value === filterType)?.label

  // Lấy max date cho input (hôm nay)
  const maxDate = getTodayString()

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl px-8 py-6 shadow-sm">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 left-20 w-28 h-28 bg-rose-100/40 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <FiTrendingUp className="text-brand-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Khái quát kinh doanh</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Doanh thu · Đơn hàng · Sản phẩm bán ra</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-all duration-200 cursor-pointer min-w-[160px] justify-between outline-none">
                  <div className="flex items-center gap-2">
                    <FiFilter size={14} className="text-gray-400" />
                    <span>{activeLabel}</span>
                  </div>
                  <FiChevronDown size={13} className="text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl shadow-xl border-gray-100">
                <DropdownMenuLabel className="text-xs text-gray-400 font-semibold">Khoảng thời gian</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`text-sm font-semibold cursor-pointer rounded-lg flex items-center gap-2 ${
                      filterType === option.value
                        ? 'text-brand-primary bg-brand-primary/5'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className={`w-4 ${filterType === option.value ? 'opacity-100' : 'opacity-0'}`}>
                      <FiCheck size={13} />
                    </span>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date range inputs */}
            <AnimatePresence>
              {filterType === ANALYTICS_TYPES.CUSTOM && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -8 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                >
                  <div className="flex flex-col gap-1" style={{ maxWidth: '180px' }}>
                    <Input
                      type="date"
                      value={startDate}
                      max={maxDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className={`rounded-xl border-gray-200 text-gray-700 text-xs font-semibold py-5 cursor-pointer focus-visible:ring-brand-primary/20 w-full ${
                        errors.startDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                      }`}
                    />
                    {errors.startDate && (
                      <div className="flex items-start gap-1 text-xs text-red-500 break-words whitespace-normal max-w-full">
                        <FiAlertCircle size={12} className="shrink-0 mt-0.5" />
                        <span className="leading-tight">{errors.startDate}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-gray-300 font-bold hidden sm:block">→</span>

                  <div className="flex flex-col gap-1" style={{ maxWidth: '180px' }}>
                    <Input
                      type="date"
                      value={endDate}
                      max={maxDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className={`rounded-xl border-gray-200 text-gray-700 text-xs font-semibold py-5 cursor-pointer focus-visible:ring-brand-primary/20 w-full ${
                        errors.endDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                      }`}
                    />
                    {errors.endDate && (
                      <div className="flex items-start gap-1 text-xs text-red-500 break-words whitespace-normal max-w-full">
                        <FiAlertCircle size={12} className="shrink-0 mt-0.5" />
                        <span className="leading-tight">{errors.endDate}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Time range badge */}
            {data && (
              <div className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 px-3.5 py-2.5 rounded-xl text-xs font-bold text-brand-primary">
                <FiCalendar size={13} />
                <span>{formatFilterDate(data.timeRange.startDate)} – {formatFilterDate(data.timeRange.endDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION - Thêm mới */}
      <QuickActions />

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
          >
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-semibold animate-pulse">Đang tải dữ liệu...</p>
          </motion.div>
        ) : (
          data && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              <DashboardWidgets widgets={data.widgets} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart data={data.chartData} />
                </div>
                <div>
                  <CategoryPieChart data={data.revenueByCategory} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProductsList products={data.topSellingProducts} />
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}