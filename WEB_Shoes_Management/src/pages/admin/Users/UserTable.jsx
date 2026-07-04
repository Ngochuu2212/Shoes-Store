import { formatDateTime, getImageUrl } from '~/utils/formatters'
import {
  FiEye, FiCheckCircle, FiXCircle, FiMoreVertical,
  FiUser, FiShield, FiStar, FiEdit2, FiTruck
} from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { ROLE_ID } from '~/utils/constant'

export const UserTable = ({
  users,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onToggleActive,
  onChangeRole,
  onDelete
}) => {
  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const getRoleBadge = (roleId) => {
    const config = {
      [ROLE_ID.ADMIN]: { label: 'QUẢN TRỊ', className: 'bg-red-50 text-red-600 border-red-100' },
      [ROLE_ID.MANAGER]: { label: 'ĐIỀU HÀNH', className: 'bg-purple-50 text-purple-600 border-purple-100' },
      [ROLE_ID.VENDOR]: { label: 'NGƯỚI BÁN', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      [ROLE_ID.USER]: { label: 'NGƯỚI DÙNG', className: 'bg-blue-50 text-blue-600 border-blue-100' },
      [ROLE_ID.SHIPPER]: { label: 'SHIPPER', className: 'bg-orange-50 text-orange-600 border-orange-100' }
    }
    const c = config[roleId] || { label: 'KHÔNG XÁC ĐỊNH', className: 'bg-gray-50 text-gray-600 border-gray-100' }
    return <span className={`${c.className} border px-2.5 py-1 rounded-full text-[10px] font-black`}>{c.label}</span>
  }

  const getStatusBadge = (isActive) => {
    return isActive === 1 ? (
      <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-black">
        ĐANG HOẠT ĐỘNG
      </span>
    ) : (
      <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-black">
        ĐÃ KHÓA
      </span>
    )
  }

  const getRoleIcon = (roleId) => {
    switch (roleId) {
    case ROLE_ID.ADMIN: return <FiShield size={14} className="text-red-500" />
    case ROLE_ID.MANAGER: return <FiStar size={14} className="text-purple-500" />
    case ROLE_ID.VENDOR: return <FiCheckCircle size={14} className="text-emerald-500" />
    case ROLE_ID.SHIPPER: return <FiTruck size={14} className="text-orange-500" />
    default: return <FiUser size={14} className="text-blue-500" />
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-6 w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20 accent-emerald-500 cursor-pointer"
                  checked={users.length > 0 && selectedIds.length === users.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="py-4 px-4 min-w-[200px]">Người dùng</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4 text-center">Vai trò</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-4 text-center">Ngày tạo</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isChecked = selectedIds.includes(user.id)
                const avatarUrl = getImageUrl(user.avatar, `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(user.fullname || 'User')}`)

                return (
                  <tr key={user.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-emerald-500/5' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20 accent-emerald-500 cursor-pointer"
                        checked={isChecked}
                        onChange={() => onSelectRow(user.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt={user.fullname}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900">{user.fullname}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-[10px] text-gray-400">{user.phone}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {getRoleIcon(user.role_id)}
                        {getRoleBadge(user.role_id)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(user.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                            >
                              <FiEye size={13} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-gray-800 text-white text-xs border-none font-semibold">
                            Xem chi tiết
                          </TooltipContent>
                        </Tooltip>

                        {/* Dropdown hành động */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-200 rounded-xl cursor-pointer active:scale-90 transition-all duration-200">
                              <FiMoreVertical size={13} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100 min-w-[200px]">
                            <DropdownMenuItem asChild className="text-xs font-bold text-blue-600 cursor-pointer py-2 gap-2">
                              <Link to={`/admin/users/edit/${user.id}`}>
                                <FiEdit2 size={14} /> Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {user.is_active === 1 ? (
                              <DropdownMenuItem
                                onClick={() => onToggleActive(user.id, false)}
                                className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                              >
                                <FaBan size={14} /> Khóa tài khoản
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onToggleActive(user.id, true)}
                                className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                              >
                                <FiCheckCircle size={14} /> Mở khóa tài khoản
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => onChangeRole(user.id, ROLE_ID.ADMIN)}
                              className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                            >
                              <FiShield size={14} /> Phân quyền Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user.id, ROLE_ID.MANAGER)}
                              className="text-xs font-bold text-purple-500 cursor-pointer py-2 gap-2"
                            >
                              <FiStar size={14} /> Phân quyền Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user.id, ROLE_ID.VENDOR)}
                              className="text-xs font-bold text-emerald-500 cursor-pointer py-2 gap-2"
                            >
                              <FiCheckCircle size={14} /> Phân quyền Vendor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user.id, ROLE_ID.USER)}
                              className="text-xs font-bold text-blue-500 cursor-pointer py-2 gap-2"
                            >
                              <FiUser size={14} /> Phân quyền User
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => onDelete(user.id)}
                              className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                            >
                              <FiXCircle size={14} /> Xóa tài khoản
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}