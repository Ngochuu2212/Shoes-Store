import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FiBell, FiMenu, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const ShipperHeader = ({ onMobileMenuToggle, isMobileOpen }) => {
  const user = useSelector((state) => state.user.userInfo)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        onClick={onMobileMenuToggle}
      >
        {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      <div className="hidden lg:flex items-center gap-2">
        <span className="text-sm text-gray-500">Hệ thống giao hàng</span>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/shipper/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <FiBell size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.fullname?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user?.fullname || 'Shipper'}
          </span>
        </div>
      </div>
    </header>
  )
}
