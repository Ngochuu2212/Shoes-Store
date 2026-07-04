import { FiTruck, FiCreditCard, FiUser, FiPhone, FiMapPin,
  FiSmartphone, FiDollarSign, FiToggleLeft, FiToggleRight, FiAlertCircle, FiZap, FiClock
} from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'

const SHIPPING_OPTIONS = [
  {
    value: 'standard',
    label: 'Tiêu chuẩn',
    time: '3 - 5 ngày',
    fee: 20000,
    icon: FiTruck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  {
    value: 'express',
    label: 'Nhanh',
    time: '1 - 2 ngày',
    fee: 40000,
    icon: FiZap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100'
  },
  {
    value: 'same_day',
    label: 'Hỏa tốc',
    time: 'Trong ngày',
    fee: 60000,
    icon: FiClock,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100'
  }
]

export const CheckoutForm = ({
  register, errors, paymentMethod, setPaymentMethod,
  walletBalance, walletAmountToUse, onWalletAmountChange, maxWalletAmount,
  shippingMethod, onShippingMethodChange
}) => {
  const canUseWallet = walletBalance > 0
  const isUsingWallet = walletAmountToUse > 0

  const handleToggleWallet = () => {
    if (isUsingWallet) {
      onWalletAmountChange(0)
    } else {
      onWalletAmountChange(Math.min(walletBalance, maxWalletAmount))
    }
  }

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

      {/* Khối 2: Đơn vị vận chuyển */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 text-left">
        <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
          <FiTruck size={16} className="text-brand-primary" />
          <span>Đơn vị vận chuyển</span>
        </h3>

        <div className="space-y-2">
          {SHIPPING_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = shippingMethod === option.value
            return (
              <label
                key={option.value}
                className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-brand-primary bg-brand-primary/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 flex items-center justify-center ${option.bgColor} ${option.color} rounded-lg border ${option.borderColor} shrink-0`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{option.label}</p>
                    <p className="text-[11px] text-gray-400">{option.time} &nbsp;•&nbsp; <span className="font-bold text-brand-primary">{formatPrice(option.fee)}</span></p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onShippingMethodChange(option.value)}
                  className="w-4 h-4 accent-brand-primary cursor-pointer shrink-0"
                />
              </label>
            )
          })}
        </div>
      </div>

      {/* Khối 3: Phương thức thanh toán rẽ nhánh */}
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

      {/* Khối 4: Số dư ví */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 text-left">
        <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
          <FiCreditCard size={16} className="text-brand-primary" />
          <span>Số dư ví</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Số dư hiện tại</p>
            <p className={`text-base font-extrabold mt-0.5 ${canUseWallet ? 'text-green-600' : 'text-gray-400'}`}>
              {formatPrice(walletBalance)}
            </p>
          </div>
          {canUseWallet && maxWalletAmount > 0 ? (
            <button
              type="button"
              onClick={handleToggleWallet}
              className="flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
              style={{ color: isUsingWallet ? '#e94560' : '#6b7280' }}
            >
              {isUsingWallet
                ? <><FiToggleRight size={22} className="text-brand-primary" /><span className="text-brand-primary">Đang dùng</span></>
                : <><FiToggleLeft size={22} /><span>Dùng ví</span></>
              }
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <FiAlertCircle size={13} />
              <span>{walletBalance <= 0 ? 'Ví trống' : 'Không đủ điều kiện'}</span>
            </div>
          )}
        </div>

        {isUsingWallet && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-green-700">Số tiền dùng từ ví:</label>
              <span className="text-xs font-extrabold text-green-700">-{formatPrice(walletAmountToUse)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.min(walletBalance, maxWalletAmount)}
              step={1000}
              value={walletAmountToUse}
              onChange={(e) => onWalletAmountChange(Number(e.target.value))}
              className="w-full accent-green-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0đ</span>
              <span>Tối đa: {formatPrice(Math.min(walletBalance, maxWalletAmount))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}