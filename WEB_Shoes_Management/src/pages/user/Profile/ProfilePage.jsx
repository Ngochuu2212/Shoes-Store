import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { updateUserFields, logoutSuccess, setFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { userService } from '~/services/user/userService'
import { authService } from '~/services/auth/authService'
import { productService } from '~/services/user/productService'
import { ProfileSidebar } from './ProfileSidebar'
import { ProfileTabsContent } from './ProfileTabsContent'
import { toast } from 'react-toastify'
import { getImageUrl } from '~/utils/formatters'
import { usePageTitle } from '~/hooks/usePageTitle'

export const ProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)

  // Lấy tab từ URL, mặc định là 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab')
    // Kiểm tra tab hợp lệ
    const validTabs = ['profile', 'favorites', 'password']
    return tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'profile'
  })

  const getTabTitle = () => {
    switch (activeTab) {
    case 'profile': return 'Thông tin cá nhân'
    case 'favorites': return 'Sản phẩm yêu thích'
    case 'password': return 'Đổi mật khẩu'
    default: return 'Hồ sơ cá nhân'
    }
  }

  usePageTitle(
    getTabTitle(),
    `Quản lý ${getTabTitle().toLowerCase()} của bạn tại Shoes Platform`
  )

  const [favoriteProducts, setFavoriteProducts] = useState([])

  const user = useSelector((state) => state.user.userInfo)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  const [previewAvatar, setPreviewAvatar] = useState(getImageUrl(user?.avatar))
  const [selectedFile, setSelectedFile] = useState(null)

  // Cập nhật URL khi đổi tab
  const handleSetActiveTab = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setPreviewAvatar(getImageUrl(user?.avatar))
  }, [user])

  useEffect(() => {
    if (isAuthenticated && activeTab === 'favorites') {
      setLoading(true)
      productService.getFavorites()
        .then(data => {
          setFavoriteProducts(data || [])
          const ids = data.map(item => item.product_id)
          dispatch(setFavorites(ids))
        })
        .catch(err => console.error('Lỗi tải danh sách yêu thích:', err))
        .finally(() => setLoading(false))
    }
  }, [activeTab, isAuthenticated, dispatch])

  const handleRemoveFavoriteItem = async (productId) => {
    try {
      const response = await productService.toggleFavorite(productId)
      if (response && response.isFavorite === false) {
        toast.success(response.message || 'Đã xóa khỏi danh sách yêu thích.')
        dispatch(removeFromFavorites(productId))
        setFavoriteProducts(prev => prev.filter(item => item.product_id !== productId))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logoutSuccess())
      toast.success('Đăng xuất thành công!')
      navigate('/login')
    } catch {
      dispatch(logoutSuccess())
    }
  }

  const handleUpdateProfile = async (data, resetCallback = null) => {
    setLoading(true)
    const formData = new FormData()

    if (data.password) {
      formData.append('fullname', user?.fullname || '')
      formData.append('phone', user?.phone || '')
      formData.append('address', user?.address || '')
      formData.append('oldPassword', data.oldPassword)
      formData.append('password', data.password)
    } else {
      formData.append('fullname', data.fullname)
      formData.append('phone', data.phone)
      formData.append('address', data.address)
    }

    if (selectedFile) {
      formData.append('avatar', selectedFile)
    }

    try {
      const response = await userService.updateProfile(formData)
      if (response) {
        toast.success(response.message || 'Cập nhật thành công!')
        dispatch(updateUserFields(response.user))
        setSelectedFile(null)

        if (typeof resetCallback === 'function') {
          resetCallback()
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const sidebarVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-gray-50/50 py-8 md:py-12 select-none">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="app-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <motion.div variants={sidebarVariants} className="lg:col-span-3">
            <ProfileSidebar
              user={user}
              activeTab={activeTab}
              setActiveTab={handleSetActiveTab}
              onLogout={handleLogout}
              avatarUrl={getImageUrl(user?.avatar)}
            />
          </motion.div>

          <motion.div variants={contentVariants} className="lg:col-span-9">
            <ProfileTabsContent
              user={user}
              activeTab={activeTab}
              loading={loading}
              onUpdateProfile={handleUpdateProfile}
              onFileChange={handleFileChange}
              previewAvatar={previewAvatar}
              favoriteProducts={favoriteProducts}
              onRemoveFavoriteItem={handleRemoveFavoriteItem}
            />
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}