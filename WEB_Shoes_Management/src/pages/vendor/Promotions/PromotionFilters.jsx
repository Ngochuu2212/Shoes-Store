import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiFilter, FiRefreshCw, FiX, FiCalendar, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

export const PromotionFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchTxt, setSearchTxt] = useState(filters.search || '')
  const [startDate, setStartDate] = useState(filters.start_date || '')
  const [endDate, setEndDate] = useState(filters.end_date || '')
  const [tempStartDate, setTempStartDate] = useState(filters.start_date || '')
  const [tempEndDate, setTempEndDate] = useState(filters.end_date || '')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(!!(filters.start_date && filters.end_date))

  // Format ngày hiển thị
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  // Validate ngày tháng (KHÔNG giới hạn ngày tương lai)
  const validateDates = (start, end) => {
    const newErrors = { startDate: '', endDate: '' }
    let isValid = true

    // Chỉ validate khi có ít nhất 1 ngày được chọn
    if (start || end) {
      if (start && end) {
        const startDateObj = new Date(start)
        const endDateObj = new Date(end)
        startDateObj.setHours(0, 0, 0, 0)
        endDateObj.setHours(0, 0, 0, 0)

        if (startDateObj > endDateObj) {
          newErrors.startDate = 'Ngày bắt đầu không thể lớn hơn ngày kết thúc'
          newErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
          isValid = false
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Sync state khi filters thay đổi từ bên ngoài
  useEffect(() => {
    setStartDate(filters.start_date || '')
    setTempStartDate(filters.start_date || '')
    if (!filters.start_date) {
      setErrors(prev => ({ ...prev, startDate: '' }))
    }
  }, [filters.start_date])

  useEffect(() => {
    setEndDate(filters.end_date || '')
    setTempEndDate(filters.end_date || '')
    if (!filters.end_date) {
      setErrors(prev => ({ ...prev, endDate: '' }))
    }
  }, [filters.end_date])

  useEffect(() => {
    setIsDateFilterApplied(!!(filters.start_date && filters.end_date))
  }, [filters.start_date, filters.end_date])

  useEffect(() => {
    if (!filters.search) setSearchTxt('')
  }, [filters.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  // Xử lý khi thay đổi startDate (chỉ cập nhật temp)
  const handleStartDateChange = (value) => {
    setTempStartDate(value)
    setErrors(prev => ({ ...prev, startDate: '' }))
    validateDates(value, tempEndDate)
  }

  // Xử lý khi thay đổi endDate (chỉ cập nhật temp)
  const handleEndDateChange = (value) => {
    setTempEndDate(value)
    setErrors(prev => ({ ...prev, endDate: '' }))
    validateDates(tempStartDate, value)
  }

  // Áp dụng bộ lọc ngày
  const handleApplyDateFilter = () => {
    const isValid = validateDates(tempStartDate, tempEndDate)

    if (!isValid) return

    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate)
      setEndDate(tempEndDate)
      setIsDateFilterApplied(true)

      // Cập nhật cả 2 filter cùng lúc
      onFilterChange('dateRange', {
        start_date: tempStartDate,
        end_date: tempEndDate
      })
    } else {
      if (!tempStartDate) {
        setErrors(prev => ({ ...prev, startDate: 'Vui lòng chọn ngày bắt đầu' }))
      }
      if (!tempEndDate) {
        setErrors(prev => ({ ...prev, endDate: 'Vui lòng chọn ngày kết thúc' }))
      }
    }
  }

  // Xóa bộ lọc ngày
  const handleClearDateFilter = () => {
    setTempStartDate('')
    setTempEndDate('')
    setStartDate('')
    setEndDate('')
    setIsDateFilterApplied(false)
    setErrors({ startDate: '', endDate: '' })

    onFilterChange('dateRange', null)
  }

  const statusOptions = [
    { value: 1, label: 'Đang hoạt động' },
    { value: 0, label: 'Tạm dừng' }
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Mới nhất' },
    { value: 'discount_value', label: 'Giảm giá cao nhất' },
    { value: 'end_date', label: 'Sắp hết hạn' }
  ]

  const currentStatusLabel = statusOptions.find(s => s.value === filters.is_active)?.label || 'Tất cả trạng thái'
  const currentSortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label || 'Sắp xếp'

  // Badge lọc đang kích hoạt
  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })
  if (filters.is_active !== null && filters.is_active !== undefined) {
    const statusLabel = filters.is_active === 1 ? 'Đang hoạt động' : 'Tạm dừng'
    activeBadges.push({ key: 'is_active', label: `Trạng thái: ${statusLabel}` })
  }
  if (filters.start_date && filters.end_date) {
    activeBadges.push({
      key: 'dateRange',
      label: `${formatDisplayDate(filters.start_date)} → ${formatDisplayDate(filters.end_date)}`
    })
  }
  if (filters.sortBy && filters.sortBy !== 'created_at') {
    const sortObj = sortOptions.find(s => s.value === filters.sortBy)
    if (sortObj) activeBadges.push({ key: 'sortBy', label: `Sắp xếp: ${sortObj.label}` })
  }

  // Hàm xóa filter
  const handleRemoveFilter = (key) => {
    if (key === 'dateRange') {
      handleClearDateFilter()
    } else if (key === 'search') {
      onFilterChange('search', null)
      setSearchTxt('')
    } else {
      onFilterChange(key, null)
    }
  }

  const hasDateError = errors.startDate || errors.endDate
  const isDateValid = tempStartDate && tempEndDate && !hasDateError

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      {/* Hàng 1: Tìm kiếm + Bộ lọc trạng thái + Sắp xếp + Reset */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo mã giảm giá..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              <DropdownMenuItem onClick={() => onFilterChange('is_active', null)} className="text-xs font-bold cursor-pointer rounded-lg">Tất cả trạng thái</DropdownMenuItem>
              {statusOptions.map(s => (
                <DropdownMenuItem key={s.label} onClick={() => onFilterChange('is_active', s.value)} className="text-xs font-semibold cursor-pointer rounded-lg">{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bộ lọc sắp xếp */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <FiFilter size={12} className="text-gray-400" />
                <span>{currentSortLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {sortOptions.map(o => (
                <DropdownMenuItem key={o.value} onClick={() => onFilterChange('sortBy', o.value)} className="text-xs font-semibold cursor-pointer rounded-lg">{o.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onReset} className="p-2.5 bg-gray-50 text-gray-500 hover:text-brand-primary border border-gray-200 rounded-xl cursor-pointer transition-colors hover:bg-brand-primary/5 shadow-sm">
                <FiRefreshCw size={15} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="font-semibold">Làm mới bộ lọc</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Hàng 2: Bộ lọc ngày tháng */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <FiCalendar size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Lọc theo ngày:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                type="date"
                value={tempStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`rounded-xl border-gray-200 py-2 text-sm font-semibold focus-visible:ring-brand-primary/20 w-[160px] ${
                  errors.startDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                }`}
                placeholder="Từ ngày"
              />
            </div>

            <span className="text-xs text-gray-400 font-bold">→</span>

            <div className="relative">
              <Input
                type="date"
                value={tempEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={`rounded-xl border-gray-200 py-2 text-sm font-semibold focus-visible:ring-brand-primary/20 w-[160px] ${
                  errors.endDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                }`}
                placeholder="Đến ngày"
              />
            </div>

            {/* Nút Áp dụng */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleApplyDateFilter}
                  disabled={!tempStartDate || !tempEndDate || !!hasDateError}
                  className={`px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                    isDateValid
                      ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm shadow-brand-primary/20'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiCheck size={14} />
                  <span className="text-sm font-bold">Áp dụng</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="font-semibold">
                {isDateValid ? 'Áp dụng lọc theo ngày' : 'Chọn đầy đủ ngày hợp lệ'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Hiển thị lỗi */}
          {(errors.startDate || errors.endDate) && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <FiAlertCircle size={12} />
              <span>{errors.startDate || errors.endDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Badges */}
      <AnimatePresence>
        {activeBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50"
          >
            <span className="text-xs font-semibold text-gray-400 mr-1">Đang lọc theo:</span>
            {activeBadges.map(badge => (
              <motion.span
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                key={badge.key}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-xs font-bold shadow-sm"
              >
                {badge.label}
                <FiX className="cursor-pointer hover:bg-brand-primary hover:text-white rounded-full p-0.5 transition-all w-4 h-4" onClick={() => handleRemoveFilter(badge.key)} />
              </motion.span>
            ))}
            <button onClick={onReset} className="text-xs font-semibold text-gray-500 hover:text-red-500 underline ml-3 transition-colors cursor-pointer">
              Xóa tất cả bộ lọc
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}