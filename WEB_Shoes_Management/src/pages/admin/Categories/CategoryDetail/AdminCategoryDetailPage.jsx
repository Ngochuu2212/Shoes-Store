import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiFolder, FiFolderPlus,
  FiFileText, FiCalendar, FiImage, FiPackage,
  FiToggleLeft, FiToggleRight, FiCheckCircle, FiXCircle
} from 'react-icons/fi'
import { adminCategoryApiService } from '~/services/admin/adminCategoryApiService'
import { getImageUrl, formatDateTime } from '~/utils/formatters'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminCategoryDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  usePageTitle(
    category ? `Danh mục ${category.name}` : 'Chi tiết danh mục',
    category ? `Xem chi tiết danh mục ${category.name}` : 'Xem chi tiết danh mục'
  )

  // State cho toggle modal
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    isActive: null
  })
  const [isToggling, setIsToggling] = useState(false)

  const fetchCategoryDetail = async () => {
    try {
      setLoading(true)
      const res = await adminCategoryApiService.getCategoryDetail(id)
      setCategory(res)
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin danh mục')
      navigate('/admin/categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchCategoryDetail()
  }, [id])

  // Xử lý toggle trạng thái
  const handleToggleStatus = (isActive) => {
    setToggleModal({
      isOpen: true,
      isActive: isActive
    })
  }

  const handleConfirmToggle = async () => {
    const { isActive } = toggleModal
    setIsToggling(true)
    try {
      const res = await adminCategoryApiService.toggleCategoryStatus(id, isActive)
      toast.success(res.message)
      setToggleModal({ isOpen: false, isActive: null })
      fetchCategoryDetail() // Refresh lại dữ liệu
    } catch (error) {
      toast.error(error.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await adminCategoryApiService.deleteCategory(id)
      toast.success(res.message)
      navigate('/admin/categories')
    } catch (error) {
      toast.error(error.message || 'Xóa danh mục thất bại')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải thông tin danh mục...
        </motion.span>
      </div>
    )
  }

  if (!category) return null

  const imageUrl = getImageUrl(category.image, null)

  const infoItems = [
    { icon: FiFolder, label: 'Tên danh mục', value: category.name },
    { icon: FiFolderPlus, label: 'Danh mục cha', value: category.parentName || 'Danh mục gốc' },
    { icon: FiFileText, label: 'Mô tả', value: category.description || 'Chưa có mô tả' },
    { icon: FiCalendar, label: 'Ngày tạo', value: formatDateTime(category.createdAt) },
    { icon: FiPackage, label: 'Số sản phẩm', value: category.totalProducts || 0 },
    {
      icon: category.isActive ? FiCheckCircle : FiXCircle,
      label: 'Trạng thái',
      value: category.isActive ? 'Đang hoạt động' : 'Đã khóa',
      valueColor: category.isActive ? 'text-green-600' : 'text-red-600'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/categories')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>

          <div className="flex items-center gap-4">
            {imageUrl ? (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={imageUrl}
                alt={category.name}
                className="w-14 h-14 rounded-xl object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-md">
                <FiFolder size={24} className="text-gray-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {category.name}
                </h1>
                <span className="text-xs text-gray-400">Slug: {category.slug}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  category.isActive
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {category.isActive ? (
                    <FiCheckCircle size={10} />
                  ) : (
                    <FiXCircle size={10} />
                  )}
                  {category.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {category.parentName ? `Thuộc danh mục: ${category.parentName}` : 'Danh mục gốc'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 🆕 Nút toggle trạng thái */}
          {category.isActive ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => handleToggleStatus(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
              >
                <FiToggleLeft size={16} />
                Khóa danh mục
              </button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => handleToggleStatus(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white border border-green-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
              >
                <FiToggleRight size={16} />
                Kích hoạt danh mục
              </button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={`/admin/categories/edit/${category.id}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
            >
              <FiEdit2 size={16} />
              Chỉnh sửa
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
            >
              <FiTrash2 size={16} />
              Xóa danh mục
            </button>
          </motion.div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ x: 3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              item.label === 'Trạng thái'
                ? category.isActive
                  ? 'bg-green-500/10'
                  : 'bg-red-500/10'
                : 'bg-emerald-500/10'
            }`}>
              <item.icon size={18} className={
                item.label === 'Trạng thái'
                  ? category.isActive
                    ? 'text-green-500'
                    : 'text-red-500'
                  : 'text-emerald-500'
              } />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
              <p className={`font-semibold ${item.valueColor || 'text-gray-800'}`}>
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal toggle trạng thái - Không cần nhập lý do */}
      <ConfirmReasonModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, isActive: null })}
        onConfirm={handleConfirmToggle}
        title={toggleModal.isActive ? 'Kích hoạt danh mục' : 'Khóa danh mục'}
        message={
          toggleModal.isActive
            ? `Bạn có chắc muốn kích hoạt danh mục "${category?.name}"?\n\nTất cả danh mục con và sản phẩm liên quan sẽ được kích hoạt theo.`
            : `Bạn có chắc muốn khóa danh mục "${category?.name}"?\n\nTất cả danh mục con và sản phẩm liên quan sẽ bị khóa theo.`
        }
        placeholder=""
        isLoading={isToggling}
        hideReasonInput={true}
        type={toggleModal.isActive ? 'success' : 'danger'}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa danh mục"
        message={`Bạn đang chuẩn bị xóa danh mục "${category.name}" khỏi hệ thống. Các danh mục con sẽ được đẩy lên làm danh mục độc lập. Hành động này KHÔNG THỂ phục hồi!`}
      />
    </motion.div>
  )
}