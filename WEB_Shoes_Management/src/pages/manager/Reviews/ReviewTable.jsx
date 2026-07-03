import { formatRelativeTime, formatDateTime, getImageUrl } from '~/utils/formatters'
import { FiStar, FiInfo, FiPackage, FiHome, FiEye, FiCheckCircle, FiXCircle, FiThumbsUp, FiThumbsDown } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { REVIEW_TYPES } from '~/utils/constant'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const ReviewTable = ({
  reviews,
  reviewType,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onResolveSingle
}) => {
  const handleToggleSelectAll = (e) => onSelectAll(e.target.checked)

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  // Lấy URL ảnh đại diện cho sản phẩm hoặc cửa hàng
  const getTargetImage = (review) => {
    if (reviewType === REVIEW_TYPES.PRODUCT) {
      // Lấy ảnh sản phẩm
      if (review.product_images) {
        return getImageUrl(review.product_images, 'https://placehold.co/80x80?text=Product')
      }
      return 'https://placehold.co/80x80?text=Product'
    } else {
      // Lấy logo cửa hàng
      if (review.store_logo) {
        return getImageUrl(review.store_logo, 'https://placehold.co/80x80?text=Store')
      }
      return 'https://placehold.co/80x80?text=Store'
    }
  }

  // Lấy tên hiển thị
  const getTargetName = (review) => {
    return reviewType === REVIEW_TYPES.PRODUCT ? review.product_name : review.store_name
  }

  // Lấy ID hiển thị
  const getTargetId = (review) => {
    return reviewType === REVIEW_TYPES.PRODUCT ? review.product_id : review.store_id
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
                  className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                  checked={reviews.length > 0 && selectedIds.length === reviews.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="py-4 px-4 min-w-[150px]">Người dùng</th>
              <th className="py-4 px-4 min-w-[220px]">
                {reviewType === REVIEW_TYPES.PRODUCT ? 'Sản phẩm' : 'Cửa hàng'}
              </th>
              <th className="py-4 px-4 text-center min-w-[100px]">Đánh giá</th>
              <th className="py-4 px-4 min-w-[250px]">Nội dung</th>
              <th className="py-4 px-4 text-center min-w-[130px]">Lý do tố cáo</th>
              <th className="py-4 px-4 text-center min-w-[150px]">Ngày tạo</th>
              <th className="py-4 px-4 text-center min-w-[100px]">Trạng thái</th>
              <th className="py-4 px-6 text-center min-w-[120px]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-16 text-gray-400 font-medium">
                  Không tìm thấy đánh giá bị tố cáo nào.
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const isChecked = selectedIds.includes(review.id)
                const targetImage = getTargetImage(review)
                const targetName = getTargetName(review)
                const targetId = getTargetId(review)

                // Lấy avatar người dùng
                const userAvatar = getImageUrl(
                  review.user_avatar,
                  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(review.user_name || 'User')}`
                )

                return (
                  <tr key={review.id} className={`hover:bg-gray-50/40 transition-colors duration-200 ${isChecked ? 'bg-brand-primary/5' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        checked={isChecked}
                        onChange={() => onSelectRow(review.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={userAvatar}
                          alt={review.user_name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900">{review.user_name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: #{review.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={targetImage}
                          alt={targetName}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-2 max-w-[200px]">
                            {targetName}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            ID: #{targetId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-[10px] text-gray-400">({review.rating} sao)</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-gray-600 line-clamp-2 max-w-[250px] cursor-help hover:text-gray-900">
                            {review.comment || 'Không có nội dung'}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-3">
                          <p className="whitespace-pre-wrap break-words">{review.comment || 'Không có nội dung'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 cursor-help">
                            <FiInfo size={10} />
                            Xem lý do
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs rounded-lg bg-gray-800 text-white text-xs border-none font-normal p-2">
                          <p className="font-semibold mb-1">Lý do tố cáo:</p>
                          <p>{review.report_reason || 'Không có lý do cụ thể'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{formatDateTime(review.created_at)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(review.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {review.is_active === 1 ? (
                        <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap">
                          ĐANG HIỂN THỊ
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap">
                          ĐÃ ẨN
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Link xem chi tiết */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={`/manager/reviews/${review.id}?type=${reviewType}`}
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
                              <FiCheckCircle size={13} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-100 min-w-[220px]">
                            {/* Phê duyệt tố cáo -> Ẩn đánh giá */}
                            <DropdownMenuItem
                              onClick={() => onResolveSingle?.(review.id, 'approved')}
                              className="text-xs font-bold text-green-600 cursor-pointer py-2.5 gap-2.5 hover:bg-green-50"
                            >
                              <FiThumbsUp size={14} />
                              <div className="flex flex-col items-start">
                                <span>Phê duyệt tố cáo</span>
                                <span className="text-[10px] font-normal text-gray-400">Ẩn đánh giá</span>
                              </div>
                            </DropdownMenuItem>

                            {/* Bác bỏ tố cáo -> Giữ nguyên đánh giá */}
                            <DropdownMenuItem
                              onClick={() => onResolveSingle?.(review.id, 'rejected')}
                              className="text-xs font-bold text-rose-500 cursor-pointer py-2.5 gap-2.5 hover:bg-rose-50"
                            >
                              <FiThumbsDown size={14} />
                              <div className="flex flex-col items-start">
                                <span>Bác bỏ tố cáo</span>
                                <span className="text-[10px] font-normal text-gray-400">Giữ nguyên đánh giá</span>
                              </div>
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