import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiSave, FiX, FiUser, FiHome } from 'react-icons/fi'
import { adminStoreApiService } from '~/services/admin/adminStoreApiService'
import { adminUserApiService } from '~/services/admin/adminUserApiService'
import { StoreFormHeader } from './StoreFormHeader'
import { StoreFormFields } from './StoreFormFields'
import { StoreFormImages } from './StoreFormImages'
import { ROLE_ID } from '~/utils/constant'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminStoreFormPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState([])
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)

  usePageTitle(
    'Thêm cửa hàng mới',
    'Tạo cửa hàng mới cho người dùng trên hệ thống'
  )

  const methods = useForm({
    defaultValues: {
      ownerId: '',
      name: '',
      bio: '',
      address: '',
      commissionRate: 10
    }
  })

  const { reset, handleSubmit, formState: { errors }, setValue, watch } = methods
  const selectedOwnerId = watch('ownerId')

  // Lấy tất cả user có role = USER khi component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await adminUserApiService.getUsers({
          roleId: ROLE_ID.USER,
          isActive: 1,
          limit: 1000
        })
        setUsers(res.users || [])
      } catch (error) {
        console.error('Lỗi tải danh sách người dùng:', error)
        toast.error('Không thể tải danh sách người dùng')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleLogoChange = (file) => {
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (file) => {
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(null)
  }

  const handleRemoveBanner = () => {
    setBannerFile(null)
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview)
    }
    setBannerPreview(null)
  }

  const onSubmit = async (data) => {
    if (!data.ownerId) {
      toast.error('Vui lòng chọn chủ sở hữu cho cửa hàng')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('ownerId', data.ownerId)
      formData.append('name', data.name)
      formData.append('bio', data.bio || '')
      formData.append('address', data.address || '')
      formData.append('commissionRate', data.commissionRate || 10)

      if (logoFile) {
        formData.append('logo', logoFile)
      }
      if (bannerFile) {
        formData.append('banner', bannerFile)
      }

      const response = await adminStoreApiService.createStore(formData)
      toast.success(response.message || 'Tạo cửa hàng thành công!')
      navigate('/admin/stores')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/stores')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <StoreFormHeader
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          hasErrors={Object.keys(errors).length > 0}
        />

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images - Left */}
          <div className="lg:col-span-1">
            <StoreFormImages
              logoPreview={logoPreview}
              bannerPreview={bannerPreview}
              onLogoChange={handleLogoChange}
              onBannerChange={handleBannerChange}
              onRemoveLogo={handleRemoveLogo}
              onRemoveBanner={handleRemoveBanner}
            />
          </div>

          {/* Form Fields - Right */}
          <div className="lg:col-span-2">
            <StoreFormFields
              users={users}
              selectedOwnerId={selectedOwnerId}
              setValue={setValue}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  )
}