import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiFilter, FiRefreshCw, FiX, FiStar, FiFlag } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '~/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { REVIEW_TYPES } from '~/utils/constant'

export const ReviewFilters = ({ filters, onFilterChange, onReset, reviewType, onReviewTypeChange }) => {
  const [searchTxt, setSearchTxt] = useState(filters.search || '')

  useEffect(() => {
    if (!filters.search) setSearchTxt('')
  }, [filters.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  const renderStars = (rating) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={12}
            className={star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  const ratingOptions = [
    { value: null, label: 'Tất cả số sao', stars: null },
    { value: 5, label: '5 sao', stars: 5 },
    { value: 4, label: '4 sao', stars: 4 },
    { value: 3, label: '3 sao', stars: 3 },
    { value: 2, label: '2 sao', stars: 2 },
    { value: 1, label: '1 sao', stars: 1 }
  ]

  const statusOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: 1, label: 'Đang hiển thị' },
    { value: 0, label: 'Đã ẩn' }
  ]

  const reportedOptions = [
    { value: null, label: 'Tất cả' },
    { value: 1, label: 'Đã báo cáo' },
    { value: 0, label: 'Chưa báo cáo' }
  ]

  const currentRatingOption = ratingOptions.find(s => s.value === filters.rating)
  const currentStatusLabel = statusOptions.find(s => s.value === filters.isActive)?.label || 'Tất cả trạng thái'
  const currentReportedLabel = reportedOptions.find(s => s.value === filters.isReported)?.label || 'Tất cả'

  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })
  if (filters.rating) activeBadges.push({ key: 'rating', label: `${filters.rating} sao` })
  if (filters.isActive !== null && filters.isActive !== undefined) {
    activeBadges.push({ key: 'isActive', label: filters.isActive === 1 ? 'Đang hiển thị' : 'Đã ẩn' })
  }
  if (filters.isReported !== null && filters.isReported !== undefined) {
    activeBadges.push({ key: 'isReported', label: filters.isReported === 1 ? 'Đã báo cáo' : 'Chưa báo cáo' })
  }

  const handleRemoveFilter = (key) => {
    if (key === 'rating') {
      onFilterChange('rating', null)
    } else if (key === 'isActive') {
      onFilterChange('isActive', null)
    } else if (key === 'isReported') {
      onFilterChange('isReported', null)
    } else {
      onFilterChange(key, null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="w-full mb-6 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => onReviewTypeChange(REVIEW_TYPES.PRODUCT)}
            className={`cursor-pointer flex-1 px-5 py-3 text-base font-bold transition-all duration-300 relative
        ${reviewType === REVIEW_TYPES.PRODUCT
      ? 'text-brand-primary font-extrabold'
      : 'text-gray-500 hover:text-gray-700'
    }`}
          >
      Đánh giá sản phẩm
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary transition-all duration-300 ${
              reviewType === REVIEW_TYPES.PRODUCT ? 'scale-x-100 shadow-glow' : 'scale-x-0'
            }`} />
          </button>
          <button
            onClick={() => onReviewTypeChange(REVIEW_TYPES.STORE)}
            className={`cursor-pointer flex-1 px-5 py-3 text-base font-bold transition-all duration-300 relative
        ${reviewType === REVIEW_TYPES.STORE
      ? 'text-brand-primary font-extrabold'
      : 'text-gray-500 hover:text-gray-700'
    }`}
          >
      Đánh giá cửa hàng
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary transition-all duration-300 ${
              reviewType === REVIEW_TYPES.STORE ? 'scale-x-100 shadow-glow' : 'scale-x-0'
            }`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Khung Search */}
        <div className="relative w-full lg:max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo nội dung đánh giá..."
            className="pl-10 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        {/* Cụm Dropdown Lọc */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[140px]">
                {currentRatingOption?.stars ? renderStars(currentRatingOption.stars) : <FiStar size={12} className="text-gray-400" />}
                <span>{currentRatingOption?.label || 'Tất cả số sao'}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {ratingOptions.map(s => (
                <DropdownMenuItem key={s.label} onClick={() => onFilterChange('rating', s.value)} className="text-xs font-semibold cursor-pointer rounded-lg">
                  <div className="flex items-center gap-2">
                    {s.stars ? renderStars(s.stars) : <FiStar size={12} className="text-gray-400" />}
                    <span>{s.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[130px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {statusOptions.map(s => (
                <DropdownMenuItem key={s.label} onClick={() => onFilterChange('isActive', s.value)} className="text-xs font-semibold cursor-pointer rounded-lg">
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[130px]">
                <FiFlag size={12} className="text-red-500" />
                <span>{currentReportedLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {reportedOptions.map(s => (
                <DropdownMenuItem key={s.label} onClick={() => onFilterChange('isReported', s.value)} className="text-xs font-semibold cursor-pointer rounded-lg">
                  {s.label}
                </DropdownMenuItem>
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
                {badge.key === 'rating' && <FiStar size={10} className="fill-current" />}
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