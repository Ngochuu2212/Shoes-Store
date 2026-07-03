import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX, FiAlertCircle } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ROLE_ID } from '~/utils/constant'

export const UserFilters = ({ filters, onFilterChange, onReset }) => {
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

  const roleOptions = [
    { value: null, label: 'Tất cả vai trò' },
    { value: ROLE_ID.ADMIN, label: 'Quản trị viên' },
    { value: ROLE_ID.MANAGER, label: 'Điều hành viên' },
    { value: ROLE_ID.VENDOR, label: 'Người bán' },
    { value: ROLE_ID.USER, label: 'Người dùng' }
  ]

  const statusOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: 1, label: 'Đang hoạt động' },
    { value: 0, label: 'Đã khóa' }
  ]

  // Fix: Xác định đúng label cho role
  const getCurrentRoleLabel = () => {
    // Nếu roleId là null hoặc undefined -> hiển thị "Tất cả vai trò"
    if (filters.roleId === null || filters.roleId === undefined || filters.roleId === '') {
      return 'Tất cả vai trò'
    }
    // Tìm label tương ứng với giá trị roleId (chuyển sang Number để so sánh chính xác)
    const role = roleOptions.find(r => r.value === Number(filters.roleId))
    return role?.label || 'Tất cả vai trò'
  }

  // Fix: Xác định đúng label cho status
  const getCurrentStatusLabel = () => {
    // Nếu isActive là null hoặc undefined -> hiển thị "Tất cả trạng thái"
    if (filters.isActive === null || filters.isActive === undefined || filters.isActive === '') {
      return 'Tất cả trạng thái'
    }
    // Tìm label tương ứng với giá trị isActive
    const status = statusOptions.find(s => s.value === Number(filters.isActive))
    return status?.label || 'Tất cả trạng thái'
  }

  const currentRoleLabel = getCurrentRoleLabel()
  const currentStatusLabel = getCurrentStatusLabel()

  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })
  if (filters.roleId !== null && filters.roleId !== undefined && filters.roleId !== '') {
    const role = roleOptions.find(r => r.value === Number(filters.roleId))
    if (role && role.label !== 'Tất cả vai trò') {
      activeBadges.push({ key: 'roleId', label: `Vai trò: ${role.label}` })
    }
  }
  if (filters.isActive !== null && filters.isActive !== undefined && filters.isActive !== '') {
    const status = statusOptions.find(s => s.value === Number(filters.isActive))
    if (status && status.label !== 'Tất cả trạng thái') {
      activeBadges.push({ key: 'isActive', label: `Trạng thái: ${status.label}` })
    }
  }

  const handleRemoveFilter = (key) => {
    if (key === 'isActive') {
      onFilterChange('isActive', null)
    } else if (key === 'roleId') {
      onFilterChange('roleId', null)
    } else {
      onFilterChange(key, null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc vai trò */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <span>{currentRoleLabel}</span>
                <FiChevronDown size={14} className="text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {roleOptions.map(option => (
                <DropdownMenuItem
                  key={option.value === null ? 'all' : option.value}
                  onClick={() => onFilterChange('roleId', option.value)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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