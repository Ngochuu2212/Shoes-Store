import { useState, useRef } from 'react'
import { FiSearch, FiShoppingCart, FiChevronDown, FiGrid, FiCamera } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { aiApiService } from '~/services/ai/aiApiService'
import { toast } from 'react-toastify'

export const MobileHeader = ({ mobileMenuOpen, searchTerm, setSearchTerm,
  handleSearch, categories, expandedMobile,
  setExpandedMobile, setMobileMenuOpen, user }) => {
  
  const [isScanning, setIsScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setIsScanning(true)
    setMobileMenuOpen(false) // Đóng menu mobile khi bắt đầu tìm kiếm

    try {
      const response = await aiApiService.searchByImage(file)
      
      if (response && response.products) {
        toast.success(`AI đã tìm thấy ${response.products.length} sản phẩm tương đồng!`)
        navigate('/products', {
          state: {
            aiProducts: response.products,
            uploadedImage: previewUrl,
            keywords: response.keywords
          }
        })
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm hình ảnh AI:', error)
      toast.error(error?.response?.data?.message || 'Không thể nhận diện hình ảnh của bạn!')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-22
                           focus:outline-none focus:border-brand-primary text-sm transition-all duration-300"
          />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isScanning}
              className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-primary cursor-pointer disabled:opacity-50"
            >
              <FiCamera size={15} />
            </button>
          </div>

          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-primary rounded-full
                                       flex items-center justify-center text-white cursor-pointer">
            <FiSearch size={14} />
          </button>
        </div>
      </form>

      {/* AI Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white select-none">
          <style>{`
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
          
          <div className="relative w-28 h-28 mb-6">
            <div className="w-full h-full rounded-3xl border-2 border-orange-500 bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-75" />
              )}
            </div>
            <div 
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-md shadow-orange-500/50"
              style={{
                animation: 'scan 2.5s linear infinite'
              }}
            />
          </div>
          <h3 className="text-lg font-black tracking-wide flex items-center gap-1.5 px-4 text-center">
            AI đang phân tích hình ảnh...
          </h3>
          <p className="text-xs text-gray-400 mt-2 px-6 text-center">Đang tìm kiếm các sản phẩm tương đồng trên ShoesStore.</p>
        </div>
      )}

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