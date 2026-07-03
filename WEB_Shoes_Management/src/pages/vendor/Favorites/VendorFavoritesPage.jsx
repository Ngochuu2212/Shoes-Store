import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'

import { vendorFavoriteApiService } from '~/services/vendor/vendorFavoriteApiService'
import { FavoriteOverviewWidgets } from './FavoriteOverviewWidgets'
import { FavoriteTable } from './FavoriteTable'
import { FavoriteUsersModal } from './FavoriteUsersModal'
import { FavoriteFilters } from './FavoriteFilters'
import { FavoriteSearchResultsInfo } from './FavoriteSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorFavoritesPage = () => {
  usePageTitle(
    'Sản phẩm yêu thích',
    'Phân tích xu hướng và sự quan tâm của khách hàng đối với sản phẩm'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState({ id: null, name: '' })

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
  const isActive = searchParams.get('isActive') !== null && searchParams.get('isActive') !== ''
    ? Number(searchParams.get('isActive'))
    : null
  const minFavorites = searchParams.get('minFavorites') ? Number(searchParams.get('minFavorites')) : null
  const maxFavorites = searchParams.get('maxFavorites') ? Number(searchParams.get('maxFavorites')) : null

  const activeFilters = { page, limit, search, categoryId, isActive, minFavorites, maxFavorites }

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await vendorFavoriteApiService.getFavoriteAnalytics(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu thống kê yêu thích.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [searchParams])

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === null || value === undefined || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    if (key !== 'page') newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleApplyFavoritesRange = (min, max) => {
    const newParams = new URLSearchParams(searchParams)
    if (min) newParams.set('minFavorites', String(min))
    else newParams.delete('minFavorites')
    if (max) newParams.set('maxFavorites', String(max))
    else newParams.delete('maxFavorites')
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleResetFilters = () => setSearchParams({})

  const handleOpenUsersModal = (productId, productName) => {
    setSelectedProduct({ id: productId, name: productName })
    setModalOpen(true)
  }

  // Lấy số lượng bộ lọc đang active
  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (categoryId) count++
    if (isActive !== null) count++
    if (minFavorites !== null) count++
    if (maxFavorites !== null) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
          <FiHeart className="text-rose-500 fill-current opacity-80" size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sản phẩm Yêu thích</h2>
          <p className="text-xs text-gray-400 font-bold mt-0.5">Phân tích xu hướng và sự quan tâm của khách hàng (Wishlist)</p>
        </div>
      </div>

      {data?.overview && <FavoriteOverviewWidgets overview={data.overview} />}

      <FavoriteFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onApplyFavoritesRange={handleApplyFavoritesRange}
        onReset={handleResetFilters}
      />

      {/* Kết quả tìm kiếm và lọc */}
      {!loading && data && (
        <FavoriteSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp phân tích dữ liệu...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <FavoriteTable
              products={data.products}
              onViewUsers={handleOpenUsersModal}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      <FavoriteUsersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={selectedProduct.id}
        productName={selectedProduct.name}
      />

    </div>
  )
}