import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiGrid, FiPlus } from 'react-icons/fi'

import { adminCategoryApiService } from '~/services/admin/adminCategoryApiService'
import { CategoryOverviewWidgets } from './CategoryOverviewWidgets'
import { CategoryFilters } from './CategoryFilters'
import { CategoryTable } from './CategoryTable'
import { CategorySearchResultsInfo } from './CategorySearchResultsInfo'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { Pagination } from '~/components/common/Pagination'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminCategoriesPage = () => {
  usePageTitle(
    'Quản lý Danh mục',
    'Quản lý danh mục sản phẩm đa cấp'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // State cho toggle modal
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    categoryId: null,
    isActive: null,
    categoryName: ''
  })

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null

  const activeFilters = { page, limit, search }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await adminCategoryApiService.getCategories(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu danh mục.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
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

  // 🆕 Xử lý toggle trạng thái
  const handleToggleStatus = (id, isActive, categoryName) => {
    setToggleModal({
      isOpen: true,
      categoryId: id,
      isActive: isActive,
      categoryName: categoryName
    })
  }

  const handleConfirmToggle = async () => {
    const { categoryId, isActive } = toggleModal
    try {
      const res = await adminCategoryApiService.toggleCategoryStatus(categoryId, isActive)
      toast.success(res.message)
      setToggleModal({ isOpen: false, categoryId: null, isActive: null, categoryName: '' })
      fetchCategories()
    } catch (error) {
      toast.error(error.message || 'Cập nhật trạng thái thất bại')
    }
  }

  const handleDelete = (id) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const res = await adminCategoryApiService.deleteCategory(deleteId)
      toast.success(res.message)
      setIsDeleteModalOpen(false)
      setDeleteId(null)
      fetchCategories()
    } catch (error) {
      toast.error(error.message || 'Xóa danh mục thất bại')
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <FiGrid className="text-emerald-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Danh mục</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý danh mục sản phẩm đa cấp</p>
          </div>
        </div>
        <Link
          to="/admin/categories/add"
          className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 cursor-pointer transition-all duration-300 active:scale-95"
        >
          <FiPlus size={16} /> Thêm danh mục
        </Link>
      </div>

      {data?.overview && <CategoryOverviewWidgets overview={data.overview} />}

      <CategoryFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {!loading && data && (
        <CategorySearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu danh mục...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <CategoryTable
              categories={data.categories}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}

      {/* Modal toggle trạng thái - Không cần nhập lý do */}
      <ConfirmReasonModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, categoryId: null, isActive: null, categoryName: '' })}
        onConfirm={handleConfirmToggle}
        title={toggleModal.isActive ? 'Kích hoạt danh mục' : 'Khóa danh mục'}
        message={
          toggleModal.isActive
            ? `Bạn có chắc muốn kích hoạt danh mục "${toggleModal.categoryName}"?\n\nTất cả danh mục con và sản phẩm liên quan sẽ được kích hoạt theo.`
            : `Bạn có chắc muốn khóa danh mục "${toggleModal.categoryName}"?\n\nTất cả danh mục con và sản phẩm liên quan sẽ bị khóa theo.`
        }
        placeholder="" // Không cần placeholder
        isLoading={false}
        hideReasonInput={true} // 🆕 Ẩn input nhập lý do
        type={toggleModal.isActive ? 'success' : 'danger'}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        message="Bạn đang chuẩn bị xóa danh mục này khỏi hệ thống. Các danh mục con sẽ được đẩy lên làm danh mục độc lập. Hành động này KHÔNG THỂ phục hồi!"
      />
    </div>
  )
}