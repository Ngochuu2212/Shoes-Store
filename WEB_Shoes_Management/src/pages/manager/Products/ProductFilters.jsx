import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'

export const ProductFilters = ({ filters, onFilterChange, onReset, categories = [], stores = [] }) => {
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
    { value: PRODUCT_MODERATION_STATUS.PENDING, label: 'Chờ duyệt' },
    { value: PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL, label: 'Chờ duyệt lại' },
    { value: PRODUCT_MODERATION_STATUS.APPROVED, label: 'Đã duyệt' },
    { value: PRODUCT_MODERATION_STATUS.REJECTED, label: 'Từ chối' },
    { value: PRODUCT_MODERATION_STATUS.BANNED, label: 'Bị khóa' }
  ]

  // Fix: Xác định đúng label cho category
  const getCurrentCategoryLabel = () => {
    if (filters.categoryId === null || filters.categoryId === undefined || filters.categoryId === '') {
      return 'Tất cả danh mục'
    }
    const category = categories.find(c => c.id === Number(filters.categoryId))
    return category?.name || 'Tất cả danh mục'
  }

  // Fix: Xác định đúng label cho store
  const getCurrentStoreLabel = () => {
    if (filters.storeId === null || filters.storeId === undefined || filters.storeId === '') {
      return 'Tất cả cửa hàng'
    }
    const store = stores.find(s => s.id === Number(filters.storeId))
    return store?.name || store?.store_name || 'Tất cả cửa hàng'
  }

  // Fix: Xác định đúng label cho status
  const getCurrentStatusLabel = () => {
    if (filters.status === null || filters.status === undefined || filters.status === '') {
      return 'Tất cả trạng thái'
    }
    const status = statusOptions.find(s => s.value === filters.status)
    return status?.label || 'Tất cả trạng thái'
  }

  const currentCategoryLabel = getCurrentCategoryLabel()
  const currentStoreLabel = getCurrentStoreLabel()
  const currentStatusLabel = getCurrentStatusLabel()

  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })

  if (filters.status !== null && filters.status !== undefined && filters.status !== '') {
    const statusLabel = statusOptions.find(s => s.value === filters.status)?.label
    if (statusLabel && statusLabel !== 'Tất cả trạng thái') {
      activeBadges.push({ key: 'status', label: `Trạng thái: ${statusLabel}` })
    }
  }

  if (filters.categoryId !== null && filters.categoryId !== undefined && filters.categoryId !== '') {
    const category = categories.find(c => c.id === Number(filters.categoryId))
    if (category) {
      activeBadges.push({ key: 'categoryId', label: `Danh mục: ${category.name}` })
    }
  }

  if (filters.storeId !== null && filters.storeId !== undefined && filters.storeId !== '') {
    const store = stores.find(s => s.id === Number(filters.storeId))
    if (store) {
      const storeName = store.name || store.store_name
      activeBadges.push({ key: 'storeId', label: `Cửa hàng: ${storeName}` })
    }
  }

  const handleRemoveFilter = (key) => {
    onFilterChange(key, null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, SKU..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc Danh mục */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <span className="truncate">{currentCategoryLabel}</span>
                <FiChevronDown size={14} className="text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 max-h-64 overflow-y-auto min-w-[180px]">
              <DropdownMenuItem
                onClick={() => onFilterChange('categoryId', null)}
                className="text-xs font-bold cursor-pointer rounded-lg"
              >
                Tất cả danh mục
              </DropdownMenuItem>
              {categories.map(cat => (
                <DropdownMenuItem
                  key={cat.id}
                  onClick={() => onFilterChange('categoryId', cat.id)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg ${
                    Number(filters.categoryId) === cat.id ? 'text-brand-primary bg-brand-primary/5' : ''
                  }`}
                >
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bộ lọc Cửa hàng */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[160px]">
                <span className="truncate">{currentStoreLabel}</span>
                <FiChevronDown size={14} className="text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 max-h-64 overflow-y-auto min-w-[200px]">
              <DropdownMenuItem
                onClick={() => onFilterChange('storeId', null)}
                className="text-xs font-bold cursor-pointer rounded-lg"
              >
                Tất cả cửa hàng
              </DropdownMenuItem>
              {stores.map(store => (
                <DropdownMenuItem
                  key={store.id}
                  onClick={() => onFilterChange('storeId', store.id)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg ${
                    Number(filters.storeId) === store.id ? 'text-brand-primary bg-brand-primary/5' : ''
                  }`}
                >
                  {store.name || store.store_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bộ lọc Trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[140px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {statusOptions.map(s => (
                <DropdownMenuItem
                  key={s.value === null ? 'all' : s.value}
                  onClick={() => onFilterChange('status', s.value)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg ${
                    filters.status === s.value ? 'text-brand-primary bg-brand-primary/5' : ''
                  }`}
                >
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