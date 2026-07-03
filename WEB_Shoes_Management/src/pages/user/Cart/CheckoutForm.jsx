import { FiTruck, FiCreditCard, FiUser, FiPhone, FiMapPin,
  FiSmartphone, FiDollarSign
} from 'react-icons/fi'

export const CheckoutForm = ({ register, errors, paymentMethod, setPaymentMethod }) => {
  return (
    <div className="space-y-6">
      {/* Khối 1: Thông tin người nhận */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 text-left">
        <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
          <FiTruck size={16} className="text-brand-primary" />
          <span>Thông tin giao hàng</span>
        </h3>

        <div className="space-y-3.5">
          {/* Họ và tên */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
              <FiUser size={13} />
              <span>Họ và tên người nhận</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              {...register('recipientName', { required: 'Vui lòng nhập họ tên người nhận.' })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-brand-primary outline-none transition-all"
            />
            {errors.recipientName && <p className="text-xs text-red-500 mt-1">{errors.recipientName.message}</p>}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
              <FiPhone size={13} />
              <span>Số điện thoại</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 0901234567"
              {...register('recipientPhone', {
                required: 'Vui lòng nhập số điện thoại.',
                pattern: { value: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ (Phải gồm 10 chữ số).' }
              })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-brand-primary outline-none transition-all"
            />
            {errors.recipientPhone && <p className="text-xs text-red-500 mt-1">{errors.recipientPhone.message}</p>}
          </div>

          {/* Địa chỉ nhận hàng */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
              <FiMapPin size={13} />
              <span>Địa chỉ nhận hàng chính xác</span>
            </label>
            <textarea
              rows={2}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
              {...register('shippingAddress', { required: 'Vui lòng điền địa chỉ giao hàng.' })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-brand-primary outline-none transition-all resize-none"
            />
            {errors.shippingAddress && <p className="text-xs text-red-500 mt-1">{errors.shippingAddress.message}</p>}
          </div>
        </div>
      </div>

      {/* Khối 2: Phương thức thanh toán rẽ nhánh */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 text-left">
        <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
          <FiCreditCard size={16} className="text-brand-primary" />
          <span>Phương thức thanh toán</span>
        </h3>

        <div className="space-y-2">
          {/* Lựa chọn COD */}
          <label className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 rounded-lg border border-green-100 shrink-0">
                <FiDollarSign size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-700">Thanh toán khi nhận hàng (COD)</span>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
              className="w-4 h-4 accent-brand-primary cursor-pointer shrink-0"
            />
          </label>

          {/* Lựa chọn VNPAY */}
          <label className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shrink-0">
                <FiCreditCard size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-700">Cổng thanh toán điện tử VNPay</span>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="VNPAY"
              checked={paymentMethod === 'VNPAY'}
              onChange={() => setPaymentMethod('VNPAY')}
              className="w-4 h-4 accent-brand-primary cursor-pointer shrink-0"
            />
          </label>

          {/* Lựa chọn MOMO */}
          <label className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'MOMO' ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center bg-pink-50 text-pink-600 rounded-lg border border-pink-100 shrink-0">
                <FiSmartphone size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-700">Ví điện tử MoMo</span>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="MOMO"
              checked={paymentMethod === 'MOMO'}
              onChange={() => setPaymentMethod('MOMO')}
              className="w-4 h-4 accent-brand-primary cursor-pointer shrink-0"
            />
          </label>
        </div>
      </div>
    </div>
  )
}