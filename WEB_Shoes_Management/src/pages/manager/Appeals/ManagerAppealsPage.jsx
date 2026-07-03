import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiAlertCircle } from 'react-icons/fi'

import { managerAppealApiService } from '~/services/manager/managerAppealApiService'
import { AppealOverviewWidgets } from './AppealOverviewWidgets'
import { AppealFilters } from './AppealFilters'
import { AppealTable } from './AppealTable'
import { AppealSearchResultsInfo } from './AppealSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { APPEAL_STATUS } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerAppealsPage = () => {
  usePageTitle(
    'Cứu xét cửa hàng',
    'Quản lý đơn khiếu nại xin khôi phục cửa hàng'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedAppeals, setSelectedAppeals] = useState([])

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    appealId: null,
    title: '',
    message: '',
    placeholder: '',
    required: true
  })
  const [isLoading, setIsLoading] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const status = searchParams.get('status') || null
  const search = searchParams.get('search') || null
  const startDate = searchParams.get('startDate') || null
  const endDate = searchParams.get('endDate') || null

  const activeFilters = { page, limit, status, search, startDate, endDate }

  const fetchAppeals = async () => {
    try {
      setLoading(true)
      const res = await managerAppealApiService.getAppeals(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu đơn cứu xét.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppeals()
    setSelectedIds([])
    setSelectedAppeals([])
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
    const appeal = data?.appeals?.find(a => a.id === id)
    if (appeal) {
      setSelectedAppeals(prev => prev.includes(appeal) ? prev.filter(a => a.id !== id) : [...prev, appeal])
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked && data?.appeals) {
      setSelectedIds(data.appeals.map(a => a.id))
      setSelectedAppeals([...data.appeals])
    } else {
      setSelectedIds([])
      setSelectedAppeals([])
    }
  }

  const handleApprove = (appealId) => {
    setModalConfig({
      isOpen: true,
      type: 'approve',
      appealId: appealId,
      title: 'Phê duyệt đơn cứu xét',
      message: 'Bạn có thể nhập ghi chú cho chủ shop (không bắt buộc).',
      placeholder: 'Nhập ghi chú phê duyệt (không bắt buộc)...',
      required: false
    })
  }

  const handleReject = (appealId) => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      appealId: appealId,
      title: 'Từ chối đơn cứu xét',
      message: 'Vui lòng nhập lý do từ chối đơn cứu xét. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do từ chối (bắt buộc)...',
      required: true
    })
  }

  const handleModalConfirm = async (reason) => {
    if (modalConfig.type === 'reject' && (!reason || reason.trim() === '')) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }

    const finalReason = reason?.trim() || ''

    setIsLoading(true)
    try {
      const status = modalConfig.type === 'approve' ? APPEAL_STATUS.APPROVED : APPEAL_STATUS.REJECTED
      const res = await managerAppealApiService.processAppeal(
        modalConfig.appealId,
        status,
        finalReason
      )
      toast.success(res.message)
      fetchAppeals()
      setModalConfig({
        isOpen: false,
        type: null,
        appealId: null,
        title: '',
        message: '',
        placeholder: '',
        required: true
      })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (status) count++
    if (startDate) count++
    if (endDate) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
          <FiAlertCircle className="text-red-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Cứu xét cửa hàng</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý đơn khiếu nại xin khôi phục cửa hàng</p>
        </div>
      </div>

      {data?.overview && <AppealOverviewWidgets overview={data.overview} />}

      <AppealFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {!loading && data && (
        <AppealSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đơn cứu xét...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AppealTable
              appeals={data.appeals}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onApprove={handleApprove}
              onReject={handleReject}
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
        onClose={() => setModalConfig({
          isOpen: false,
          type: null,
          appealId: null,
          title: '',
          message: '',
          placeholder: '',
          required: true
        })}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
        type={modalConfig.type || 'reject'}
        required={modalConfig.required}
      />
    </div>
  )
}