import { formatPrice, getImageUrl } from '~/utils/formatters'
import { FiMapPin, FiCalendar, FiTag, FiAlertCircle, FiHome } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { ORDER_STATUS } from '~/utils/constant'
import { motion } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'

export const OrderCard = ({ order, onCancelOrder, onWithdrawCancel, onReviewOrder }) => {
  // Render màu và text của badge trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
    case ORDER_STATUS.PENDING: return <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full text-xs">ĐƠN HÀNG MỚI</span>
    case ORDER_STATUS.PROCESSING: return <span className="text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">ĐANG XỬ LÝ</span>
    case ORDER_STATUS.SHIPPED: return <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs">ĐANG GIAO HÀNG</span>
    case ORDER_STATUS.DELIVERED: return <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">ĐÃ GIAO THÀNH CÔNG</span>
    case ORDER_STATUS.CANCELLED: return <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">ĐÃ HỦY</span>
    case ORDER_STATUS.CANCEL_REQUESTED: return <span className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs">ĐANG YÊU CẦU HỦY</span>
    default: return null
    }
  }

  // Hàm lấy ảnh từ item (ưu tiên variant_image)
  const getItemImage = (item) => {
    // Ưu tiên ảnh từ variant_image
    if (item.variant_image && item.variant_image.secure_url) {
      return item.variant_image.secure_url
    }
    // Fallback sang product_images
    if (item.product_images) {
      return getImageUrl(item.product_images, 'https://placehold.co/100x100?text=Product')
    }
    return 'https://placehold.co/100x100?text=Product'
  }

  const totalAmount = Number(order.total_amount) || 0
  const discountAmount = Number(order.discount_amount) || 0

  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
    >
      {/* Header đơn hàng */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          {order.store_logo?.secure_url ? (
            <img
              src={order.store_logo.secure_url}
              alt={order.store_name}
              className="w-6 h-6 rounded-full object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <FiHome size={20} className="text-brand-secondary" />
          )}

          <h3 className="font-bold text-brand-secondary text-base">{order.store_name}</h3>
          <Link to={`/store/${order.store_id}`} className="text-xs bg-white border border-gray-200 text-brand-primary px-2 py-0.5 rounded font-semibold transition-colors duration-300 hover:bg-brand-primary hover:text-white cursor-pointer">
            Xem Shop
          </Link>
          <span className="text-xs text-gray-400 border-l border-gray-300 pl-3 ml-1">Mã đơn: {order.order_id}</span>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusBadge(order.status)}
        </div>
      </div>

      <div className="p-5 flex flex-col lg:flex-row gap-6">
        {/* Danh sách sản phẩm (Bên trái) */}
        <div className="flex-1 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-6">
          {order.items.map((item, idx) => {
            const imageUrl = getItemImage(item)
            return (
              <div key={idx} className="flex gap-4 group">
                <Link
                  to={`/product/${item.slug}`}
                  className="shrink-0 overflow-hidden rounded-xl border border-gray-100 w-20 h-20 block relative"
                >
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    src={imageUrl}
                    alt={item.product_name}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                  {item.variant_image && (
                    <div className="absolute top-0 right-0 bg-brand-primary text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-lg">
                      VAR
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <Link to={`/product/${item.slug}`}>
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-2 transition-colors duration-300 ease-in-out hover:text-brand-primary cursor-pointer">
                      {item.product_name}
                    </h4>
                  </Link>

                  <p className="text-xs text-gray-500 mt-1">Phân loại: {item.color} / Size {item.size}</p>
                  <div className="mt-2 text-sm font-bold text-brand-primary">
                    {formatPrice(item.price)} <span className="text-gray-400 text-xs font-normal">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {order.applied_voucher && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-green-50 text-green-600 text-[11px] font-bold px-2 py-1 rounded border border-green-100">
              <FiTag size={12} />
              <span className="uppercase tracking-wider">Mã giảm giá: {order.applied_voucher}</span>
            </div>
          )}
        </div>

        {/* Thông tin vận chuyển và Tổng tiền (Bên phải) */}
        <div className="w-full lg:w-[350px] flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            <div className="flex gap-2 items-start">
              <FiMapPin className="text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-700">Địa chỉ nhận hàng:</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.recipient_name} - {order.recipient_phone}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{order.shipping_address}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <FiCalendar className="text-gray-400 shrink-0" />
              <p className="text-sm text-gray-500">
                Ngày đặt: <span className="font-bold text-gray-700">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5">
            {discountAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">
                  Tiết kiệm
                </span>
                <span className="text-sm font-bold text-green-600">
                  - {formatPrice(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-500 mb-1">Tổng cộng:</span>

              <div className="flex flex-col items-end">
                <span className="text-xl font-extrabold text-brand-primary">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 flex justify-end items-center gap-3 border-t border-gray-100">

        {order.status === ORDER_STATUS.CANCELLED && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-default">
                  <FiAlertCircle size={12} />
            Lý do hủy
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-center text-xs">
                {order?.cancel_reason ?? ''}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Link
          to={`/orders/${order.order_id}`}
          className="px-4 py-2 bg-white border border-brand-secondary text-gray-700 font-semibold rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-brand-secondary hover:text-white hover:border-brand-secondary cursor-pointer active:scale-95"
        >
    Xem chi tiết
        </Link>

        {order.status === ORDER_STATUS.PENDING && (
          <button
            onClick={() => onCancelOrder(order)}
            className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-[#c73652] cursor-pointer shadow-sm active:scale-95"
          >
      Hủy đơn hàng
          </button>
        )}

        {order.status === ORDER_STATUS.PROCESSING && (
          <button
            onClick={() => onCancelOrder(order)}
            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-orange-600 cursor-pointer shadow-sm active:scale-95"
          >
      Gửi yêu cầu hủy
          </button>
        )}

        {order.status === ORDER_STATUS.CANCEL_REQUESTED && (
          <button
            onClick={() => onWithdrawCancel(order.order_id)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-blue-700 cursor-pointer shadow-sm active:scale-95"
          >
      Rút yêu cầu hủy
          </button>
        )}

        {order.status === ORDER_STATUS.DELIVERED && (
          order.is_reviewed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block cursor-not-allowed">
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-100 text-gray-400 font-semibold rounded-lg text-sm border border-gray-200 pointer-events-none"
                    >
                Đã đánh giá
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-md">
                  <p>Bạn đã đánh giá đơn hàng này rồi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              onClick={() => onReviewOrder && onReviewOrder(order)}
              className="px-4 py-2 border border-brand-primary text-brand-primary font-semibold rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-brand-primary hover:text-white cursor-pointer shadow-sm active:scale-95"
            >
        Đánh giá ngay
            </button>
          )
        )}

        {(order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED) && (
          <Link
            to={`/product/${order.items[0]?.slug}`}
            className="px-4 py-2 flex items-center justify-center bg-brand-primary text-white font-semibold rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-[#c73652] cursor-pointer shadow-sm active:scale-95"
          >
      Mua lại
          </Link>
        )}
      </div>
    </motion.div>
  )
}