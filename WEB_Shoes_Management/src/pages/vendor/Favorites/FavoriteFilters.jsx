import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX, FiHeart, FiAlertCircle } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { categoryService } from '~/services/user/categoryService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'

export const FavoriteFilters = ({ filters, onFilterChange, onApplyFavoritesRange, onReset }) => {
  const [categories, setCategories] = useState([])
  const [searchTxt, setSearchTxt] = useState(filters.search || '')

  // Local state riêng — chỉ apply khi bấm nút, tránh race condition
  const [minFav, setMinFav] = useState(filters.minFavorites || '')
  const [maxFav, setMaxFav] = useState(filters.maxFavorites || '')

  // State cho validation
  const [favError, setFavError] = useState('')

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    if (!filters.search) setSearchTxt('')
    if (!filters.minFavorites) setMinFav('')
    if (!filters.maxFavorites) setMaxFav('')
    setFavError('') // Reset error khi filters thay đổi
  }, [filters])

  // Debounce tìm kiếm tên
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  // Validate khoảng lượt tim
  const validateFavoritesRange = (min, max) => {
    // Nếu cả 2 đều rỗng thì không cần validate
    if (!min && !max) {
      setFavError('')
      return true
    }

    // Chuyển đổi sang số
    const minNum = min ? Number(min) : null
    const maxNum = max ? Number(max) : null

    // Validate số âm
    if (minNum !== null && minNum < 0) {
      setFavError('Giá trị "Từ" không được nhỏ hơn 0')
      return false
    }

    if (maxNum !== null && maxNum < 0) {
      setFavError('Giá trị "Đến" không được nhỏ hơn 0')
      return false
    }

    // Validate min <= max (khi cả 2 đều có giá trị)
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setFavError('Giá trị "Từ" không được lớn hơn "Đến"')
      return false
    }

    setFavError('')
    return true
  }

  // Xử lý khi thay đổi min
  const handleMinChange = (value) => {
    setMinFav(value)
    // Validate real-time với max hiện tại
    if (maxFav) {
      validateFavoritesRange(value, maxFav)
    } else {
      setFavError('')
    }
  }

  // Xử lý khi thay đổi max
  const handleMaxChange = (value) => {
    setMaxFav(value)
    // Validate real-time với min hiện tại
    if (minFav) {
      validateFavoritesRange(minFav, value)
    } else {
      setFavError('')
    }
  }

  // Gộp cả min + max vào một lần update — tránh overwrite lẫn nhau
  const handleApplyFavoritesRange = () => {
    // Validate trước khi áp dụng
    const isValid = validateFavoritesRange(minFav, maxFav)
    if (!isValid) return

    // Nếu cả 2 đều rỗng, clear filter
    if (!minFav && !maxFav) {
      onApplyFavoritesRange(null, null)
      return
    }

    onApplyFavoritesRange(minFav || null, maxFav || null)
  }

  const statusOptions = [
    { value: 1, label: 'Đang mở bán' },
    { value: 0, label: 'Đang tạm ẩn' }
  ]

  const currentCategoryLabel = categories.find(c => c.id === filters.categoryId)?.name || 'Tất cả danh mục'
  const currentStatusLabel = statusOptions.find(s => s.value === filters.isActive)?.label || 'Trạng thái hiển thị'

  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })
  if (filters.categoryId) {
    const cat = categories.find(c => c.id === filters.categoryId)
    if (cat) activeBadges.push({ key: 'categoryId', label: `Danh mục: ${cat.name}` })
  }
  if (filters.isActive !== null && filters.isActive !== undefined) {
    const statusLabel = filters.isActive === 1 ? 'Đang mở bán' : 'Đang tạm ẩn'
    activeBadges.push({ key: 'isActive', label: `Trạng thái: ${statusLabel}` })
  }
  if (filters.minFavorites || filters.maxFavorites) {
    const min = filters.minFavorites || 0
    const max = filters.maxFavorites || 'Vô hạn'
    activeBadges.push({
      key: 'favoritesRange',
      label: `Lượt tim: ${min} - ${max}`,
      onClear: () => onApplyFavoritesRange(null, null)
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm tên sản phẩm..."
            className="pl-11 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">

          {/* Danh mục */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <span>{currentCategoryLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto rounded-xl shadow-xl border-gray-50">
              <DropdownMenuItem onClick={() => onFilterChange('categoryId', null)} className="text-xs font-bold cursor-pointer rounded-lg py-2">Tất cả danh mục</DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map(c => (
                <DropdownMenuItem key={c.id} onClick={() => onFilterChange('categoryId', c.id)} className="text-xs font-semibold cursor-pointer rounded-lg py-2">{c.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              <DropdownMenuItem onClick={() => onFilterChange('isActive', null)} className="text-xs font-bold cursor-pointer rounded-lg py-2">Tất cả trạng thái</DropdownMenuItem>
              {statusOptions.map(s => (
                <DropdownMenuItem key={s.label} onClick={() => onFilterChange('isActive', s.value)} className="text-xs font-semibold cursor-pointer rounded-lg py-2">{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lọc lượt tim */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl text-sm font-bold text-rose-600 outline-none cursor-pointer transition-colors">
                <FiHeart size={14} className="fill-current" />
                <span>Lọc lượt tim</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-4 rounded-xl shadow-xl border-gray-50 w-64 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khoảng yêu thích</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Từ..."
                    value={minFav}
                    onChange={(e) => handleMinChange(e.target.value)}
                    className={`h-9 text-xs rounded-lg border-gray-200 focus-visible:ring-rose-500/20 ${
                      favError ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                    }`}
                    min="0"
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <Input
                    type="number"
                    placeholder="Đến..."
                    value={maxFav}
                    onChange={(e) => handleMaxChange(e.target.value)}
                    className={`h-9 text-xs rounded-lg border-gray-200 focus-visible:ring-rose-500/20 ${
                      favError ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                    }`}
                    min="0"
                  />
                </div>

                {/* Hiển thị lỗi - đã fix xuống dòng */}
                {favError && (
                  <div className="flex items-start gap-1.5 text-red-500 text-xs font-medium break-words whitespace-normal max-w-full">
                    <FiAlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span className="leading-tight">{favError}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleApplyFavoritesRange}
                disabled={!!favError}
                className={`w-full mt-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  favError
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                Áp dụng
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={onReset}
            className="p-2.5 bg-gray-50 text-gray-500 hover:text-brand-primary border border-gray-200 rounded-xl cursor-pointer transition-colors hover:bg-brand-primary/5 shadow-sm"
            title="Làm mới bộ lọc"
          >
            <FiRefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Active filter badges */}
      <AnimatePresence>
        {activeBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50"
          >
            <span className="text-xs font-bold text-gray-400 mr-1 uppercase tracking-wider">Đang lọc theo:</span>
            {activeBadges.map(badge => (
              <motion.span
                key={badge.key}
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-xs font-bold shadow-sm"
              >
                {badge.label}
                <FiX
                  className="cursor-pointer hover:bg-brand-primary hover:text-white rounded-full p-0.5 transition-all w-4 h-4 ml-1"
                  onClick={badge.onClear ? badge.onClear : () => onFilterChange(badge.key, null)}
                />
              </motion.span>
            ))}
            <button onClick={onReset} className="text-xs font-bold text-gray-400 hover:text-red-500 underline ml-2 transition-colors cursor-pointer">
              Xóa tất cả
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}