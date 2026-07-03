import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vendorProductApiService } from '~/services/vendor/vendorProductApiService'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiBox } from 'react-icons/fi'

import { ProductOverviewWidgets } from './ProductOverviewWidgets'
import { ProductFilters } from './ProductFilters'
import { ProductTable } from './ProductTable'
import { BulkActionPanel } from './BulkActionPanel'
import { ProductSearchResultsInfo } from './ProductSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { Link } from 'react-router-dom'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorProductsPage = () => {
  usePageTitle(
    'Kho hàng của bạn',
    'Quản lý toàn bộ danh sách và biến thể tồn kho giày dép'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
  const isActive = searchParams.get('isActive') !== null ? (searchParams.get('isActive') === '1' ? 1 : 0) : null
  const sortBy = searchParams.get('sortBy') || 'ctime'

  const activeFilters = { page, limit, search, categoryId, isActive, sortBy }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await vendorProductApiService.getVendorProducts(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu kho giày.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    setSelectedIds([])
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

  const handleResetFilters = () => setSearchParams({})

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const handleSelectAll = (isChecked) => {
    setSelectedIds(isChecked && data?.products ? data.products.map(p => p.id) : [])
  }

  const handleToggleActiveSingle = async (id, isActive) => {
    try {
      const res = await vendorProductApiService.toggleActiveSingle(id, isActive)
      toast.success(res.message)
      fetchProducts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteSingleClick = (product) => {
    let parsedImages = []
    try { parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images } catch (e) { parsedImages = [] }

    setProductToDelete({ ...product, images: parsedImages })
    setIsSingleDeleteModalOpen(true)
  }

  const handleConfirmDeleteSingle = async () => {
    if (!productToDelete) return
    try {
      const res = await vendorProductApiService.deleteProductSingle(productToDelete.id)
      toast.success(res.message)
      setIsSingleDeleteModalOpen(false)
      setProductToDelete(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'delete') {
      setIsBulkDeleteModalOpen(true)
      return
    }

    try {
      let res = null
      if (actionType === 'show' || actionType === 'hide') {
        res = await vendorProductApiService.toggleActiveBulk(selectedIds, actionType === 'show')
      } else if (actionType === 'reapprove') {
        res = await vendorProductApiService.requestReapprovalBulk(selectedIds)
      }

      if (res) {
        toast.success(res.message)
        setSelectedIds([])
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleConfirmBulkDelete = async () => {
    try {
      const res = await vendorProductApiService.deleteProductsBulk(selectedIds)
      toast.success(res.message)
      setIsBulkDeleteModalOpen(false)
      setSelectedIds([])
      fetchProducts()
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Lấy số lượng bộ lọc đang active
  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (categoryId) count++
    if (isActive !== null) count++
    if (sortBy && sortBy !== 'ctime') count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
            <FiBox className="text-brand-primary" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Kho hàng của bạn</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý toàn bộ danh sách, biến thể tồn kho giày dép</p>
          </div>
        </div>
        <Link
          to="/vendor/products/add"
          className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-brand-primary/20 hover:bg-[#c73652] cursor-pointer transition-all duration-300 active:scale-95"
        >
          <FiPlus size={16} /> Thêm sản phẩm mới
        </Link>
      </div>

      {data?.overview && <ProductOverviewWidgets overview={data.overview} />}

      <ProductFilters filters={activeFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {/* Kết quả tìm kiếm và lọc */}
      {!loading && data && (
        <ProductSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <BulkActionPanel
            selectedCount={selectedIds.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu kho giày...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ProductTable
              products={data.products}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onToggleActive={handleToggleActiveSingle}
              onDelete={handleDeleteSingleClick}
            />

            <Pagination currentPage={data.pagination.currentPage} totalPages={data.pagination.totalPages} onPageChange={(p) => handleFilterChange('page', p)} />
          </motion.div>
        )
      )}

      <ConfirmDeleteModal
        isOpen={isSingleDeleteModalOpen}
        onClose={() => setIsSingleDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteSingle}
        title="Xác nhận xóa sản phẩm"
        message="Mặt hàng này sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể phục hồi. Bạn có chắc chắn muốn xóa không?"
        productInfo={productToDelete}
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Xóa hàng loạt sản phẩm"
        message={`Bạn đang chuẩn bị xóa vĩnh viễn ${selectedIds.length} sản phẩm khỏi hệ thống. Mọi biến thể (Size/Màu) và hình ảnh liên quan sẽ bị dọn dẹp. Hành động này KHÔNG THỂ phục hồi!`}
      />
    </div>
  )
}