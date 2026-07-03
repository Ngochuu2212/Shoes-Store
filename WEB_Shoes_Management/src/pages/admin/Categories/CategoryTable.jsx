import { formatDateTime, getImageUrl } from '~/utils/formatters'
import {
  FiEye, FiEdit2, FiTrash2, FiMoreVertical,
  FiFolder, FiFolderPlus, FiCheckCircle, FiXCircle,
  FiToggleLeft, FiToggleRight
} from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '~/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

export const CategoryTable = ({
  categories,
  onToggleStatus,
  onDelete
}) => {
  const getStatusBadge = (isActive) => {
    return isActive === 1 ? (
      <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-black">
        <FiCheckCircle className="inline mr-1" size={10} />
        Đang hoạt động
      </span>
    ) : (
      <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-black">
        <FiXCircle className="inline mr-1" size={10} />
        Đã khóa
      </span>
    )
  }

  const getCategoryIcon = (parentId) => {
    return parentId ? (
      <FiFolderPlus size={14} className="text-purple-500" />
    ) : (
      <FiFolder size={14} className="text-emerald-500" />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-4 min-w-[200px]">Danh mục</th>
              <th className="py-4 px-4">Danh mục cha</th>
              <th className="py-4 px-4">Mô tả</th>
              <th className="py-4 px-4 text-center">Số sản phẩm</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-4 text-center">Ngày tạo</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const imageUrl = getImageUrl(category.image, null)

                return (
                  <tr key={category.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                            {getCategoryIcon(category.parent_id)}
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-gray-900 flex items-center gap-1.5">
                            {getCategoryIcon(category.parent_id)}
                            {category.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Slug: {category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">
                        {category.parent_name || 'Danh mục gốc'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-600 line-clamp-2 max-w-xs">
                        {category.description || 'Chưa có mô tả'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-blue-600">
                        {category.totalProducts || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center min-w-[150px]">
                      {getStatusBadge(category.is_active)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(category.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/admin/categories/${category.id}`}
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
                              <Link to={`/admin/categories/edit/${category.id}`}>
                                <FiEdit2 size={14} /> Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Toggle trạng thái - Truyền thêm tên danh mục */}
                            {category.is_active === 1 ? (
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(category.id, false, category.name)}
                                className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                              >
                                <FiToggleLeft size={14} /> Khóa danh mục
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(category.id, true, category.name)}
                                className="text-xs font-bold text-green-600 cursor-pointer py-2 gap-2"
                              >
                                <FiToggleRight size={14} /> Kích hoạt danh mục
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => onDelete(category.id)}
                              className="text-xs font-bold text-red-500 cursor-pointer py-2 gap-2"
                            >
                              <FiTrash2 size={14} /> Xóa danh mục
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