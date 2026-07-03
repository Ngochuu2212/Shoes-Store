import { FiSearch, FiShoppingCart, FiChevronDown, FiGrid } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const MobileHeader = ({ mobileMenuOpen, searchTerm, setSearchTerm,
  handleSearch, categories, expandedMobile,
  setExpandedMobile, setMobileMenuOpen, user }) => {
  return (
    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out
          ${mobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
    >
      {/* Mobile Search */}
      <form onSubmit={handleSearch} className="pt-3 pb-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12
                           focus:outline-none focus:border-brand-primary text-sm transition-all duration-300"
          />
          <button type="submit" className="absolute right-4 top-3 text-gray-400 hover:text-brand-primary">
            <FiSearch size={16} />
          </button>
        </div>
      </form>

      <nav className="flex flex-col border-t border-gray-100 py-2">
        {/* Mobile categories — accordion */}
        <div className="border-b border-gray-50">
          <button
            className="w-full flex items-center justify-between py-3 px-1 font-semibold text-sm text-gray-700"
            onClick={() => setExpandedMobile(expandedMobile === 'categories' ? null : 'categories')}
          >
            <span className="flex items-center gap-2"><FiGrid size={14} /> Danh mục sản phẩm</span>
            <FiChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ${expandedMobile === 'categories' ? 'rotate-180' : ''}`}
            />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-out
                ${expandedMobile === 'categories' ? 'max-h-[500px] overflow-y-auto' : 'max-h-0'}`}
          >
            {categories.map(cat => (
              <div key={cat.id} className="pl-4">
                <Link
                  to={`/products?categories=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)} // Click xong tự đóng menu
                  className="flex items-center py-2.5 text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors">
                  {cat.name}
                </Link>
                {cat.children?.map(child => (
                  <Link
                    key={child.id}
                    to={`/products?categories=${child.slug}`}
                    onClick={() => setMobileMenuOpen(false)} // Click xong tự đóng menu
                    className="flex items-center py-2 pl-3 text-sm text-gray-500 hover:text-brand-primary transition-colors border-l border-gray-100">
                    {child.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Nav Links */}
        {
          [
            { name: 'Trang chủ', path: '/' },
            { name: 'Sản phẩm', path: '/products' },
            { name: 'Đơn hàng', path: '/orders' }
          ].map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/products' && location.pathname.startsWith('/product/'))

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-1 font-semibold text-sm border-b border-gray-50
                      transition-colors duration-200 
                      ${isActive ? 'text-brand-primary' : 'text-gray-700 hover:text-brand-primary'}`}
              >
                {item.name}
              </Link>
            )
          })
        }

        {user ? (
          <div className="flex items-center justify-between pt-4 pb-2">
            <span className="text-sm font-semibold text-gray-700">Xin chào, {user.fullname}</span>
          </div>
        ) : (
          <div className="flex gap-3 pt-4 pb-2">
            <button className="flex-1 text-sm font-semibold text-brand-primary py-2.5 rounded-full border border-brand-primary transition-all duration-300 hover:bg-[#e94560]/5 active:scale-95">
                  Đăng nhập
            </button>
            <button className="flex-1 text-sm font-semibold text-white py-2.5 rounded-full bg-brand-primary transition-all duration-300 hover:bg-[#c73652] active:scale-95">
                  Đăng ký
            </button>
          </div>
        )}
      </nav>
    </div>
  )
}