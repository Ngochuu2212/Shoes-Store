import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare } from 'react-icons/fi'

import { vendorReviewApiService } from '~/services/vendor/vendorReviewApiService'
import { REVIEW_TYPES } from '~/utils/constant'
import { ReviewOverviewWidgets } from './ReviewOverviewWidgets'
import { ReviewFilters } from './ReviewFilters'
import { ReviewTable } from './ReviewTable'
import { ReviewBulkActionPanel } from './ReviewBulkActionPanel'
import { ReportModal } from './ReportModal'
import { RequestReopenModal } from './RequestReopenModal'
import { Pagination } from '~/components/common/Pagination'
import { SearchResultsInfo } from './SearchResultsInfo'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorReviewsPage = () => {
  usePageTitle(
    'Quản lý đánh giá',
    'Theo dõi và phản hồi đánh giá từ khách hàng'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [reviewType, setReviewType] = useState(REVIEW_TYPES.PRODUCT)

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : null
  const isActive = searchParams.get('isActive') !== null ? Number(searchParams.get('isActive')) : null
  const isReported = searchParams.get('isReported') !== null ? Number(searchParams.get('isReported')) : null

  const activeFilters = { page, limit, search, rating, isActive, isReported, type: reviewType }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await vendorReviewApiService.getVendorReviews(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu đánh giá.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    setSelectedIds([])
  }, [searchParams, reviewType])

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
    setSelectedIds(isChecked && data?.reviews ? data.reviews.map(r => r.id) : [])
  }

  const handleReport = (reviewIds, defaultReason = '') => {
    setSelectedIds(reviewIds)
    setIsReportModalOpen(true)
  }

  const handleConfirmReport = async (reason) => {
    if (!reason.trim()) {
      toast.warning('Vui lòng chọn lý do báo cáo')
      return
    }

    try {
      setModalLoading(true)
      const res = await vendorReviewApiService.reportReviewsBulk(selectedIds, reviewType, reason)
      toast.success(res.message)
      setIsReportModalOpen(false)
      setSelectedIds([])
      fetchReviews()
    } catch (error) {
      toast.error(error.message || 'Gửi báo cáo thất bại')
    } finally {
      setModalLoading(false)
    }
  }

  const handleReopen = (reviewIds) => {
    setSelectedIds(reviewIds)
    setIsReopenModalOpen(true)
  }

  const handleConfirmReopen = async (reason) => {
    try {
      setModalLoading(true)
      const res = await vendorReviewApiService.requestReopenBulk(selectedIds, reviewType, reason)
      toast.success(res.message)
      setIsReopenModalOpen(false)
      setSelectedIds([])
      fetchReviews()
    } catch (error) {
      toast.error(error.message || 'Gửi yêu cầu thất bại')
    } finally {
      setModalLoading(false)
    }
  }

  const handleViewDetail = (review) => {
    setSelectedReview(review)
    setIsDetailModalOpen(true)
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'report') {
      setIsReportModalOpen(true)
    } else if (actionType === 'reopen') {
      setIsReopenModalOpen(true)
    }
  }

  // Kiểm tra xem các item được chọn có thể báo cáo không (chưa báo cáo)
  const hasUnreportedItems = data?.reviews?.some(r => selectedIds.includes(r.id) && r.is_reported === 0) || false
  const hasInactiveItems = data?.reviews?.some(r => selectedIds.includes(r.id) && r.is_active === 0 && r.is_reported === 0) || false

  // Lấy số lượng bộ lọc đang active
  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (rating) count++
    if (isActive !== null) count++
    if (isReported !== null) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
            <FiMessageSquare className="text-brand-primary" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý đánh giá</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Theo dõi và phản hồi đánh giá từ khách hàng</p>
          </div>
        </div>
      </div>

      {data?.overview && (
        <ReviewOverviewWidgets
          overview={data.overview}
          reviewType={reviewType}
        />
      )}
      <ReviewFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        reviewType={reviewType}
        onReviewTypeChange={setReviewType}
      />

      {!loading && data && (
        <SearchResultsInfo
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
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
            hasUnreportedItems={hasUnreportedItems}
            hasInactiveItems={hasInactiveItems}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đánh giá...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ReviewTable
              reviews={data.reviews}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              reviewType={reviewType}
              onReport={handleReport}
              onReopen={handleReopen}
              onViewDetail={handleViewDetail}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      {/* Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirm={handleConfirmReport}
        reviewCount={selectedIds.length}
        isLoading={modalLoading}
      />

      <RequestReopenModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={handleConfirmReopen}
        reviewCount={selectedIds.length}
        isLoading={modalLoading}
      />
    </div>
  )
}