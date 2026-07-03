import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiHome } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { vendorStoreApiService } from '~/services/vendor/vendorStoreApiService'
import { getImageUrl } from '~/utils/formatters'
import { StoreInfoForm } from './StoreInfoForm'
import { usePageTitle } from '~/hooks/usePageTitle'

export const VendorProfileStore = () => {
  usePageTitle(
    'Thông tin cửa hàng',
    'Quản lý thông tin gian hàng của bạn'
  )
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  useEffect(() => {
    fetchStoreProfile()
  }, [])

  const fetchStoreProfile = async () => {
    try {
      setLoading(true)
      const res = await vendorStoreApiService.getStoreProfile()
      setStore(res)
      setLogoPreview(getImageUrl(res.logo))
      setBannerPreview(getImageUrl(res.banner))
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.message?.includes('chưa đăng ký cửa hàng')) {
        setStore({ is_registered: false })
      } else {
        toast.error(error.response?.data?.message || 'Không thể tải thông tin cửa hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('bio', data.bio || '')
    formData.append('address', data.address)

    if (logoFile) formData.append('logo', logoFile)
    if (bannerFile) formData.append('banner', bannerFile)

    try {
      await vendorStoreApiService.updateStoreProfile(formData)
      toast.success('Cập nhật cửa hàng thành công!')
      await fetchStoreProfile()
      setLogoFile(null)
      setBannerFile(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSuccess = () => {
    fetchStoreProfile()
  }

  if (!store) {
    return (
      <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm w-full">
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <FiHome className="text-brand-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-brand-secondary tracking-tight">Thông tin cửa hàng</h2>
          <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin gian hàng của bạn</p>
        </div>
      </div>

      <StoreInfoForm
        store={store}
        loading={loading}
        onSubmit={onSubmit}
        logoPreview={logoPreview}
        bannerPreview={bannerPreview}
        onLogoChange={handleLogoChange}
        onBannerChange={handleBannerChange}
      />
    </div>
  )
}