import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiDollarSign, FiDownload } from 'react-icons/fi'

import { adminPayoutApiService } from '~/services/admin/adminPayoutApiService'
import { PayoutOverviewWidgets } from './PayoutOverviewWidgets'
import { PayoutFilters } from './PayoutFilters'
import { PayoutTable } from './PayoutTable'
import { PayoutSearchResultsInfo } from './PayoutSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { ProcessPayoutModal } from './ProcessPayoutModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminPayoutsPage = () => {
  usePageTitle(
    'Quản lý Rút tiền',
    'Quản lý các yêu cầu rút tiền từ cửa hàng'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // State cho modal xử lý
  const [processModal, setProcessModal] = useState({
    isOpen: false,
    payout: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const status = searchParams.get('status') || null
  const search = searchParams.get('search') || null

  const activeFilters = { page, limit, status, search }

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const res = await adminPayoutApiService.getPayouts(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu yêu cầu rút tiền.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [searchParams])

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      const blob = await adminPayoutApiService.exportPayouts({ status, search })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      link.setAttribute('download', `DanhSachRutTien_${dateStr}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Xuất file Excel thành công!')
    } catch (error) {
      toast.error(error.message || 'Xuất file thất bại.')
    } finally {
      setIsExporting(false)
    }
  }

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

  const handleSearch = (searchValue) => {
    handleFilterChange('search', searchValue || null)
  }

  // Xử lý mở modal xử lý
  const handleProcessPayout = (payout) => {
    setProcessModal({
      isOpen: true,
      payout: payout
    })
  }

  // Xử lý đóng modal
  const handleCloseProcessModal = () => {
    setProcessModal({
      isOpen: false,
      payout: null
    })
  }

  // Xử lý xác nhận
  const handleConfirmProcess = async (targetStatus, adminNote) => {
    setIsSubmitting(true)
    try {
      const res = await adminPayoutApiService.processPayout(
        processModal.payout.id,
        targetStatus,
        adminNote
      )
      toast.success(res.message)
      handleCloseProcessModal()
      fetchPayouts()
    } catch (error) {
      toast.error(error.message || 'Xử lý yêu cầu thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (status) count++
    if (search) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <FiDollarSign className="text-emerald-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Rút tiền</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý các yêu cầu rút tiền từ cửa hàng</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onClick={handleExportExcel}
          disabled={isExporting || !data || data.payouts?.length === 0}
          className="inline-flex items-center gap-2 bg-white border border-emerald-500/30 text-emerald-600 font-bold text-sm px-5 py-3 rounded-xl shadow-sm hover:bg-emerald-500/5 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-md transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isExporting ? (
            <span className="animate-spin border-2 border-emerald-500 border-t-transparent rounded-full w-4 h-4" />
          ) : (
            <FiDownload size={16} />
          )}
          Xuất Excel
        </motion.button>
      </div>

      {/* Overview Widgets */}
      {data?.payouts && (
        <PayoutOverviewWidgets payouts={data.payouts} />
      )}

      {/* Filters */}
      <PayoutFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onSearch={handleSearch}
      />

      {/* Search Results Info */}
      {!loading && data && (
        <PayoutSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
          searchQuery={search}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu yêu cầu rút tiền...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <PayoutTable
              payouts={data.payouts}
              onProcessPayout={handleProcessPayout}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      {/* Modal xử lý yêu cầu */}
      <ProcessPayoutModal
        isOpen={processModal.isOpen}
        onClose={handleCloseProcessModal}
        onConfirm={handleConfirmProcess}
        payout={processModal.payout}
        isLoading={isSubmitting}
      />
    </div>
  )
}