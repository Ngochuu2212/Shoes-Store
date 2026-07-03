import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX, FiFilter } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { PAYOUT_STATUS } from '~/utils/constant'

export const PayoutFilters = ({ filters, onFilterChange, onReset, onSearch }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: PAYOUT_STATUS.PENDING, label: 'Đang chờ duyệt' },
    { value: PAYOUT_STATUS.APPROVED, label: 'Đã duyệt' },
    { value: PAYOUT_STATUS.REJECTED, label: 'Đã từ chối' }
  ]

  const getStatusColor = (status) => {
    const colors = {
      [PAYOUT_STATUS.PENDING]: 'text-amber-600 bg-amber-50',
      [PAYOUT_STATUS.APPROVED]: 'text-green-600 bg-green-50',
      [PAYOUT_STATUS.REJECTED]: 'text-red-600 bg-red-50'
    }
    return colors[status] || ''
  }

  const currentStatusLabel = statusOptions.find(s => s.value === filters.status)?.label || 'Tất cả trạng thái'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchInput)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const activeBadges = []
  if (filters.status) {
    const status = statusOptions.find(s => s.value === filters.status)
    if (status) activeBadges.push({ key: 'status', label: `Trạng thái: ${status.label}` })
  }
  if (filters.search) {
    activeBadges.push({ key: 'search', label: `Tìm kiếm: "${filters.search}"` })
  }

  const handleRemoveFilter = (key) => {
    if (key === 'search') {
      setSearchInput('')
      onFilterChange('search', null)
    } else {
      onFilterChange(key, null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo ID, tên cửa hàng hoặc ngân hàng..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-emerald-500/20"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                onFilterChange('search', null)
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[180px]">
              {statusOptions.map(option => (
                <DropdownMenuItem
                  key={option.value || 'all'}
                  onClick={() => onFilterChange('status', option.value || null)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg flex items-center gap-2 ${
                    option.value ? getStatusColor(option.value) : ''
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
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