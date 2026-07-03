import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiTag } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { managerPromotionApiService } from '~/services/manager/managerPromotionApiService'
import { ManagerPromotionOverviewWidgets } from './ManagerPromotionOverviewWidgets'
import { ManagerPromotionFilters } from './ManagerPromotionFilters'
import { ManagerPromotionTable } from './ManagerPromotionTable'
import { ManagerPromotionBulkActionPanel } from './ManagerPromotionBulkActionPanel'
import { ManagerPromotionSearchResultsInfo } from './ManagerPromotionSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'
import { ConfirmDeleteModalPromotion } from '~/components/common/ConfirmDeleteModalPromotion'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ManagerPromotionsPage = () => {
  usePageTitle('Mã giảm giá hệ thống', 'Quản lý mã giảm giá toàn sàn cho người dùng')

  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const is_active = searchParams.get('is_active') !== null ? Number(searchParams.get('is_active')) : null
  const start_date = searchParams.get('start_date') || null
  const end_date = searchParams.get('end_date') || null
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const activeFilters = { page, limit, search, is_active, start_date, end_date, sortBy, sortOrder }

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const res = await managerPromotionApiService.getSystemPromotions(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu mã giảm giá hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
    setSelectedIds([])
  }, [searchParams])

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (key === 'dateRange') {
      if (value === null || value === undefined) { newParams.delete('start_date'); newParams.delete('end_date') }
      else { newParams.set('start_date', value.start_date); newParams.set('end_date', value.end_date) }
    } else if (value === null || value === undefined || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    if (key !== 'page') newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleResetFilters = () => setSearchParams({})

  const handleSelectRow = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  const handleSelectAll = (isChecked) => setSelectedIds(isChecked && data?.promotions ? data.promotions.map(p => p.id) : [])

  const handleToggleActiveSingle = async (id, isActive) => {
    try {
      const res = await managerPromotionApiService.toggleActiveSingle(id, isActive)
      toast.success(res.message)
      fetchPromotions()
    } catch (err) { toast.error(err.message) }
  }

  const handleDeleteSingleClick = (promotion) => {
    setPromotionToDelete(promotion)
    setIsSingleDeleteModalOpen(true)
  }

  const handleConfirmDeleteSingle = async () => {
    if (!promotionToDelete) return
    try {
      const res = await managerPromotionApiService.deletePromotionSingle(promotionToDelete.id)
      toast.success(res.message)
      setIsSingleDeleteModalOpen(false)
      setPromotionToDelete(null)
      fetchPromotions()
    } catch (err) { toast.error(err.message) }
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'delete') { setIsBulkDeleteModalOpen(true); return }
    try {
      let res = null
      if (actionType === 'activate') res = await managerPromotionApiService.toggleActiveBulk(selectedIds, 1)
      else if (actionType === 'deactivate') res = await managerPromotionApiService.toggleActiveBulk(selectedIds, 0)
      if (res) { toast.success(res.message); setSelectedIds([]); fetchPromotions() }
    } catch (error) { toast.error(error.message) }
  }

  const handleConfirmBulkDelete = async () => {
    try {
      const res = await managerPromotionApiService.deletePromotionsBulk(selectedIds)
      toast.success(res.message)
      setIsBulkDeleteModalOpen(false)
      setSelectedIds([])
      fetchPromotions()
    } catch (error) { toast.error(error.message) }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (is_active !== null) count++
    if (start_date) count++
    if (end_date) count++
    if (sortBy && sortBy !== 'created_at') count++
    return count
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
            <FiTag className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Mã giảm giá hệ thống</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý mã giảm giá toàn sàn áp dụng cho tất cả người mua</p>
          </div>
        </div>
        <Link to="/manager/promotions/add"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 cursor-pointer transition-all duration-300 active:scale-95">
          <FiPlus size={16} /> Thêm mã hệ thống
        </Link>
      </div>

      {data?.overview && <ManagerPromotionOverviewWidgets overview={data.overview} />}

      <ManagerPromotionFilters filters={activeFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {!loading && data && (
        <ManagerPromotionSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={getActiveFiltersCount()}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <ManagerPromotionBulkActionPanel
            selectedCount={selectedIds.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu mã giảm giá hệ thống...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ManagerPromotionTable
              promotions={data.promotions}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onToggleActive={handleToggleActiveSingle}
              onDelete={handleDeleteSingleClick}
            />
            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      <ConfirmDeleteModalPromotion
        isOpen={isSingleDeleteModalOpen}
        onClose={() => setIsSingleDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteSingle}
        title="Xác nhận xóa mã hệ thống"
        message="Mã giảm giá hệ thống này sẽ bị xóa vĩnh viễn. Hành động này KHÔNG THỂ phục hồi!"
        itemInfo={promotionToDelete ? { name: promotionToDelete.name, code: `#${promotionToDelete.id}` } : null}
      />

      <ConfirmDeleteModalPromotion
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Xóa hàng loạt mã hệ thống"
        message={`Bạn đang chuẩn bị xóa vĩnh viễn ${selectedIds.length} mã giảm giá hệ thống. Hành động này KHÔNG THỂ phục hồi!`}
        itemInfo={null}
      />
    </div>
  )
}
