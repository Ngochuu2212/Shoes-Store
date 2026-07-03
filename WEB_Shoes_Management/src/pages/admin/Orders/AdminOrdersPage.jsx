import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiShoppingBag } from 'react-icons/fi'

import { adminOrderApiService } from '~/services/admin/adminOrderApiService'
import { OrderOverviewWidgets } from './OrderOverviewWidgets'
import { OrderFilters } from './OrderFilters'
import { OrderTable } from './OrderTable'
import { OrderSearchResultsInfo } from './OrderSearchResultsInfo'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminOrdersPage = () => {
  usePageTitle(
    'Quản lý Đơn hàng',
    'Quản lý toàn bộ đơn hàng trên sàn'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [forceCancelModal, setForceCancelModal] = useState({
    isOpen: false,
    orderId: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const status = searchParams.get('status') || null
  const paymentStatus = searchParams.get('paymentStatus') || null
  const searchOrderId = searchParams.get('searchOrderId') || null
  const startDate = searchParams.get('startDate') || null
  const endDate = searchParams.get('endDate') || null

  const activeFilters = { page, limit, status, paymentStatus, searchOrderId, startDate, endDate } // 🆕 Thêm paymentStatus

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await adminOrderApiService.getOrders(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
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

  const handleForceCancel = (orderId) => {
    setForceCancelModal({
      isOpen: true,
      orderId: orderId
    })
  }

  const handleConfirmForceCancel = async (reason) => {
    if (!reason || !reason.trim()) {
      toast.warning('Vui lòng nhập lý do ép hủy đơn hàng')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await adminOrderApiService.forceCancelOrder(forceCancelModal.orderId, reason)
      toast.success(res.message)
      setForceCancelModal({ isOpen: false, orderId: null })
      fetchOrders()
    } catch (error) {
      toast.error(error.message || 'Ép hủy đơn hàng thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (status) count++
    if (paymentStatus) count++
    if (searchOrderId) count++
    if (startDate) count++
    if (endDate) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <FiShoppingBag className="text-emerald-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Đơn hàng</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý toàn bộ đơn hàng trên sàn</p>
        </div>
      </motion.div>

      {/* Overview Widgets */}
      {data?.overviewStats && (
        <OrderOverviewWidgets overview={data.overviewStats} />
      )}

      {/* Filters */}
      <OrderFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Search Results Info */}
      {!loading && data && (
        <OrderSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đơn hàng...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <OrderTable
              orders={data.orders}
              onForceCancel={handleForceCancel}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      {/* Modal ép hủy đơn hàng */}
      <ConfirmReasonModal
        isOpen={forceCancelModal.isOpen}
        onClose={() => setForceCancelModal({ isOpen: false, orderId: null })}
        onConfirm={handleConfirmForceCancel}
        title="Ép hủy đơn hàng"
        message={`Bạn đang chuẩn bị ép hủy đơn hàng #${forceCancelModal.orderId}. Hành động này sẽ hoàn lại số lượng tồn kho và chuyển trạng thái thanh toán sang "Đã hoàn tiền". Vui lòng nhập lý do chi tiết.`}
        placeholder="Nhập lý do ép hủy đơn hàng (tối thiểu 10 ký tự)..."
        isLoading={isSubmitting}
        type="danger"
      />
    </div>
  )
}