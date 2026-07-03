// ~/pages/admin/Users/UserForm/UserFormPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiSave, FiX } from 'react-icons/fi'
import { adminUserApiService } from '~/services/admin/adminUserApiService'
import { ROLE_ID } from '~/utils/constant'
import { UserFormHeader } from './UserFormHeader'
import { UserFormFields } from './UserFormFields'
import { UserFormAvatar } from './UserFormAvatar'
import { usePageTitle } from '~/hooks/usePageTitle'

export const UserFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  usePageTitle(
    isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới',
    isEditMode ? 'Cập nhật thông tin người dùng' : 'Tạo tài khoản người dùng mới'
  )

  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const methods = useForm({
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      address: '', // 👈 THÊM ADDRESS
      password: '',
      roleId: ROLE_ID.USER
    }
  })

  const { reset, handleSubmit, formState: { errors } } = methods

  const fetchUserDetail = async () => {
    try {
      setLoading(true)
      const res = await adminUserApiService.getUserDetail(id)
      reset({
        fullname: res.fullname,
        email: res.email,
        phone: res.phone || '',
        address: res.address || '',
        roleId: res.role_id
      })
      if (res.avatar) {
        setAvatarPreview(typeof res.avatar === 'string' ? JSON.parse(res.avatar) : res.avatar)
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin người dùng')
      navigate('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEditMode && id) {
      fetchUserDetail()
    }
  }, [id, isEditMode])

  const handleAvatarChange = (file) => {
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('fullname', data.fullname)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('address', data.address || '')
      formData.append('roleId', data.roleId)

      if (data.password) {
        formData.append('password', data.password)
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      let response
      if (isEditMode) {
        response = await adminUserApiService.updateUser(id, formData)
        toast.success(response.message || 'Cập nhật người dùng thành công!')
      } else {
        response = await adminUserApiService.createUser(formData)
        toast.success(response.message || 'Tạo người dùng thành công!')
      }

      navigate('/admin/users')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/users')
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
        <UserFormHeader
          isEditMode={isEditMode}
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          hasErrors={Object.keys(errors).length > 0}
        />

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar - Left */}
          <div className="lg:col-span-1">
            <UserFormAvatar
              avatarPreview={avatarPreview}
              onAvatarChange={handleAvatarChange}
              onRemoveAvatar={handleRemoveAvatar}
              isEditMode={isEditMode}
            />
          </div>

          {/* Form Fields - Right */}
          <div className="lg:col-span-2">
            <UserFormFields isEditMode={isEditMode} />
          </div>
        </div>
      </div>
    </FormProvider>
  )
}