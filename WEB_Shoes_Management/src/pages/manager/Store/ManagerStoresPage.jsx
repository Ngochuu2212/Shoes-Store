import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHome } from 'react-icons/fi'

import { managerStoreApiService } from '~/services/manager/managerStoreApiService'
import { StoreOverviewWidgets } from './StoreOverviewWidgets'
import { StoreFilters } from './StoreFilters'
import { StoreTable } from './StoreTable'
import { StoreBulkActionPanel } from './StoreBulkActionPanel'
import { StoreSearchResultsInfo } from './StoreSearchResultsInfo'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerStoresPage = () => {
  usePageTitle(
    'Quản lý Cửa hàng',
    'Phê duyệt và quản lý các cửa hàng trên sàn'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedStores, setSelectedStores] = useState([])

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
  const is_active = searchParams.get('is_active') !== null ? Number(searchParams.get('is_active')) : null
  const startDate = searchParams.get('startDate') || null
  const endDate = searchParams.get('endDate') || null

  const activeFilters = { page, limit, search, is_active, startDate, endDate }

  const fetchStores = async () => {
    try {
      setLoading(true)
      const res = await managerStoreApiService.getStores(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu cửa hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
    setSelectedIds([])
    setSelectedStores([])
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
    const store = data?.stores?.find(s => s.id === id)
    if (store) {
      setSelectedStores(prev => prev.includes(store) ? prev.filter(s => s.id !== id) : [...prev, store])
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked && data?.stores) {
      setSelectedIds(data.stores.map(s => s.id))
      setSelectedStores([...data.stores])
    } else {
      setSelectedIds([])
      setSelectedStores([])
    }
  }

  const handleApprove = async (storeId) => {
    try {
      const res = await managerStoreApiService.approveStoreSingle(storeId)
      toast.success(res.message)
      fetchStores()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleReject = (storeId) => {
    setModalConfig({
      isOpen: true,
      type: 'reject',
      storeId,
      title: 'Từ chối cửa hàng',
      message: 'Vui lòng nhập lý do từ chối đăng ký cửa hàng. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do từ chối...'
    })
  }

  const handleBan = (storeId) => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      storeId,
      title: 'Khóa cửa hàng',
      message: 'Vui lòng nhập lý do khóa cửa hàng. Lý do này sẽ được gửi đến chủ shop qua email.',
      placeholder: 'Nhập lý do khóa...'
    })
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'approve') {
      try {
        const res = await managerStoreApiService.approveStoresBulk(selectedIds)
        toast.success(res.message)
        setSelectedIds([])
        setSelectedStores([])
        fetchStores()
      } catch (error) {
        toast.error(error.message)
      }
    } else if (actionType === 'reject') {
      setModalConfig({
        isOpen: true,
        type: 'reject_bulk',
        title: 'Từ chối hàng loạt',
        message: `Vui lòng nhập lý do từ chối ${selectedIds.length} cửa hàng. Lý do này sẽ được gửi đến từng chủ shop.`,
        placeholder: 'Nhập lý do từ chối...'
      })
    } else if (actionType === 'ban') {
      setModalConfig({
        isOpen: true,
        type: 'ban_bulk',
        title: 'Khóa hàng loạt cửa hàng',
        message: `Vui lòng nhập lý do khóa ${selectedIds.length} cửa hàng. Lý do này sẽ được gửi đến từng chủ shop.`,
        placeholder: 'Nhập lý do khóa...'
      })
    }
  }

  const handleModalConfirm = async (reason) => {
    setIsLoading(true)
    try {
      if (modalConfig.type === 'reject') {
        const res = await managerStoreApiService.rejectStoreSingle(modalConfig.storeId, reason)
        toast.success(res.message)
      } else if (modalConfig.type === 'ban') {
        const res = await managerStoreApiService.banStoreSingle(modalConfig.storeId, reason)
        toast.success(res.message)
      } else if (modalConfig.type === 'reject_bulk') {
        const res = await managerStoreApiService.rejectStoresBulk(selectedIds, reason)
        toast.success(res.message)
        setSelectedIds([])
        setSelectedStores([])
      } else if (modalConfig.type === 'ban_bulk') {
        const res = await managerStoreApiService.banStoresBulk(selectedIds, reason)
        toast.success(res.message)
        setSelectedIds([])
        setSelectedStores([])
      }
      fetchStores()
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
    if (is_active !== null) count++
    if (startDate) count++
    if (endDate) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <FiHome className="text-blue-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Cửa hàng</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Phê duyệt và quản lý các cửa hàng trên sàn</p>
        </div>
      </div>

      {data?.overview && <StoreOverviewWidgets overview={data.overview} />}

      <StoreFilters filters={activeFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {!loading && data && (
        <StoreSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <StoreBulkActionPanel
            selectedCount={selectedIds.length}
            selectedStores={selectedStores}
            onBulkAction={handleBulkAction}
            onClearSelection={() => {
              setSelectedIds([])
              setSelectedStores([])
            }}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu cửa hàng...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <StoreTable
              stores={data.stores}
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