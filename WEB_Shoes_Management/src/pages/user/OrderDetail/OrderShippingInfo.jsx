import { FiCreditCard, FiMapPin, FiUser, FiPhone } from 'react-icons/fi'
import { PAYMENT_METHODS, PAYMENT_STATUS } from '~/utils/constant'

export const OrderShippingInfo = ({ order }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg space-y-6">
    <div className="space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <FiMapPin className="text-brand-primary" /> Thông tin giao hàng
      </h3>
      <div className="text-sm text-gray-600 space-y-2">
        <p className="flex items-center gap-2"><FiUser className="text-gray-400" /> {order.recipient_name}</p>
        <p className="flex items-center gap-2"><FiPhone className="text-gray-400" /> {order.recipient_phone}</p>
        <p className="flex items-start gap-2"><FiMapPin className="text-gray-400 mt-1" /> {order.shipping_address}</p>
      </div>
    </div>

    <div className="border-t pt-6 space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <FiCreditCard className="text-brand-primary" /> Thanh toán
      </h3>
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Phương thức:</span>
          <span className="font-semibold">{order.payment_method === PAYMENT_METHODS.COD ? 'Nhận tiền mặt (COD)' : order.payment_method}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Trạng thái:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.payment_status === PAYMENT_STATUS.PAID ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {order.payment_status === 'unpaid' ? 'Chưa thanh toán' : 'Đã thanh toán'}
          </span>
        </div>
      </div>
    </div>
  </div>
)