import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUsers, FiUserPlus } from 'react-icons/fi'

import { adminUserApiService } from '~/services/admin/adminUserApiService'
import { UserOverviewWidgets } from './UserOverviewWidgets'
import { UserFilters } from './UserFilters'
import { UserTable } from './UserTable'
import { UserBulkActionPanel } from './UserBulkActionPanel'
import { UserSearchResultsInfo } from './UserSearchResultsInfo'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { Pagination } from '~/components/common/Pagination'
import { ROLE_ID } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminUsersPage = () => {
  usePageTitle(
    'Quản lý Người dùng',
    'Quản lý tài khoản thành viên toàn hệ thống'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || null
  const roleId = searchParams.get('roleId') || null
  const isActive = searchParams.get('isActive') !== null ? Number(searchParams.get('isActive')) : null
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'DESC'

  const activeFilters = { page, limit, search, roleId, isActive, sortBy, sortOrder }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await adminUserApiService.getUsers(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu người dùng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    setSelectedIds([])
    setSelectedUsers([])
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
    const user = data?.users?.find(u => u.id === id)
    if (user) {
      setSelectedUsers(prev => prev.includes(user) ? prev.filter(u => u.id !== id) : [...prev, user])
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked && data?.users) {
      setSelectedIds(data.users.map(u => u.id))
      setSelectedUsers([...data.users])
    } else {
      setSelectedIds([])
      setSelectedUsers([])
    }
  }

  const handleToggleActive = async (userId, isActive) => {
    try {
      const res = await adminUserApiService.toggleUsersActive([userId], isActive)
      toast.success(res.message)
      fetchUsers()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleChangeRole = async (userId, targetRoleId) => {
    try {
      const res = await adminUserApiService.changeUsersRole([userId], targetRoleId)
      toast.success(res.message)
      fetchUsers()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteSingle = (userId) => {
    setSelectedIds([userId])
    setIsDeleteModalOpen(true)
  }

  const handleBulkAction = async (actionType) => {
    if (actionType === 'delete') {
      setIsDeleteModalOpen(true)
      return
    }

    try {
      let res = null
      if (actionType === 'activate' || actionType === 'deactivate') {
        res = await adminUserApiService.toggleUsersActive(selectedIds, actionType === 'activate')
      } else if (actionType === 'role_vendor') {
        res = await adminUserApiService.changeUsersRole(selectedIds, ROLE_ID.VENDOR)
      } else if (actionType === 'role_manager') {
        res = await adminUserApiService.changeUsersRole(selectedIds, ROLE_ID.MANAGER)
      } else if (actionType === 'role_user') {
        res = await adminUserApiService.changeUsersRole(selectedIds, ROLE_ID.USER)
      }

      if (res) {
        toast.success(res.message)
        setSelectedIds([])
        setSelectedUsers([])
        fetchUsers()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      const res = await adminUserApiService.deleteUsers(selectedIds)
      toast.success(res.message)
      setIsDeleteModalOpen(false)
      setSelectedIds([])
      setSelectedUsers([])
      fetchUsers()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (roleId) count++
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
            <FiUsers className="text-emerald-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Người dùng</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý tài khoản thành viên toàn hệ thống</p>
          </div>
        </div>
        <Link
          to='/admin/users/add'
          className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 cursor-pointer transition-all duration-300 active:scale-95"
        >
          <FiUserPlus size={16} /> Thêm người dùng
        </Link>
      </div>

      {data?.overview && <UserOverviewWidgets overview={data.overview} />}

      <UserFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {!loading && data && (
        <UserSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <UserBulkActionPanel
            selectedCount={selectedIds.length}
            selectedUsers={selectedUsers}
            onBulkAction={handleBulkAction}
            onClearSelection={() => {
              setSelectedIds([])
              setSelectedUsers([])
            }}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu người dùng...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <UserTable
              users={data.users}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onToggleActive={handleToggleActive}
              onChangeRole={handleChangeRole}
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

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa người dùng"
        message={`Bạn đang chuẩn bị xóa ${selectedIds.length} tài khoản khỏi hệ thống. Hành động này KHÔNG THỂ phục hồi!`}
      />
    </div>
  )
}