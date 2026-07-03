import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from '~/components/ui/navigation-menu'

import { FiGrid, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const CategoryMenu = ({ categories }) => {
  // Hàm lấy tất cả slug của category cha và các con
  const getAllCategorySlugs = (category) => {
    const slugs = [category.slug]
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        slugs.push(child.slug)
      })
    }
    return slugs
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg font-semibold text-base text-gray-700
                             transition-all duration-300 ease-out hover:bg-gray-100 data-[state=open]:bg-gray-100
                             data-[state=open]:text-brand-primary h-auto cursor-pointer"
          >
            <FiGrid size={16} />
                  Danh mục sản phẩm
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <div className="w-[560px] p-4 grid grid-cols-2 gap-1">
              {categories.length === 0 ? (
                <p className="col-span-2 text-sm text-gray-400 text-center py-4">Đang tải...</p>
              ) : (
                categories.map(cat => {
                  // Lấy tất cả slug của cha và con
                  const allSlugs = getAllCategorySlugs(cat)
                  const categoryParam = allSlugs.join(',')

                  return (
                    <div key={cat.id}>
                      {/* Danh mục cha - gửi tất cả slug */}
                      <Link
                        to={`/products?categories=${categoryParam}`}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg
                                 font-semibold text-sm text-gray-800
                                 hover:bg-[#e94560]/5 hover:text-brand-primary
                                 transition-all duration-200 ease-out group"
                      >
                        <span>{cat.name}</span>
                        {cat.children?.length > 0 && (
                          <FiChevronRight size={14} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                        )}
                      </Link>

                      {/* Danh mục con - gửi slug của con */}
                      {cat.children?.length > 0 && (
                        <div className="ml-3 border-l border-gray-100 pl-2 mb-1">
                          {cat.children.map(child => (
                            <Link
                              key={child.id}
                              to={`/products?categories=${child.slug}`}
                              className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-500
                                       hover:bg-[#e94560]/5 hover:text-brand-primary
                                       transition-all duration-200 ease-out"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}