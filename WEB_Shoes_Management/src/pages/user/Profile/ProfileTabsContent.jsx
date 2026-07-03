import { FiCamera } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { TabProfile } from './Tabs/TabProfile'
import { TabFavorites } from './Tabs/TabFavorites'
import { TabPassword } from './Tabs/TabPassword'
import { TabWallet } from './Tabs/TabWallet'
import { Avatar } from '~/components/common/Avatar'

export const ProfileTabsContent = ({
  user,
  activeTab,
  loading,
  onUpdateProfile,
  onFileChange,
  previewAvatar,
  favoriteProducts = [],
  onRemoveFavoriteItem
}) => {

  const tabVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
  }

  return (
    <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm w-full min-h-[550px]">

      <div className="flex items-center gap-5 pb-8 border-b border-gray-100 w-full mb-8">
        <div className="relative group/avatar">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden ring-1 ring-gray-200">
            <Avatar
              user={user}
              src={previewAvatar}
              size="w-full h-full"
              textSize="text-2xl"
              rounded="rounded-full"
            />
          </div>
          <label htmlFor="avatar-file" className="absolute bottom-0 right-0 w-7 h-7 bg-brand-primary text-white border-2 border-white rounded-full flex items-center justify-center shadow-md hover:bg-[#c73652] cursor-pointer transition-all">
            <FiCamera size={12} />
          </label>
          <input type="file" id="avatar-file" accept="image/*" onChange={onFileChange} className="hidden" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-brand-secondary tracking-tight">{user?.fullname}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mã thành viên: #UID-{user?.id || '0000'}</p>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabProfile user={user} loading={loading} onUpdateProfile={onUpdateProfile} />
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabFavorites
                loading={loading}
                favoriteProducts={favoriteProducts}
                onRemoveFavoriteItem={onRemoveFavoriteItem}
              />
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div
              key="password"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabPassword loading={loading} onUpdateProfile={onUpdateProfile} />
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabWallet />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}