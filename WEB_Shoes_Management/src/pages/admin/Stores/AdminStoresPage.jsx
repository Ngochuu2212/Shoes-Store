import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHome, FiPlus } from 'react-icons/fi'

import { adminStoreApiService } from '~/services/admin/adminStoreApiService'
import { StoreOverviewWidgets } from './StoreOverviewWidgets'
import { StoreFilters } from './StoreFilters'
import { StoreTable } from './StoreTable'
import { StoreBulkActionPanel } from './StoreBulkActionPanel'
import { StoreSearchResultsInfo } from './StoreSearchResultsInfo'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminStoresPage = () => {
  usePageTitle(
    'Quản lý Cửa hàng',
    'Quản lý toàn bộ cửa hàng trên sàn'
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
    placeholder: '',
    storeId: null,
    isActive: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [commissionModal, setCommissionModal] = useState({
    isOpen: false,
    storeIds: [],
    commissionRate: 10
  })

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const isActive = searchParams.get('isActive') !== null ? Number(searchParams.get('isActive')) : null
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'DESC'

  const activeFilters = { page, limit, search, isActive, sortBy, sortOrder }

  const fetchStores = async () => {
    try {
      setLoading(true)
      const res = await adminStoreApiService.getStores(activeFilters)
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

  // Hàm mở modal khóa với lý do
  const handleToggleActiveWithReason = (storeId, isActive) => {
    if (isActive === false) {
      // Nếu là khóa (isActive = false), mở modal nhập lý do
      setModalConfig({
        isOpen: true,
        type: 'ban',
        title: 'Khóa cửa hàng',
        message: 'Vui lòng nhập lý do khóa cửa hàng. Lý do này sẽ được gửi đến chủ shop.',
        placeholder: 'Nhập lý do khóa...',
        storeId: storeId,
        isActive: false
      })
    } else {
      // Nếu là mở khóa (isActive = true), thực hiện luôn không cần lý do
      handleToggleActive(storeId, true)
    }
  }

  const handleToggleActive = async (storeId, isActive, reason = null) => {
    try {
      const res = await adminStoreApiService.toggleStoresActive([storeId], isActive, reason)
      toast.success(res.message)
      fetchStores()
      setModalConfig({ isOpen: false, type: null, storeId: null, isActive: null })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleActiveBulk = async (storeIds, isActive, reason = null) => {
    try {
      const res = await adminStoreApiService.toggleStoresActive(storeIds, isActive, reason)
      toast.success(res.message)
      setSelectedIds([])
      setSelectedStores([])
      fetchStores()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateCommission = async (storeIds, commissionRate) => {
    try {
      const res = await adminStoreApiService.updateStoresCommission(storeIds, commissionRate)
      toast.success(res.message)
      fetchStores()
      setCommissionModal({ isOpen: false, storeIds: [], commissionRate: 10 })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteSingle = (storeId) => {
    setSelectedIds([storeId])
    setIsDeleteModalOpen(true)
  }

  const handleModalConfirm = async (reason) => {
    setIsLoading(true)
    try {
      if (modalConfig.type === 'ban') {
        await handleToggleActive(modalConfig.storeId, false, reason)
      }
      setModalConfig({ isOpen: false, type: null, storeId: null, isActive: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'delete') {
      setIsDeleteModalOpen(true)
      return
    }

    if (actionType === 'commission') {
      setCommissionModal({
        isOpen: true,
        storeIds: selectedIds,
        commissionRate: 10
      })
      return
    }

    if (actionType === 'deactivate') {
      // Khóa hàng loạt - mở modal nhập lý do
      setModalConfig({
        isOpen: true,
        type: 'ban_bulk',
        title: 'Khóa hàng loạt cửa hàng',
        message: `Vui lòng nhập lý do khóa ${selectedIds.length} cửa hàng. Lý do này sẽ được gửi đến từng chủ shop.`,
        placeholder: 'Nhập lý do khóa...',
        storeId: null,
        isActive: false
      })
      return
    }

    try {
      let res = null
      if (actionType === 'activate') {
        res = await adminStoreApiService.toggleStoresActive(selectedIds, true)
      }

      if (res) {
        toast.success(res.message)
        setSelectedIds([])
        setSelectedStores([])
        fetchStores()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBulkModalConfirm = async (reason) => {
    setIsLoading(true)
    try {
      if (modalConfig.type === 'ban_bulk') {
        await handleToggleActiveBulk(selectedIds, false, reason)
      }
      setModalConfig({ isOpen: false, type: null, storeId: null, isActive: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      const res = await adminStoreApiService.deleteStores(selectedIds)
      toast.success(res.message)
      setIsDeleteModalOpen(false)
      setSelectedIds([])
      setSelectedStores([])
      fetchStores()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (isActive !== null) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <FiHome className="text-emerald-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Cửa hàng</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý toàn bộ cửa hàng trên sàn</p>
          </div>
        </div>
        <Link
          to="/admin/stores/add"
          className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 cursor-pointer transition-all duration-300 active:scale-95"
        >
          <FiPlus size={16} /> Thêm cửa hàng
        </Link>
      </div>

      {data?.overview && <StoreOverviewWidgets overview={data.overview} />}

      <StoreFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

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
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
              onToggleActive={handleToggleActiveWithReason}
              onUpdateCommission={handleUpdateCommission}
              onDelete={handleDeleteSingle}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa cửa hàng"
        message={`Bạn đang chuẩn bị xóa ${selectedIds.length} cửa hàng khỏi hệ thống. Hành động này KHÔNG THỂ phục hồi!`}
      />

      {/* Modal cập nhật phí hoa hồng */}
      <ConfirmReasonModal
        isOpen={commissionModal.isOpen}
        onClose={() => setCommissionModal({ isOpen: false, storeIds: [], commissionRate: 10 })}
        onConfirm={(reason) => {
          const rate = parseFloat(reason)
          if (isNaN(rate) || rate < 0 || rate > 100) {
            toast.error('Vui lòng nhập tỷ lệ phần trăm từ 0-100')
            return
          }
          handleUpdateCommission(commissionModal.storeIds, rate)
        }}
        title="Cập nhật phí hoa hồng"
        message={`Nhập tỷ lệ phí hoa hồng mới cho ${commissionModal.storeIds.length} cửa hàng (0-100%):`}
        placeholder="Nhập tỷ lệ phần trăm (VD: 10)"
        isLoading={isLoading}
        type="approve"
      />

      {/* Modal nhập lý do khóa */}
      <ConfirmReasonModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null, storeId: null, isActive: null })}
        onConfirm={modalConfig.type === 'ban_bulk' ? handleBulkModalConfirm : handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
      />
    </div>
  )
}