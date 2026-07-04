import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FiUser, FiPhone, FiMapPin, FiCamera, FiSave, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { updateUserFields } from '~/redux/user/userSlice'
import { getImageUrl } from '~/utils/formatters'
import { vendorUserApiService } from '~/services/vendor/vendorUserApiService'

export const ShipperProfilePage = () => {
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.user.userInfo)

  const [loading, setLoading] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  const profileForm = useForm({
    defaultValues: {
      fullname: userInfo?.fullname || '',
      phone: userInfo?.phone || '',
      address: userInfo?.address || ''
    }
  })
  const pwForm = useForm()

  useEffect(() => {
    if (userInfo) {
      profileForm.reset({ fullname: userInfo.fullname || '', phone: userInfo.phone || '', address: userInfo.address || '' })
      setPreviewAvatar(getImageUrl(userInfo.avatar))
    }
  }, [userInfo])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) { setSelectedFile(file); setPreviewAvatar(URL.createObjectURL(file)) }
  }

  const handleUpdateProfile = profileForm.handleSubmit(async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('fullname', data.fullname)
      formData.append('phone', data.phone || '')
      formData.append('address', data.address || '')
      if (selectedFile) formData.append('avatar', selectedFile)
      const res = await vendorUserApiService.updateProfile(formData)
      dispatch(updateUserFields(res.user))
      setPreviewAvatar(getImageUrl(res.user.avatar))
      setSelectedFile(null)
      toast.success('Cập nhật thông tin thành công!')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  })

  const handleChangePassword = pwForm.handleSubmit(async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('fullname', userInfo?.fullname || '')
      formData.append('phone', userInfo?.phone || '')
      formData.append('address', userInfo?.address || '')
      formData.append('oldPassword', data.oldPassword)
      formData.append('password', data.newPassword)
      const res = await vendorUserApiService.updateProfile(formData)
      dispatch(updateUserFields(res.user))
      toast.success('Đổi mật khẩu thành công!')
      pwForm.reset()
      setActiveTab('profile')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  })

  const tabs = [
    { key: 'profile', label: 'Thông tin cá nhân' },
    { key: 'password', label: 'Đổi mật khẩu' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tài khoản của tôi</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-orange-50 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === t.key ? 'bg-orange-500 text-white shadow-sm' : 'text-orange-700 hover:bg-orange-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-100 bg-orange-50 flex items-center justify-center">
              {previewAvatar
                ? <img src={previewAvatar} alt="avatar" className="w-full h-full object-cover" />
                : <FiUser size={40} className="text-orange-400" />
              }
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors border-2 border-white">
              <FiCamera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 text-lg">{userInfo?.fullname || 'Shipper'}</p>
            <p className="text-sm text-orange-500 font-medium mt-0.5">Shipper</p>
            <p className="text-xs text-gray-400 mt-1">{userInfo?.email || ''}</p>
          </div>
        </motion.div>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          {activeTab === 'profile' ? (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">Thông tin cá nhân</h2>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FiUser size={12} /> Họ và tên</label>
                <input
                  {...profileForm.register('fullname', { required: 'Vui lòng nhập họ tên' })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 outline-none transition-all"
                  placeholder="Họ và tên"
                />
                {profileForm.formState.errors.fullname && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.fullname.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FiPhone size={12} /> Số điện thoại</label>
                <input
                  {...profileForm.register('phone')}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 outline-none transition-all"
                  placeholder="Số điện thoại"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FiMapPin size={12} /> Địa chỉ</label>
                <textarea
                  {...profileForm.register('address')}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 outline-none transition-all resize-none"
                  placeholder="Địa chỉ của bạn"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all duration-200"
              >
                <FiSave size={15} />
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">Đổi mật khẩu</h2>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FiLock size={12} /> Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    {...pwForm.register('oldPassword', { required: 'Nhập mật khẩu hiện tại' })}
                    type={showOldPw ? 'text' : 'password'}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm pr-10 focus:bg-white focus:border-orange-400 outline-none transition-all"
                    placeholder="Mật khẩu hiện tại"
                  />
                  <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showOldPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FiLock size={12} /> Mật khẩu mới</label>
                <div className="relative">
                  <input
                    {...pwForm.register('newPassword', { required: 'Nhập mật khẩu mới', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
                    type={showNewPw ? 'text' : 'password'}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm pr-10 focus:bg-white focus:border-orange-400 outline-none transition-all"
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {pwForm.formState.errors.newPassword && <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FiLock size={12} /> Xác nhận mật khẩu mới</label>
                <input
                  {...pwForm.register('confirmPassword', { required: 'Nhập lại mật khẩu mới' })}
                  type="password"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 outline-none transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all duration-200"
              >
                <FiLock size={15} />
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
