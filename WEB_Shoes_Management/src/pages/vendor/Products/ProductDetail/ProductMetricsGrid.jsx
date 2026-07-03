import { FiDollarSign, FiShoppingBag, FiStar, FiEye } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'
import { CountUp } from '~/components/common/CountUp'

export const ProductMetricsGrid = ({ product }) => {
  const metrics = [
    {
      title: 'Giá bán hiện tại',
      value: product.price,
      isPrice: true,
      icon: FiDollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      color: 'text-emerald-600'
    },
    {
      title: 'Tổng số lượng đã bán',
      value: product.sold,
      suffix: ' đôi',
      icon: FiShoppingBag,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      color: 'text-blue-600'
    },
    {
      title: 'Đánh giá trung bình',
      value: product.rating_avg,
      isRating: true,
      icon: FiStar,
      iconBg: 'bg-amber-50 text-amber-500 border border-amber-100',
      color: 'text-amber-500'
    },
    {
      title: 'Tổng lượt xem sản phẩm',
      value: product.view_count || 0,
      suffix: ' lượt',
      icon: FiEye,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item, idx) => (
        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
            <item.icon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <h3 className={`text-xl font-black mt-1 ${item.color}`}>
              {item.isPrice ? (
                <span>{formatPrice(item.value)}</span>
              ) : item.isRating ? (
                <span className="flex items-center gap-1.5">
                  <FiStar size={18} className="fill-current" />
                  {Number(item.value).toFixed(1)}
                </span>
              ) : (
                <CountUp value={item.value} suffix={item.suffix} />
              )}
            </h3>
          </div>
        </div>
      ))}
    </div>
  )
}