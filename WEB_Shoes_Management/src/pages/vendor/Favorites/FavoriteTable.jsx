import { getImageUrl, formatPrice, getFirstVariantImage } from '~/utils/formatters'
import { FiUsers, FiHeart } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'

export const FavoriteTable = ({ products, onViewUsers }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary/5 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-4 px-6">Thông tin sản phẩm</th>
              <th className="py-4 px-4 text-center">Danh mục</th>
              <th className="py-4 px-4 text-center">Giá bán</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-4 text-center">Lượt Yêu Thích</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-gray-400 font-medium">Chưa có sản phẩm nào phù hợp với bộ lọc.</td>
              </tr>
            ) : (
              products.map((p) => {
                let imageUrl = getFirstVariantImage(p)

                if (!imageUrl || imageUrl === 'https://placehold.co/100x100?text=No+Image') {
                  let imagesArray = []
                  try {
                    imagesArray = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
                  } catch (e) {
                    imagesArray = []
                  }
                  imageUrl = getImageUrl(imagesArray?.[0], 'https://placehold.co/100x100?text=Giay')
                }

                return (
                  <tr key={p.id} className="hover:bg-brand-primary/5 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col max-w-[220px]">
                          <span className="font-extrabold text-gray-900 truncate" title={p.name}>{p.name}</span>
                          <span className="text-[11px] text-gray-400 mt-0.5">Mã SP: #{p.id}</span>
                          {/* Hiển thị số lượng variants nếu có */}
                          {p.variants && p.variants.length > 0 && (
                            <span className="text-[10px] text-blue-400 font-semibold mt-0.5">
                              {p.variants.length} biến thể
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold">{p.category_name || 'Khác'}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-brand-primary font-black">{formatPrice(p.price)}</td>

                    {/* HIỂN THỊ TRẠNG THÁI */}
                    <td className="py-4 px-4 text-center">
                      {p.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[11px] font-bold border border-green-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Đang mở bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 text-[11px] font-bold border border-gray-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Đang tạm ẩn
                        </span>
                      )}
                    </td>

                    {/* CỘT LƯỢT YÊU THÍCH */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full border border-rose-100 font-black">
                        <FiHeart className="fill-current" size={14} /> {p.total_favorites}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onViewUsers(p.id, p.name)}
                            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-xl cursor-pointer active:scale-90 transition-all duration-200"
                          >
                            <FiUsers size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="font-semibold">Xem danh sách khách hàng</TooltipContent>
                      </Tooltip>
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