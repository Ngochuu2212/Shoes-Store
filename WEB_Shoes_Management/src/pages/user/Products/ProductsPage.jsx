import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadCrumb } from '~/components/user/BreadCrumb'
import { FilterSidebar } from './FilterSidebar'
import { Pagination } from '~/components/common/Pagination'
import { ProductCard } from '~/components/user/ProductCard'
import { productService } from '~/services/user/productService'
import { FiX, FiZap } from 'react-icons/fi'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 })
  const [loading, setLoading] = useState(false)

  const searchQuery = searchParams.get('search') || ''
  const totalItems = pagination.totalItems || 0
  const pageTitle = searchQuery
    ? `"${searchQuery}" (${totalItems} sản phẩm)`
    : `Tất cả sản phẩm (${totalItems} sản phẩm)`

  usePageTitle(
    pageTitle,
    searchQuery
      ? `Kết quả tìm kiếm cho "${searchQuery}" tại Shoes Platform`
      : 'Khám phá bộ sưu tập giày dép đa dạng tại Shoes Platform'
  )

  // KHỞI TẠO STATE TỪ URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categories: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
    stores: searchParams.get('stores') ? searchParams.get('stores').split(',') : [],
    prices: searchParams.get('prices') ? searchParams.get('prices').split(',') : [],
    ratings: searchParams.get('ratings') ? searchParams.get('ratings').split(',').map(Number) : [],
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
    isDiscounted: searchParams.get('isDiscounted') === 'true',
    page: Number(searchParams.get('page')) || 1,
    limit: 9,
    sortBy: searchParams.get('sortBy') || 'latest'
  })

  useEffect(() => {
    const parsedFilters = {
      search: searchParams.get('search') || '',
      categories: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
      stores: searchParams.get('stores') ? searchParams.get('stores').split(',') : [],
      prices: searchParams.get('prices') ? searchParams.get('prices').split(',') : [],
      ratings: searchParams.get('ratings') ? searchParams.get('ratings').split(',').map(Number) : [],
      sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
      colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
      isDiscounted: searchParams.get('isDiscounted') === 'true',
      page: Number(searchParams.get('page')) || 1,
      limit: 9,
      sortBy: searchParams.get('sortBy') || 'latest'
    }

    setFilters(prevFilters => {
      if (JSON.stringify(prevFilters) !== JSON.stringify(parsedFilters)) {
        return parsedFilters
      }
      return prevFilters
    })
  }, [location.search])

  // ĐỒNG BỘ STATE LÊN URL
  useEffect(() => {
    // Nếu đang tìm kiếm bằng hình ảnh AI, ta giữ nguyên url hoặc bỏ đồng bộ để tránh bị reset
    if (location.state?.aiProducts) return

    const urlParams = {}

    if (filters.search) urlParams.search = filters.search
    if (filters.categories.length > 0) urlParams.categories = filters.categories.join(',')
    if (filters.stores.length > 0) urlParams.stores = filters.stores.join(',')
    if (filters.prices.length > 0) urlParams.prices = filters.prices.join(',')
    if (filters.ratings.length > 0) urlParams.ratings = filters.ratings.join(',')
    if (filters.sizes.length > 0) urlParams.sizes = filters.sizes.join(',')
    if (filters.colors.length > 0) urlParams.colors = filters.colors.join(',')
    if (filters.isDiscounted) urlParams.isDiscounted = 'true'

    if (filters.page > 1) urlParams.page = filters.page
    if (filters.sortBy !== 'latest') urlParams.sortBy = filters.sortBy

    setSearchParams(urlParams)
  }, [filters, setSearchParams, location.state])

  // GỌI API
  useEffect(() => {
    if (location.state?.aiProducts) {
      setProducts(location.state.aiProducts)
      setPagination({
        totalItems: location.state.aiProducts.length,
        totalPages: 1,
        currentPage: 1
      })
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)

        const params = {
          ...filters,
          categories: filters.categories.join(','),
          stores: filters.stores.join(','),
          ratings: filters.ratings.join(','),
          sizes: filters.sizes.join(','),
          colors: filters.colors.join(','),
          prices: filters.prices.join(',')
        }

        const response = await productService.searchAndFilterProducts(params)
        setProducts(response.products)
        setPagination(response.pagination)
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters, location.state])

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage })
  }

  const handleRemoveArrayFilter = (field, value) => {
    setFilters({ ...filters, [field]: filters[field].filter(item => item !== value), page: 1 })
  }

  const handleClearAllFilters = () => {
    if (location.state?.aiProducts) {
      navigate('/products', { replace: true, state: null })
    }
    setFilters({
      search: '', categories: [], stores: [], prices: [],
      ratings: [], sizes: [], colors: [], isDiscounted: false, page: 1, limit: 9, sortBy: 'latest'
    })
  }

  const hasActiveFilters = filters.search || filters.categories.length > 0 ||
                           filters.sizes.length > 0 ||
                           filters.colors.length > 0 || filters.ratings.length > 0 ||
                           filters.prices.length > 0 || filters.isDiscounted

  const priceLabels = {
    '0-1000000': 'Dưới 1.000.000đ', '1000000-3000000': '1tr - 3tr',
    '3000000-5000000': '3tr - 5tr', '5000000-max': 'Trên 5.000.000đ'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  }

  return (
    <div className="pb-10 bg-brand-bg min-h-screen flex flex-col">
      <main className="app-container py-8 flex-1">
        <BreadCrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Tất cả sản phẩm', link: '/products' }]} />

        <div className="flex flex-col lg:flex-row gap-8 mt-4">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full lg:w-1/4 shrink-0"
          >
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </motion.div>

          {/* Cột phải: Content chính */}
          <div className="flex-1 flex flex-col">
            
            {/* AI Search Banner */}
            {location.state?.aiProducts && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-orange-50/50 border border-orange-200/60 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-orange-500 overflow-hidden shadow-inner shrink-0">
                    {location.state.uploadedImage ? (
                      <img src={location.state.uploadedImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiZap size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      Tìm kiếm bằng hình ảnh AI
                      <FiZap size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Đang hiển thị {location.state.aiProducts.length} sản phẩm phù hợp nhất với hình ảnh bạn tải lên.
                    </p>
                    {location.state.keywords && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {location.state.keywords.map(kw => (
                          <span key={kw} className="text-[10px] bg-orange-100/50 text-orange-700 font-bold px-2 py-0.5 rounded-md capitalize">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/products', { replace: true, state: null })
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-200 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <FiX size={14} />
                  <span>Xóa tìm kiếm AI</span>
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div className="text-gray-600 font-medium mb-3 sm:mb-0 flex items-center">
                  <span className="font-extrabold text-brand-secondary text-xl mr-2">{pagination.totalItems}</span>
                  Sản phẩm tìm thấy
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">Sắp xếp theo:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 bg-gray-50 cursor-pointer transition-all hover:border-brand-primary"
                  >
                    <option value="latest">Mới nhất</option>
                    <option value="sold_desc">Bán chạy nhất</option>
                    <option value="views_desc">Xem nhiều nhất</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao xuống Thấp</option>
                    <option value="rating_desc">Đánh giá cao nhất</option>
                    <option value="name_asc">Tên: A - Z</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm overflow-hidden"
                >
                  <span className="text-gray-500 mr-2 font-medium">Đang lọc:</span>

                  <AnimatePresence>
                    {filters.search && (
                      <motion.span
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-blue-200"
                      >
          Tìm kiếm: {filters.search}
                        <FiX
                          className="cursor-pointer hover:text-blue-800 hover:scale-125 transition-transform"
                          onClick={() => {
                            setFilters({ ...filters, search: '', page: 1 })
                          }}
                        />
                      </motion.span>
                    )}
                    {filters.categories.map(cat => (
                      <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={cat} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                        Danh mục: {cat} <FiX className="cursor-pointer hover:text-red-600 hover:scale-125 transition-transform" onClick={() => handleRemoveArrayFilter('categories', cat)} />
                      </motion.span>
                    ))}

                    {filters.prices.map(price => (
                      <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={price} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                        Giá: {priceLabels[price]} <FiX className="cursor-pointer hover:text-red-600 hover:scale-125 transition-transform" onClick={() => handleRemoveArrayFilter('prices', price)} />
                      </motion.span>
                    ))}

                    {filters.sizes.map(size => (
                      <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={size} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                        Size {size} <FiX className="cursor-pointer hover:text-red-600 hover:scale-125 transition-transform" onClick={() => handleRemoveArrayFilter('sizes', size)} />
                      </motion.span>
                    ))}

                    {filters.colors.map(color => (
                      <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={color} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold capitalize">
                        Màu {color} <FiX className="cursor-pointer hover:text-red-600 hover:scale-125 transition-transform" onClick={() => handleRemoveArrayFilter('colors', color)} />
                      </motion.span>
                    ))}

                    {filters.ratings.map(rating => (
                      <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={rating} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                        Từ {rating} sao <FiX className="cursor-pointer hover:text-red-600 hover:scale-125 transition-transform" onClick={() => handleRemoveArrayFilter('ratings', rating)} />
                      </motion.span>
                    ))}

                    {filters.isDiscounted && (
                      <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                        Đang giảm giá<FiX className="cursor-pointer hover:text-red-600 hover:scale-125 transition-transform" onClick={() => setFilters({ ...filters, isDiscounted: false, page: 1 })} />
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleClearAllFilters}
                    className="cursor-pointer text-gray-500 hover:text-brand-primary underline ml-2 font-bold transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </motion.div>
              )}
            </motion.div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className="flex justify-center items-center h-64"
                  >
                    <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                ) : products.length > 0 ? (
                  <motion.div
                    key={`grid-${filters.page}-${JSON.stringify(filters)}`} // Re-trigger khi trang/bộ lọc đổi
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map(product => (
                        <motion.div key={product.id} variants={cardVariants}>
                          <ProductCard product={product} sortBy={filters.sortBy} />
                        </motion.div>
                      ))}
                    </div>

                    {pagination.totalPages > 1 && (
                      <motion.div variants={cardVariants} className="mt-10 flex justify-center">
                        <Pagination
                          currentPage={pagination.currentPage}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-3xl p-16 text-center text-gray-500 shadow-sm border border-gray-100 flex flex-col items-center justify-center mt-4"
                  >
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Không tìm thấy sản phẩm!</h3>
                    <p className="text-gray-500 font-medium max-w-md">Chúng tôi không tìm thấy kết quả nào phù hợp. Bạn hãy thử bỏ bớt một vài bộ lọc hoặc tìm kiếm bằng từ khóa khác xem sao nhé.</p>
                    <button
                      onClick={handleClearAllFilters}
                      className="cursor-pointer mt-8 px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-all active:scale-95 shadow-md shadow-brand-primary/20"
                    >
                      Xóa bộ lọc ngay
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}