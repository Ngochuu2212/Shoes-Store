import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiFilter, FiRefreshCw, FiX } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { categoryService } from '~/services/user/categoryService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

export const ProductFilters = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([])
  const [searchTxt, setSearchTxt] = useState(filters.search || '')

  useEffect(() => {
    categoryService.getAllCategories()
      .then(setCategories)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!filters.search) setSearchTxt('')
  }, [filters.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  // Hàm làm phẳng danh sách categories để hiển thị trong dropdown
  const flattenCategories = (categories, level = 0) => {
    let result = []
    categories.forEach(category => {
      result.push({
        ...category,
        level // Thêm level để biết độ sâu
      })
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1))
      }
    })
    return result
  }

  // Lấy danh sách phẳng để hiển thị
  const flatCategories = flattenCategories(categories)

  const statusOptions = [
    { value: 1, label: 'Đang mở bán' },
    { value: 0, label: 'Đang tạm ẩn' }
  ]

  const sortOptions = [
    { value: 'ctime', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'sold', label: 'Bán chạy nhất' },
    { value: 'rating', label: 'Đánh giá cao nhất' }
  ]

  // Tìm category để hiển thị label (có thể là category con)
  const findCategoryName = (categories, id) => {
    for (const cat of categories) {
      if (cat.id === id) return cat.name
      if (cat.children) {
        const found = findCategoryName(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  const currentCategoryLabel = filters.categoryId
    ? findCategoryName(categories, filters.categoryId) || 'Tất cả danh mục'
    : 'Tất cả danh mục'

  const currentStatusLabel = statusOptions.find(s => s.value === filters.isActive)?.label || 'Tất cả trạng thái'
  const currentSortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label || 'Sắp xếp'

  // Tính toán các Badge lọc đang được kích hoạt
  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })
  if (filters.categoryId) {
    const catName = findCategoryName(categories, filters.categoryId)
    if (catName) activeBadges.push({ key: 'categoryId', label: `Danh mục: ${catName}` })
  }
  if (filters.isActive !== null && filters.isActive !== undefined) {
    const statusLabel = filters.isActive === 1 ? 'Đang mở bán' : 'Đang tạm ẩn'
    activeBadges.push({ key: 'isActive', label: `Trạng thái: ${statusLabel}` })
  }
  if (filters.sortBy && filters.sortBy !== 'ctime') {
    const sortObj = sortOptions.find(s => s.value === filters.sortBy)
    if (sortObj) activeBadges.push({ key: 'sortBy', label: `Sắp xếp: ${sortObj.label}` })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Khung Search */}
        <div className="relative w-full md:max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm tên sản phẩm..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        {/* Cụm Dropdown Lọc */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <span>{currentCategoryLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto rounded-xl shadow-xl border-gray-50 min-w-[200px]">
              <DropdownMenuItem onClick={() => onFilterChange('categoryId', null)} className="text-xs font-bold cursor-pointer rounded-lg">
                Tất cả danh mục
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Hiển thị categories với thụt lề */}
              {flatCategories.map(c => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => onFilterChange('categoryId', c.id)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                  style={{
                    paddingLeft: `${c.level * 20 + 12}px`,
                    borderLeft: c.level > 0 ? '2px solid #e5e7eb' : 'none',
                    marginLeft: c.level > 0 ? '8px' : '0'
                  }}
                >
                  {c.level > 0 && (
                    <span className="text-gray-400 mr-2">└</span>
                  )}
                  {c.name}
                  {c.children && c.children.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">({c.children.length})</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              <DropdownMenuItem onClick={() => onFilterChange('isActive', null)} className="text-xs font-bold cursor-pointer rounded-lg">
                Tất cả trạng thái
              </DropdownMenuItem>
              {statusOptions.map(s => (
                <DropdownMenuItem
                  key={s.label}
                  onClick={() => onFilterChange('isActive', s.value)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <FiFilter size={12} className="text-gray-400" />
                <span>{currentSortLabel}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {sortOptions.map(o => (
                <DropdownMenuItem
                  key={o.value}
                  onClick={() => onFilterChange('sortBy', o.value)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onReset}
                className="p-2.5 bg-gray-50 text-gray-500 hover:text-brand-primary border border-gray-200 rounded-xl cursor-pointer transition-colors hover:bg-brand-primary/5 shadow-sm"
                title="Làm mới bộ lọc"
              >
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
                <FiX
                  className="cursor-pointer hover:bg-brand-primary hover:text-white rounded-full p-0.5 transition-all w-4 h-4"
                  onClick={() => onFilterChange(badge.key, null)}
                />
              </motion.span>
            ))}
            <button
              onClick={onReset}
              className="text-xs font-semibold text-gray-500 hover:text-red-500 underline ml-3 transition-colors cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}