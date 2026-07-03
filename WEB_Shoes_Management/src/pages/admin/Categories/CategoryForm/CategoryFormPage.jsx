import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { adminCategoryApiService } from '~/services/admin/adminCategoryApiService'
import { CategoryFormHeader } from './CategoryFormHeader'
import { CategoryFormFields } from './CategoryFormFields'
import { CategoryFormAvatar } from './CategoryFormAvatar'
import { usePageTitle } from '~/hooks/usePageTitle'

export const CategoryFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  usePageTitle(
    isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới',
    isEditMode ? 'Cập nhật thông tin danh mục sản phẩm' : 'Tạo danh mục sản phẩm mới'
  )

  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parentCategories, setParentCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const methods = useForm({
    defaultValues: {
      name: '',
      parentId: null,
      description: ''
    }
  })

  const { reset, handleSubmit, formState: { errors } } = methods

  // Lấy danh sách danh mục để làm parent (dạng tree)
  const fetchParentCategories = async () => {
    try {
      const res = await adminCategoryApiService.getCategories({ mode: 'tree' })
      if (res.mode === 'tree') {
        setParentCategories(res.tree)
      }
    } catch (error) {
      console.error('Lỗi tải danh sách danh mục cha:', error)
    }
  }

  const fetchCategoryDetail = async () => {
    try {
      setLoading(true)
      const res = await adminCategoryApiService.getCategoryDetail(id)
      reset({
        name: res.name,
        parentId: res.parentId || null,
        description: res.description || ''
      })
      if (res.image) {
        setImagePreview(res.image)
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin danh mục')
      navigate('/admin/categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParentCategories()
    if (isEditMode && id) {
      fetchCategoryDetail()
    }
  }, [id, isEditMode])

  const handleImageChange = (file) => {
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description || '')

      if (data.parentId) {
        formData.append('parentId', data.parentId)
      }

      if (imageFile) {
        formData.append('categoryImage', imageFile)
      }

      let response
      if (isEditMode) {
        response = await adminCategoryApiService.updateCategory(id, formData)
        toast.success(response.message || 'Cập nhật danh mục thành công!')
      } else {
        response = await adminCategoryApiService.createCategory(formData)
        toast.success(response.message || 'Tạo danh mục thành công!')
      }

      navigate('/admin/categories')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/categories')
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
          {isEditMode ? 'Đang tải thông tin...' : 'Đang chuẩn bị...'}
        </motion.span>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <CategoryFormHeader
          isEditMode={isEditMode}
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          hasErrors={Object.keys(errors).length > 0}
        />

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image - Left */}
          <div className="lg:col-span-1">
            <CategoryFormAvatar
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
              isEditMode={isEditMode}
            />
          </div>

          {/* Form Fields - Right */}
          <div className="lg:col-span-2">
            <CategoryFormFields
              parentCategories={parentCategories}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  )
}