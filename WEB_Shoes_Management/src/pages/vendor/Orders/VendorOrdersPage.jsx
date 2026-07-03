import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingBag } from 'react-icons/fi'

import { vendorOrderApiService } from '~/services/vendor/vendorOrderApiService'
import { OrderOverviewWidgets } from './OrderOverviewWidgets'
import { OrderFilters } from './OrderFilters'
import { OrderTable } from './OrderTable'
import { OrderBulkActionPanel } from './OrderBulkActionPanel'
import { OrderSearchResultsInfo } from './OrderSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorOrdersPage = () => {
  usePageTitle(
    'Quản lý đơn hàng',
    'Theo dõi và xử lý đơn hàng từ khách hàng của cửa hàng'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const status = searchParams.get('status') || null
  const searchOrderId = searchParams.get('searchOrderId') || null
  const paymentMethod = searchParams.get('paymentMethod') || null
  const startDate = searchParams.get('startDate') || null
  const endDate = searchParams.get('endDate') || null

  const activeFilters = { page, limit, status, searchOrderId, paymentMethod, startDate, endDate }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await vendorOrderApiService.getVendorOrders(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    setSelectedIds([])
  }, [searchParams])

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

  const handleResetFilters = () => setSearchParams({})

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const handleSelectAll = (isChecked) => {
    setSelectedIds(isChecked && data?.orders ? data.orders.map(o => o.id) : [])
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await vendorOrderApiService.updateOrderStatus(id, newStatus)
      toast.success(res.message)
      fetchOrders()
      setSelectedIds([])
    } catch (error) {
      toast.error(error.message || 'Cập nhật trạng thái thất bại.')
    }
  }

  const handleCancelRequest = async (id, decision, reason) => {
    try {
      const res = await vendorOrderApiService.handleCancelRequest(id, decision, reason)
      toast.success(res.message)
      fetchOrders()
      setSelectedIds([])
    } catch (error) {
      toast.error(error.message || 'Xử lý yêu cầu hủy thất bại.')
    }
  }

  const handleBulkUpdate = async (targetStatus) => {
    if (selectedIds.length === 0) {
      toast.warning('Vui lòng chọn đơn hàng cần xử lý.')
      return
    }
    try {
      const res = await vendorOrderApiService.updateOrderStatusBulk(selectedIds, targetStatus)
      toast.success(res.message)
      setSelectedIds([])
      fetchOrders()
    } catch (error) {
      toast.error(error.message || 'Cập nhật hàng loạt thất bại.')
    }
  }

  // Lấy số lượng bộ lọc đang active
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchOrderId) count++
    if (status) count++
    if (paymentMethod) count++
    if (startDate) count++
    if (endDate) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <FiShoppingBag className="text-brand-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý đơn hàng</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Theo dõi và xử lý đơn hàng từ khách hàng</p>
        </div>
      </div>

      {data?.overview && <OrderOverviewWidgets overview={data.overview} />}

      <OrderFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Kết quả tìm kiếm và lọc */}
      {!loading && data && (
        <OrderSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <OrderBulkActionPanel
            selectedCount={selectedIds.length}
            onBulkAction={handleBulkUpdate}
            onClearSelection={() => setSelectedIds([])}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đơn hàng...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <OrderTable
              orders={data.orders}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onUpdateStatus={handleUpdateStatus}
              onCancelRequest={handleCancelRequest}
              onUpdateStatusBulk={handleBulkUpdate}
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