import { useState, useEffect } from 'react'
import { FiChevronDown, FiStar, FiZap } from 'react-icons/fi'
import { categoryService } from '~/services/user/categoryService'
import { attributeService } from '~/services/user/attributeService'

export const FilterSidebar = ({ filters, setFilters }) => {
  const [categories, setCategories] = useState([])
  const [sizesList, setSizesList] = useState([])
  const [colorsList, setColorsList] = useState([])

  const priceRanges = [
    { value: '0-1000000', label: 'Dưới 1.000.000đ' },
    { value: '1000000-3000000', label: '1tr - 3tr' },
    { value: '3000000-5000000', label: '3tr - 5tr' },
    { value: '5000000-max', label: 'Trên 5.000.000đ' }
  ]
  const ratingList = [5, 4, 3]

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [catData, attrData] = await Promise.all([
          categoryService.getAllCategories(),
          attributeService.getGlobalAttributes()
        ])

        setCategories(catData)
        setSizesList(attrData.sizes)
        setColorsList(attrData.colors)
      } catch (error) {
        console.error('Lỗi tải dữ liệu sidebar:', error)
      }
    }
    fetchSidebarData()
  }, [])

  const handleToggleParentCategory = (parentCategory) => {
    const currentCategories = filters.categories || []

    // Lấy tất cả slug của category cha và các con
    const getAllCategorySlugs = (cat) => {
      const slugs = [cat.slug]
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach(child => {
          slugs.push(child.slug)
        })
      }
      return slugs
    }

    const categorySlugs = getAllCategorySlugs(parentCategory)

    // Kiểm tra xem tất cả các slug đã có trong currentCategories chưa
    const allChecked = categorySlugs.every(slug => currentCategories.includes(slug))

    let newCategories
    if (allChecked) {
      // Nếu đã check hết thì bỏ check tất cả
      newCategories = currentCategories.filter(slug => !categorySlugs.includes(slug))
    } else {
      // Nếu chưa check hết thì check tất cả
      const slugsToAdd = categorySlugs.filter(slug => !currentCategories.includes(slug))
      newCategories = [...currentCategories, ...slugsToAdd]
    }

    setFilters({ ...filters, categories: newCategories, page: 1 })
  }

  const handleToggleChildCategory = (childSlug, parentCategory) => {
    const currentCategories = filters.categories || []

    // Toggle child
    let newCategories = currentCategories.includes(childSlug)
      ? currentCategories.filter(slug => slug !== childSlug)
      : [...currentCategories, childSlug]

    // Kiểm tra xem sau khi toggle, parent có còn đủ điều kiện để check không
    if (parentCategory && parentCategory.children) {
      const childSlugs = parentCategory.children.map(child => child.slug)
      const allChildrenChecked = childSlugs.every(slug => newCategories.includes(slug))

      // Nếu tất cả children đều được check và parent chưa có trong list thì thêm parent vào
      if (allChildrenChecked && !newCategories.includes(parentCategory.slug)) {
        newCategories = [...newCategories, parentCategory.slug]
      }
      // Nếu không phải tất cả children đều được check và parent đang có trong list thì xóa parent
      else if (!allChildrenChecked && newCategories.includes(parentCategory.slug)) {
        newCategories = newCategories.filter(slug => slug !== parentCategory.slug)
      }
    }

    setFilters({ ...filters, categories: newCategories, page: 1 })
  }

  // Hàm xử lý chung cho các filter dạng mảng (sizes, colors, ratings, prices)
  const handleToggleArrayFilter = (field, value) => {
    const currentArray = filters[field] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]

    setFilters({ ...filters, [field]: newArray, page: 1 })
  }

  // Hàm xử lý toggle giảm giá
  const handleDiscountChange = (e) => {
    setFilters({ ...filters, isDiscounted: e.target.checked, page: 1 })
  }

  const isParentChecked = (parentCategory) => {
    const currentCategories = filters.categories || []
    const getAllCategorySlugs = (cat) => {
      const slugs = [cat.slug]
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach(child => {
          slugs.push(child.slug)
        })
      }
      return slugs
    }
    const categorySlugs = getAllCategorySlugs(parentCategory)
    return categorySlugs.every(slug => currentCategories.includes(slug))
  }

  const isChildChecked = (childSlug) => {
    return (filters.categories || []).includes(childSlug)
  }

  const findParentCategory = (childSlug) => {
    for (const parent of categories) {
      if (parent.children && parent.children.some(child => child.slug === childSlug)) {
        return parent
      }
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

      {/* 1. Danh mục */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 cursor-pointer">
          <h3 className="font-bold text-gray-900">Danh mục</h3>
          <FiChevronDown />
        </div>
        <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-2">
          {categories.map(parent => (
            <div key={parent.id} className="flex flex-col gap-2">

              {/* Render Danh mục Cha */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isParentChecked(parent)}
                  onChange={() => handleToggleParentCategory(parent)}
                  className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
                <span className="text-gray-800 font-semibold group-hover:text-brand-primary transition-colors">
                  {parent.name}
                </span>
              </label>

              {/* Render Danh mục Con (Nếu có) */}
              {parent.children && parent.children.length > 0 && (
                <div className="ml-7 space-y-2 border-l-2 border-gray-100 pl-3">
                  {parent.children.map(child => (
                    <label key={child.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChildChecked(child.slug)}
                        onChange={() => handleToggleChildCategory(child.slug, parent)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />
                      <span className="text-gray-600 text-sm group-hover:text-brand-primary transition-colors">
                        {child.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
      <hr className="border-gray-100 mb-6" />

      {/* 2. Khoảng giá */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Khoảng giá</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.prices || []).includes(range.value)}
                onChange={() => handleToggleArrayFilter('prices', range.value)}
                className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-gray-600 group-hover:text-brand-primary transition-colors">{range.label}</span>
            </label>
          ))}
        </div>
      </div>
      <hr className="border-gray-100 mb-6" />

      {/* 3. Kích thước (Size) */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Kích thước (Size)</h3>
        <div className="grid grid-cols-4 gap-2">
          {sizesList.map(size => {
            const isActive = (filters.sizes || []).includes(size)
            return (
              <button
                key={size}
                onClick={() => handleToggleArrayFilter('sizes', size)}
                className={`py-2 border rounded-md text-sm font-semibold transition-all duration-300 cursor-pointer
                  ${isActive ? 'border-brand-primary text-brand-primary bg-[#e94560]/5' : 'border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary'}`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>
      <hr className="border-gray-100 mb-6" />

      {/* 4. Màu sắc */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Màu sắc</h3>
        <div className="flex flex-wrap gap-3">
          {colorsList.map(color => {
            const isActive = (filters.colors || []).includes(color.value)
            return (
              <button
                key={color.value}
                onClick={() => handleToggleArrayFilter('colors', color.value)}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                className={`w-8 h-8 cursor-pointer rounded-full border-2 transition-all duration-300 shadow-sm
                  ${isActive ? 'border-brand-primary scale-110 ring-2 ring-brand-primary/50' : 'border-gray-200 hover:scale-110'}`}
              />
            )
          })}
        </div>
      </div>
      <hr className="border-gray-100 mb-6" />

      {/* 5. Đánh giá (Số sao) */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Đánh giá</h3>
        <div className="space-y-3 cursor-pointer">
          {ratingList.map(star => (
            <label key={star} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.ratings || []).includes(star)}
                onChange={() => handleToggleArrayFilter('ratings', star)}
                className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <FiStar key={index} className={index < star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} size={16} />
                ))}
                <span className="text-gray-600 text-sm ml-1 group-hover:text-brand-primary transition-colors">Từ {star} sao</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <hr className="border-gray-100 mb-6" />

      {/* 6. Trạng thái giảm giá */}
      <div>
        <label className="flex items-center justify-between cursor-pointer group p-3 bg-[#e94560]/5 rounded-xl border border-[#e94560]/10 hover:bg-[#e94560]/10 transition-colors">
          <div className="font-bold text-brand-primary">Đang giảm giá</div>
          <input
            type="checkbox"
            checked={filters.isDiscounted || false}
            onChange={handleDiscountChange}
            className="w-5 h-5 cursor-pointer rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
          />
        </label>
      </div>

    </div>
  )
}