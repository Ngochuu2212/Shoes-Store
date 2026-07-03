import { FiUser, FiShoppingBag, FiHeart, FiLock, FiLogOut } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '~/components/common/Avatar'

export const ProfileSidebar = ({ user, activeTab, setActiveTab, onLogout, avatarUrl }) => {
  const navigate = useNavigate()

  return (
    <div className="lg:col-span-4 flex flex-col gap-6 w-full animate-fadeIn">
      {/* Khối Thông tin tóm tắt người dùng */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shrink-0">
          <Avatar
            user={user}
            src={avatarUrl}
            size="w-full h-full"
            textSize="text-lg"
            rounded="rounded-full"
          />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-brand-secondary text-lg leading-tight truncate">{user?.fullname}</h2>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Khối Menu điều hướng dọc */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col gap-1">
        {/* Tab Thông tin cá nhân */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer
          ${activeTab === 'profile' ? 'bg-[#e94560]/5 text-brand-primary border-r-4 border-brand-primary rounded-r-none' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'}`}
        >
          <FiUser size={18} /> <span>Thông tin cá nhân</span>
        </button>

        {/* Lịch sử đơn hàng */}
        <button
          onClick={() => navigate('/orders')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-brand-primary transition-all cursor-pointer"
        >
          <FiShoppingBag size={18} /> <span>Lịch sử đơn hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer
          ${activeTab === 'favorites' ? 'bg-[#e94560]/5 text-brand-primary border-r-4 border-brand-primary rounded-r-none' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'}`}
        >
          <FiHeart size={18} /> <span>Sản phẩm yêu thích</span>
        </button>

        {/* Tab Đổi mật khẩu */}
        <button
          onClick={() => setActiveTab('password')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer
          ${activeTab === 'password' ? 'bg-[#e94560]/5 text-brand-primary border-r-4 border-brand-primary rounded-r-none' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'}`}
        >
          <FiLock size={18} /> <span>Đổi mật khẩu</span>
        </button>

        <div className="h-[1px] bg-gray-100 my-2" />

        {/* Nút Đăng xuất */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-brand-secondary hover:bg-red-50 transition-all cursor-pointer"
        >
          <FiLogOut size={18} /> <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}