import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiDollarSign, FiPlus, FiDownload } from 'react-icons/fi'

import { vendorPayoutApiService } from '~/services/vendor/vendorPayoutApiService'
import { PayoutOverviewWidgets } from './PayoutOverviewWidgets'
import { PayoutModal } from './PayoutModal'
import { PayoutHistoryTable } from './PayoutHistoryTable'
import { Pagination } from '~/components/common/Pagination'
import { PAYOUT_STATUS } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorPayoutPage = () => {
  usePageTitle(
    'Tài chính & Rút tiền',
    'Quản lý số dư và yêu cầu rút tiền về tài khoản ngân hàng'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await vendorPayoutApiService.getPayoutHistory({ page, limit })
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi tải lịch sử rút tiền.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, limit])

  const handleCreatePayout = async (formData) => {
    try {
      setSubmitting(true)
      const res = await vendorPayoutApiService.createPayoutRequest({
        amount: Number(formData.amount),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName
      })
      toast.success(res.message)
      // Refresh lại trang
      await fetchHistory()
      // Reset phân trang về trang đầu
      setSearchParams({ page: '1', limit: String(limit) })
    } catch (error) {
      toast.error(error.message || 'Gửi yêu cầu thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      const blob = await vendorPayoutApiService.exportPayoutHistory()

      // Tạo link tải file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      link.setAttribute('download', `LichSuRutTien_${dateStr}.xlsx`)
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

  // Tính thống kê theo status
  const getStats = () => {
    if (!data?.history) {
      return { pending: 0, approved: 0, rejected: 0 }
    }
    const stats = data.history.reduce(
      (acc, item) => {
        if (item.status === PAYOUT_STATUS.PENDING) acc.pending++
        else if (item.status === PAYOUT_STATUS.APPROVED) acc.approved++
        else if (item.status === PAYOUT_STATUS.REJECTED) acc.rejected++
        return acc
      },
      { pending: 0, approved: 0, rejected: 0 }
    )
    return stats
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
            <FiDollarSign className="text-brand-primary" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Tài chính & Rút tiền</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý số dư và yêu cầu rút tiền về tài khoản ngân hàng</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting || !data || data.history?.length === 0}
            className="inline-flex items-center gap-2 bg-white border border-brand-primary/30 text-brand-primary font-bold text-sm px-5 py-3 rounded-xl shadow-sm hover:bg-brand-primary/5 hover:border-brand-primary hover:text-brand-primary hover:shadow-md transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <span className="animate-spin border-2 border-brand-primary border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <FiDownload size={16} />
            )}
            Xuất Excel
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!data || data.currentBalance < 50000}
            className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-brand-primary/20 hover:bg-[#c73652] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} /> Tạo yêu cầu rút tiền
          </button>
        </div>
      </div>

      {/* Widget thống kê */}
      {data && (
        <PayoutOverviewWidgets
          balance={data.currentBalance || 0}
          stats={getStats()}
        />
      )}

      {/* Lịch sử rút tiền - Full width */}
      <div className="w-full">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-gray-400 animate-pulse">Đang tải lịch sử rút tiền...</span>
          </div>
        ) : (
          data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <PayoutHistoryTable history={data.history} />

              {data.pagination.totalPages > 1 && (
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(p) => {
                    setSearchParams({ page: String(p), limit: String(limit) })
                  }}
                />
              )}
            </motion.div>
          )
        )}
      </div>

      {/* Modal */}
      <PayoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBalance={data?.currentBalance || 0}
        onSubmit={handleCreatePayout}
        isLoading={submitting}
      />
    </div>
  )
}