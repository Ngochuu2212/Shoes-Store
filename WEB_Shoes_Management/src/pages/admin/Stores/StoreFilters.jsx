import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX, FiFilter, FiClock, FiDollarSign, FiStar, FiPercent } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

export const StoreFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchParams, setSearchParams] = useSearchParams()
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

  const statusOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: 1, label: 'Đang hoạt động' },
    { value: 0, label: 'Đã khóa' }
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Mới nhất', icon: FiClock, group: 'Thời gian' },
    { value: 'balance', label: 'Số dư cao nhất', icon: FiDollarSign, group: 'Số dư' },
    { value: 'balance_asc', label: 'Số dư thấp nhất', icon: FiDollarSign, group: 'Số dư' },
    { value: 'rating_average', label: 'Đánh giá cao nhất', icon: FiStar, group: 'Đánh giá' },
    { value: 'rating_average_asc', label: 'Đánh giá thấp nhất', icon: FiStar, group: 'Đánh giá' },
    { value: 'commission_rate', label: 'Phí hoa hồng cao nhất', icon: FiPercent, group: 'Phí hoa hồng' },
    { value: 'commission_rate_asc', label: 'Phí hoa hồng thấp nhất', icon: FiPercent, group: 'Phí hoa hồng' }
  ]

  const groupIcons = {
    'Thời gian': FiClock,
    'Số dư': FiDollarSign,
    'Đánh giá': FiStar,
    'Phí hoa hồng': FiPercent
  }

  // Fix: Xác định đúng label cho status
  const getCurrentStatusLabel = () => {
    if (filters.isActive === null || filters.isActive === undefined || filters.isActive === '') {
      return 'Tất cả trạng thái'
    }
    const status = statusOptions.find(s => s.value === Number(filters.isActive))
    return status?.label || 'Tất cả trạng thái'
  }

  // Fix: Xác định đúng label cho sort
  const getCurrentSortLabel = () => {
    const sortKey = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder || 'DESC'

    const option = sortOptions.find(s => {
      if (sortOrder === 'ASC') {
        return s.value === `${sortKey}_asc`
      }
      return s.value === sortKey
    })

    return option?.label || 'Sắp xếp'
  }

  const currentStatusLabel = getCurrentStatusLabel()
  const currentSortLabel = getCurrentSortLabel()

  // Fix: Active badges - chỉ hiển thị khi có filter thực sự
  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })

  if (filters.isActive !== null && filters.isActive !== undefined && filters.isActive !== '') {
    const status = statusOptions.find(s => s.value === Number(filters.isActive))
    if (status && status.label !== 'Tất cả trạng thái') {
      activeBadges.push({ key: 'isActive', label: `Trạng thái: ${status.label}` })
    }
  }

  // Fix: Chỉ hiển thị badge sort khi không phải default
  const sortLabel = getCurrentSortLabel()
  if (filters.sortBy && filters.sortBy !== 'created_at') {
    activeBadges.push({ key: 'sortBy', label: `Sắp xếp: ${sortLabel}` })
  }

  const handleRemoveFilter = (key) => {
    if (key === 'sortBy') {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('sortBy')
      newParams.delete('sortOrder')
      newParams.set('page', '1')
      setSearchParams(newParams)
    } else if (key === 'isActive') {
      onFilterChange('isActive', null)
    } else {
      onFilterChange(key, null)
    }
  }

  const handleSortChange = (value) => {
    const newParams = new URLSearchParams(searchParams)

    newParams.delete('sortBy')
    newParams.delete('sortOrder')

    const sortMap = {
      'created_at': { sortBy: 'created_at', sortOrder: 'DESC' },
      'balance': { sortBy: 'balance', sortOrder: 'DESC' },
      'balance_asc': { sortBy: 'balance', sortOrder: 'ASC' },
      'rating_average': { sortBy: 'rating_average', sortOrder: 'DESC' },
      'rating_average_asc': { sortBy: 'rating_average', sortOrder: 'ASC' },
      'commission_rate': { sortBy: 'commission_rate', sortOrder: 'DESC' },
      'commission_rate_asc': { sortBy: 'commission_rate', sortOrder: 'ASC' }
    }

    const config = sortMap[value]
    if (config) {
      newParams.set('sortBy', config.sortBy)
      newParams.set('sortOrder', config.sortOrder)
    }

    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const groupedOptions = sortOptions.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = []
    }
    acc[option.group].push(option)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo tên cửa hàng..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[140px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {statusOptions.map(option => (
                <DropdownMenuItem
                  key={option.value === null ? 'all' : option.value}
                  onClick={() => onFilterChange('isActive', option.value)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bộ lọc sắp xếp */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[160px]">
                <FiFilter size={12} className="text-gray-400" />
                <span>{currentSortLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[180px]">
              {Object.entries(groupedOptions).map(([group, options], groupIndex) => {
                const GroupIcon = groupIcons[group]
                return (
                  <div key={group}>
                    {groupIndex > 0 && <div className="border-t border-gray-50 my-1" />}
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      {GroupIcon && <GroupIcon size={12} className="text-gray-400" />}
                      <span className="text-[10px] font-bold text-gray-400">{group}</span>
                    </div>
                    {options.map((option) => {
                      const Icon = option.icon
                      // Fix: Xác định option đang được chọn
                      const isSelected = (() => {
                        const sortKey = filters.sortBy || 'created_at'
                        const sortOrder = filters.sortOrder || 'DESC'
                        if (sortOrder === 'ASC') {
                          return option.value === `${sortKey}_asc`
                        }
                        return option.value === sortKey
                      })()

                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`text-xs font-semibold cursor-pointer rounded-lg pl-6 flex items-center gap-2 ${
                            isSelected ? 'text-emerald-600 bg-emerald-50' : ''
                          }`}
                        >
                          <Icon size={12} className={isSelected ? 'text-emerald-600' : 'text-gray-400'} />
                          {option.label}
                          {isSelected && <span className="ml-auto text-emerald-600">✓</span>}
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onReset} className="p-2.5 bg-gray-50 text-gray-500 hover:text-emerald-500 border border-gray-200 rounded-xl cursor-pointer transition-colors hover:bg-emerald-500/5 shadow-sm">
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
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold shadow-sm"
              >
                {badge.label}
                <FiX className="cursor-pointer hover:bg-emerald-500 hover:text-white rounded-full p-0.5 transition-all w-4 h-4" onClick={() => handleRemoveFilter(badge.key)} />
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