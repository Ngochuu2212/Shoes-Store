import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFlag, FiPackage, FiHome } from 'react-icons/fi'

import { managerReviewApiService } from '~/services/manager/managerReviewApiService'
import { managerStoreApiService } from '~/services/manager/managerStoreApiService'
import { ReviewOverviewWidgets } from './ReviewOverviewWidgets'
import { ReviewFilters } from './ReviewFilters'
import { ReviewTable } from './ReviewTable'
import { ReviewBulkActionPanel } from './ReviewBulkActionPanel'
import { ReviewSearchResultsInfo } from './ReviewSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { REVIEW_TYPES } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerReviewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedReviews, setSelectedReviews] = useState([])
  const [stores, setStores] = useState([])

  // Lấy active tab từ URL hoặc mặc định là 'product'
  const activeTab = searchParams.get('type') || REVIEW_TYPES.PRODUCT

  const getTabLabel = () => {
    const tabMap = {
      [REVIEW_TYPES.PRODUCT]: 'Sản phẩm',
      [REVIEW_TYPES.STORE]: 'Cửa hàng'
    }
    return tabMap[activeTab] || 'Sản phẩm'
  }

  usePageTitle(
    `Quản lý khiếu nại đánh giá ${getTabLabel()}`,
    `Phân xử các đánh giá ${getTabLabel().toLowerCase()} bị tố cáo vi phạm`
  )

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const rating = searchParams.get('rating') || null
  const storeId = searchParams.get('storeId') || null
  const startDate = searchParams.get('startDate') || null
  const endDate = searchParams.get('endDate') || null
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'DESC'

  const activeFilters = { page, limit, type: activeTab, search, rating, storeId, startDate, endDate, sortBy, sortOrder }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await managerReviewApiService.getReportedReviews(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu đánh giá.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch danh sách stores cho bộ lọc
  const fetchStores = async () => {
    try {
      const res = await managerStoreApiService.getStores({ limit: 100 })
      if (res?.stores && Array.isArray(res.stores)) {
        setStores(res.stores)
      }
    } catch (error) {
      console.error('Lỗi tải danh sách cửa hàng:', error)
    }
  }

  // Fetch overview stats (widgets) - không phụ thuộc vào tab
  const [overview, setOverview] = useState(null)
  const fetchOverview = async () => {
    try {
      const res = await managerReviewApiService.getReportedReviews({ type: REVIEW_TYPES.PRODUCT, limit: 1 })
      setOverview(res?.overview)
    } catch (error) {
      console.error('Lỗi tải widgets:', error)
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchStores()
    fetchOverview()
    setSelectedIds([])
    setSelectedReviews([])
  }, [searchParams])

  // Xử lý chuyển tab
  const handleTabChange = (tabType) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('type', tabType)
    newParams.delete('page') // Reset về trang 1 khi đổi tab
    setSearchParams(newParams)
  }

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)

    // Xử lý đặc biệt cho dateRange
    if (key === 'dateRange') {
      if (value === null || value === undefined) {
      // Xóa cả 2 params
        newParams.delete('startDate')
        newParams.delete('endDate')
      } else {
      // Set cả 2 params
        newParams.set('startDate', value.startDate)
        newParams.set('endDate', value.endDate)
      }
    } else {
    // Xử lý các filter khác
      if (value === null || value === undefined || value === '') {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }
    }

    if (key !== 'page') newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleResetFilters = () => {
    const newParams = new URLSearchParams()
    newParams.set('type', activeTab) // Giữ lại tab hiện tại
    setSearchParams(newParams)
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
    const review = data?.reviews?.find(r => r.id === id)
    if (review) {
      setSelectedReviews(prev => prev.includes(review) ? prev.filter(r => r.id !== id) : [...prev, review])
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked && data?.reviews) {
      setSelectedIds(data.reviews.map(r => r.id))
      setSelectedReviews([...data.reviews])
    } else {
      setSelectedIds([])
      setSelectedReviews([])
    }
  }

  const handleResolveSingle = async (reviewId, action) => {
    try {
      const res = await managerReviewApiService.resolveReviewsBulk([reviewId], activeTab, action)
      toast.success(res.message)
      fetchReviews()
      fetchOverview()
      setSelectedIds([])
      setSelectedReviews([])
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleResolveBulk = async (action) => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn đánh giá cần xử lý')
      return
    }

    try {
      const res = await managerReviewApiService.resolveReviewsBulk(selectedIds, activeTab, action)
      toast.success(res.message)
      setSelectedIds([])
      setSelectedReviews([])
      fetchReviews()
      fetchOverview()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (rating) count++
    if (storeId) count++
    if (startDate) count++
    if (endDate) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  // Tab configuration
  const tabs = [
    { key: REVIEW_TYPES.PRODUCT, label: 'Đánh giá sản phẩm', icon: FiPackage, color: 'indigo' },
    { key: REVIEW_TYPES.STORE, label: 'Đánh giá cửa hàng', icon: FiHome, color: 'purple' }
  ]

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <FiFlag className="text-amber-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý khiếu nại đánh giá</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Phân xử các đánh giá bị tố cáo vi phạm</p>
        </div>
      </div>

      {/* Widgets - hiển thị luôn không phụ thuộc tab */}
      {overview && <ReviewOverviewWidgets overview={overview} />}

      {/* Tabs - chiếm hết chiều dài */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.key}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(tab.key)}
                className={`cursor-pointer flex items-center justify-center gap-3 py-4 text-base font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-primary/5 to-transparent text-brand-primary border-b-2 border-brand-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 border-b-2 border-transparent'
                }`}
              >
                <Icon size={20} />
                {tab.label}
                {isActive && data?.pagination && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 px-2 py-0.5 text-xs font-black rounded-full bg-brand-primary/10 text-brand-primary"
                  >
                    {data.pagination.totalItems || 0}
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      <ReviewFilters
        filters={{ ...activeFilters, type: activeTab }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        stores={stores}
      />

      {!loading && data && (
        <ReviewSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <ReviewBulkActionPanel
            selectedCount={selectedIds.length}
            onBulkAction={handleResolveBulk}
            onClearSelection={() => {
              setSelectedIds([])
              setSelectedReviews([])
            }}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đánh giá...</span>
        </div>
      ) : (
        data && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ReviewTable
              reviews={data.reviews}
              reviewType={activeTab}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onResolveSingle={handleResolveSingle}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}
    </div>
  )
}