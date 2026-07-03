import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPackage } from 'react-icons/fi'

import { managerProductApiService } from '~/services/manager/managerProductApiService'
import { managerStoreApiService } from '~/services/manager/managerStoreApiService'
import { categoryService } from '~/services/user/categoryService'
import { ProductOverviewWidgets } from './ProductOverviewWidgets'
import { ProductFilters } from './ProductFilters'
import { ProductTable } from './ProductTable'
import { ProductBulkActionPanel } from './ProductBulkActionPanel'
import { ProductSearchResultsInfo } from './ProductSearchResultsInfo'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerProductsPage = () => {
  usePageTitle(
    'Quản lý Sản phẩm',
    'Kiểm duyệt và quản lý sản phẩm trên toàn sàn'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [stores, setStores] = useState([])

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const categoryId = searchParams.get('categoryId') || null
  const storeId = searchParams.get('storeId') || null
  const status = searchParams.get('status') || null
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'DESC'

  const activeFilters = { page, limit, search, categoryId, storeId, status, sortBy, sortOrder }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await managerProductApiService.getProducts(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch danh sách categories và stores cho bộ lọc
  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, storesRes] = await Promise.all([
        categoryService.getAllCategories(),
        managerStoreApiService.getStores({ limit: 100 })
      ])

      // categoriesRes là mảng categories đã được build tree (có children)
      if (Array.isArray(categoriesRes)) {
      // Làm phẳng tree để hiển thị trong dropdown (hoặc giữ nguyên nếu muốn hiển thị phân cấp)
        const flattenCategories = (items, result = []) => {
          items.forEach(item => {
            result.push({ id: item.id, name: item.name, parent_id: item.parent_id })
            if (item.children && item.children.length) {
              flattenCategories(item.children, result)
            }
          })
          return result
        }
        setCategories(flattenCategories(categoriesRes))
      } else {
        setCategories([])
      }

      // storesRes có cấu trúc: { overview, pagination, stores }
      if (storesRes?.stores && Array.isArray(storesRes.stores)) {
        setStores(storesRes.stores)
      } else {
        setStores([])
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu bộ lọc:', error)
      toast.error('Không thể tải dữ liệu bộ lọc')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchFiltersData()
    setSelectedIds([])
    setSelectedProducts([])
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
    const product = data?.products?.find(p => p.id === id)
    if (product) {
      setSelectedProducts(prev => prev.includes(product) ? prev.filter(p => p.id !== id) : [...prev, product])
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked && data?.products) {
      setSelectedIds(data.products.map(p => p.id))
      setSelectedProducts([...data.products])
    } else {
      setSelectedIds([])
      setSelectedProducts([])
    }
  }

  const handleApprove = async (productId) => {
    try {
      const res = await managerProductApiService.updateProductStatus(productId, 'approved')
      toast.success(res.message)
      fetchProducts()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleReject = (productId) => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      productId,
      title: 'Từ chối sản phẩm',
      message: 'Vui lòng nhập lý do từ chối sản phẩm. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do từ chối...'
    })
  }

  const handleBan = (productId) => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      productId,
      title: 'Khóa sản phẩm',
      message: 'Vui lòng nhập lý do khóa sản phẩm. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do khóa...'
    })
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'approve') {
      try {
        const res = await managerProductApiService.updateProductsStatusBulk(selectedIds, 'approved')
        toast.success(res.message)
        setSelectedIds([])
        setSelectedProducts([])
        fetchProducts()
      } catch (error) {
        toast.error(error.message)
      }
    } else if (actionType === 'reject') {
      setModalConfig({
        isOpen: true,
        type: 'reject_bulk',
        title: 'Từ chối hàng loạt',
        message: `Vui lòng nhập lý do từ chối ${selectedIds.length} sản phẩm. Lý do này sẽ được gửi đến từng chủ shop.`,
        placeholder: 'Nhập lý do từ chối...'
      })
    } else if (actionType === 'ban') {
      setModalConfig({
        isOpen: true,
        type: 'ban_bulk',
        title: 'Khóa hàng loạt sản phẩm',
        message: `Vui lòng nhập lý do khóa ${selectedIds.length} sản phẩm. Lý do này sẽ được gửi đến từng chủ shop.`,
        placeholder: 'Nhập lý do khóa...'
      })
    }
  }

  const handleModalConfirm = async (reason) => {
    setIsLoading(true)
    try {
      if (modalConfig.type === 'reject') {
        const res = await managerProductApiService.updateProductStatus(modalConfig.productId, 'rejected', reason)
        toast.success(res.message)
      } else if (modalConfig.type === 'ban') {
        const res = await managerProductApiService.updateProductStatus(modalConfig.productId, 'banned', reason)
        toast.success(res.message)
      } else if (modalConfig.type === 'reject_bulk') {
        const res = await managerProductApiService.updateProductsStatusBulk(selectedIds, 'rejected', reason)
        toast.success(res.message)
        setSelectedIds([])
        setSelectedProducts([])
      } else if (modalConfig.type === 'ban_bulk') {
        const res = await managerProductApiService.updateProductsStatusBulk(selectedIds, 'banned', reason)
        toast.success(res.message)
        setSelectedIds([])
        setSelectedProducts([])
      }
      fetchProducts()
      setModalConfig({ isOpen: false, type: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (categoryId) count++
    if (storeId) count++
    if (status) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <FiPackage className="text-indigo-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Sản phẩm</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Kiểm duyệt và quản lý sản phẩm trên toàn sàn</p>
        </div>
      </div>

      {data?.overview && <ProductOverviewWidgets overview={data.overview} />}

      <ProductFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        categories={categories}
        stores={stores}
      />

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
          <ProductBulkActionPanel
            selectedCount={selectedIds.length}
            selectedProducts={selectedProducts}
            onBulkAction={handleBulkAction}
            onClearSelection={() => {
              setSelectedIds([])
              setSelectedProducts([])
            }}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu sản phẩm...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ProductTable
              products={data.products}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onApprove={handleApprove}
              onReject={handleReject}
              onBan={handleBan}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      <ConfirmReasonModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
      />
    </div>
  )
}